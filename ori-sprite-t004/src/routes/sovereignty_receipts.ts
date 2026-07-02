/**
 * T-004 routes. Internal paths are UNPREFIXED; mount the sub-app at
 * /receipts in the vault's server entry, exactly:
 *
 *     app.route("/receipts", sovereigntyReceiptRoutes(ledger, { postGuard }));
 *
 * The vault must not apply blanket app.use("*") auth middleware ahead of this
 * mount, or the public GET breaks.
 *
 * Auth posture (flagged assumption in the build package):
 * - POST /receipts is guarded by `postGuard` — in the real vault, pass the
 *   middleware exported by src/auth.ts (the same guard as /api/*). The
 *   bearerGuard() below is the reference guard used by the tests.
 *   (Writes are human- or consent-initiated: GR-01.)
 * - GET /receipts/:entry_id is public read-only per the spec ("Anyone with
 *   the entry_id can verify"). entry_ids are sequential (spec:
 *   "SR-{auto_increment}"), so receipts are WORLD-READABLE BY DESIGN —
 *   anyone can walk SR-001..SR-NNN. Do not put private content in
 *   content_summary or action targets/urls. This endpoint serves only
 *   sovereignty receipts — never vault documents.
 */
import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import { sha256Hex } from "../sovereignty/canonical.js";
import type { SovereigntyReceiptLedger } from "../sovereignty/ledger.js";
import { AGENT_ACTION_TYPES, type AgentReceiptInput } from "../sovereignty/types.js";

const MAX_ACTIONS = 200;
const MAX_TEXT = 4000;
const MAX_BODY_BYTES = 1_000_000;
const SHA256_HEX = /^[0-9a-f]{64}$/;
// Strict ISO-8601: date T time, optional fractional seconds, Z or ±HH:MM.
const ISO_8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
const ALLOWED_KEYS = new Set([
  "actor", "model", "session_id", "timestamp",
  "actions", "content_summary", "payload_hash", "reversible",
]);

export function sovereigntyReceiptRoutes(
  ledger: SovereigntyReceiptLedger,
  opts: { postGuard: MiddlewareHandler },
): Hono {
  const app = new Hono();

  app.post("/", opts.postGuard, async (c) => {
    const declared = Number(c.req.header("content-length") ?? "0");
    if (declared > MAX_BODY_BYTES) {
      return c.json({ error: "body too large" }, 413);
    }
    let body: unknown;
    try {
      const raw = await c.req.text();
      // UTF-16 units are a lower bound on UTF-8 bytes, so this cannot
      // under-reject; content-length above catches honest large clients
      // before the body is buffered.
      if (raw.length > MAX_BODY_BYTES) {
        return c.json({ error: "body too large" }, 413);
      }
      body = JSON.parse(raw);
    } catch {
      return c.json({ error: "body must be JSON" }, 400);
    }

    const result = validateInput(body);
    if (!result.ok) {
      return c.json({ error: "invalid receipt", details: result.errors }, 400);
    }

    const receipt = await ledger.append(result.value);
    return c.json(receipt, 201);
  });

  app.get("/:entry_id", (c) => {
    const entry = ledger.getByEntryId(c.req.param("entry_id"));
    if (!entry) {
      return c.json({ error: "not found" }, 404);
    }
    return c.json(entry, 200);
  });

  return app;
}

/**
 * Reference bearer guard. Fails loudly on misconfiguration (an unset env var
 * must never degrade to a guessable "Bearer undefined"). Comparison hashes
 * both sides first, so work is constant and independent of either length —
 * no early exit, no length oracle.
 */
export function bearerGuard(token: string): MiddlewareHandler {
  if (typeof token !== "string" || token.trim().length < 16) {
    throw new Error("bearer token misconfigured: need a string of >= 16 chars");
  }
  return async (c, next) => {
    const header = c.req.header("authorization") ?? "";
    if (!(await hashedEqual(header, `Bearer ${token}`))) {
      return c.json({ error: "unauthorized" }, 401);
    }
    await next();
  };
}

async function hashedEqual(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([sha256Hex(a), sha256Hex(b)]);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) {
    diff |= ha.charCodeAt(i) ^ hb.charCodeAt(i);
  }
  return diff === 0;
}

type Validation = { ok: true; value: AgentReceiptInput } | { ok: false; errors: string[] };

/**
 * Strict by contract: the body must contain exactly the eight spec fields
 * (unknown fields are rejected, not dropped — silently dropping fields from
 * a hashed receipt would be worse), actions must be non-empty, timestamp must
 * be strict ISO-8601 (it is hashed into the immutable chain), payload_hash
 * must be lowercase SHA-256 hex.
 */
function validateInput(body: unknown): Validation {
  const errors: string[] = [];
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, errors: ["body must be a JSON object"] };
  }
  const o = body as Record<string, unknown>;

  for (const key of Object.keys(o)) {
    if (!ALLOWED_KEYS.has(key)) errors.push(`unknown field: ${key}`);
  }
  for (const field of ["actor", "model", "session_id", "content_summary"] as const) {
    const v = o[field];
    if (typeof v !== "string" || v.length === 0) errors.push(`${field} must be a non-empty string`);
    else if (v.length > MAX_TEXT) errors.push(`${field} exceeds ${MAX_TEXT} chars`);
  }
  if (
    typeof o.timestamp !== "string" ||
    !ISO_8601.test(o.timestamp) ||
    !Number.isFinite(Date.parse(o.timestamp))
  ) {
    errors.push("timestamp must be a strict ISO-8601 string (e.g. 2026-06-09T04:35:00Z)");
  }
  if (typeof o.payload_hash !== "string" || !SHA256_HEX.test(o.payload_hash)) {
    errors.push("payload_hash must be a 64-char lowercase SHA-256 hex string");
  }
  if (typeof o.reversible !== "boolean") {
    errors.push("reversible must be a boolean");
  }
  if (!Array.isArray(o.actions) || o.actions.length === 0) {
    errors.push("actions must be a non-empty array");
  } else if (o.actions.length > MAX_ACTIONS) {
    errors.push(`actions exceeds ${MAX_ACTIONS} entries`);
  } else {
    o.actions.forEach((a, i) => {
      if (a === null || typeof a !== "object" || Array.isArray(a)) {
        errors.push(`actions[${i}] must be an object`);
        return;
      }
      const act = a as Record<string, unknown>;
      for (const key of Object.keys(act)) {
        if (!["type", "target", "url"].includes(key)) errors.push(`actions[${i}] unknown field: ${key}`);
      }
      if (!AGENT_ACTION_TYPES.includes(act.type as never)) {
        errors.push(`actions[${i}].type must be one of ${AGENT_ACTION_TYPES.join("|")}`);
      }
      for (const field of ["target", "url"] as const) {
        const v = act[field];
        if (typeof v !== "string") errors.push(`actions[${i}].${field} must be a string`);
        else if (v.length > MAX_TEXT) errors.push(`actions[${i}].${field} exceeds ${MAX_TEXT} chars`);
      }
    });
  }

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      actor: o.actor as string,
      model: o.model as string,
      session_id: o.session_id as string,
      timestamp: o.timestamp as string,
      actions: o.actions as AgentReceiptInput["actions"],
      content_summary: o.content_summary as string,
      payload_hash: o.payload_hash as string,
      reversible: o.reversible as boolean,
    },
  };
}
