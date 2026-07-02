import Database from "better-sqlite3";
import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { canonicalJson, sha256Hex } from "../src/sovereignty/canonical.js";
import {
  SovereigntyReceiptLedger,
  computeEntryHash,
  computeLedgerHash,
  formatEntryId,
} from "../src/sovereignty/ledger.js";
import type { AgentReceiptInput } from "../src/sovereignty/types.js";
import { bearerGuard, sovereigntyReceiptRoutes } from "../src/routes/sovereignty_receipts.js";

const TOKEN = "test-vault-token";
const MAX_SUMMARY_FILL = 1_100_000; // pushes the JSON body past the 1MB guard

function sampleInput(overrides: Partial<AgentReceiptInput> = {}): AgentReceiptInput {
  return {
    actor: "strategist",
    model: "claude-sonnet-4-6",
    session_id: "test-session",
    timestamp: "2026-06-09T04:35:00Z",
    actions: [
      { type: "READ", target: "Session Log schema", url: "collection://e6acbf54" },
      { type: "WRITE", target: "SES row", url: "https://app.notion.com/p/37a7d7db189d8141" },
    ],
    content_summary: "Test receipt",
    payload_hash: "0836294c024a6d79795b5fac30ab6e3ff9a4d67f101392b930bd581d610e7fad",
    reversible: true,
    ...overrides,
  };
}

/** The real SR-001 payload from the Notion placeholder receipt (OUT-1304). */
const SR001_INPUT: AgentReceiptInput = {
  actor: "strategist",
  model: "claude-sonnet-4-6",
  session_id: "Claim-to-Evidence-Traversal-Amazon-BPI-Build",
  timestamp: "2026-06-09T04:35:00Z",
  actions: [
    { type: "READ", target: "Session Log schema", url: "collection://e6acbf54-5312-481b-82bd-09559ad8ebf6" },
    { type: "WRITE", target: "SES row", url: "https://app.notion.com/p/37a7d7db189d81418a80e50f54448820" },
    { type: "WRITE", target: "Resume — Paste & Decompose", url: "https://app.notion.com/p/37a7d7db189d814faa0ac758b558f6b2" },
    { type: "WRITE", target: "Skill · Claim-to-Evidence Traversal", url: "https://app.notion.com/p/37a7d7db189d81cfb56ce45da54c065d" },
    { type: "WRITE", target: "Traversal Map · Amazon BPI", url: "https://app.notion.com/p/37a7d7db189d81419fb8d806d9f8bc72" },
    { type: "WRITE", target: "Amazon Story Chassis", url: "https://app.notion.com/p/37a7d7db189d8193bef0cbc5e2ff764f" },
    { type: "WRITE", target: "Agentic PM Governance", url: "https://app.notion.com/p/37a7d7db189d812fb770fd7b0072703b" },
    { type: "WRITE", target: "Composable Context · Lenses", url: "https://app.notion.com/p/37a7d7db189d8190ab25d5a00b92e6a3" },
    { type: "UPDATE", target: "SES nav hub", url: "https://app.notion.com/p/37a7d7db189d81418a80e50f54448820" },
    { type: "WRITE", target: "Resume · Canonical", url: "https://app.notion.com/p/37a7d7db189d819f9ef2f5bab06ee5a5" },
    { type: "UPDATE", target: "Traversal Map (15 claims extracted)", url: "https://app.notion.com/p/37a7d7db189d81419fb8d806d9f8bc72" },
  ],
  content_summary:
    "Claim-to-Evidence Traversal · Amazon BPI Build — 11 actions, 15 claims extracted. Notion placeholder receipt SR-001, chain-linked by this entry.",
  payload_hash: "0836294c024a6d79795b5fac30ab6e3ff9a4d67f101392b930bd581d610e7fad",
  reversible: true,
};

describe("canonicalJson", () => {
  it("is key-order independent at every depth", () => {
    const a = { b: 1, a: { d: [1, { z: 1, y: 2 }], c: 2 } };
    const b = { a: { c: 2, d: [1, { y: 2, z: 1 }] }, b: 1 };
    expect(canonicalJson(a)).toBe(canonicalJson(b));
  });

  it("preserves array order", () => {
    expect(canonicalJson([1, 2])).not.toBe(canonicalJson([2, 1]));
  });

  it("serializes hostile __proto__ keys faithfully (no silent collision)", () => {
    const a = JSON.parse('{"__proto__":{"secret":"A"},"b":2}');
    const b = JSON.parse('{"__proto__":{"secret":"B"},"b":2}');
    expect(canonicalJson(a)).not.toBe(canonicalJson(b));
    expect(canonicalJson(a)).toContain("__proto__");
  });
});

describe("sha256Hex", () => {
  it("matches a known vector", async () => {
    expect(await sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});

describe("SovereigntyReceiptLedger", () => {
  let ledger: SovereigntyReceiptLedger;
  let db: InstanceType<typeof Database>;

  beforeEach(() => {
    db = new Database(":memory:");
    ledger = new SovereigntyReceiptLedger(db);
  });

  it("genesis entry: SR-001, position 1, predecessor '0'", async () => {
    const r = await ledger.append(sampleInput());
    expect(r.entry_id).toBe("SR-001");
    expect(r.chain_position).toBe(1);
    expect(r.predecessor_hash).toBe("0");
  });

  it("chains: entry N's predecessor_hash === entry N-1's ledger_hash", async () => {
    const r1 = await ledger.append(sampleInput());
    const r2 = await ledger.append(sampleInput({ session_id: "second" }));
    expect(r2.predecessor_hash).toBe(r1.ledger_hash);
    expect(r2.entry_id).toBe("SR-002");
  });

  it("ledger_hash = SHA-256(entry_hash|predecessor_hash)", async () => {
    const r = await ledger.append(sampleInput());
    const stored = ledger.getByEntryId("SR-001")!;
    expect(await computeLedgerHash(stored.entry_hash, stored.predecessor_hash)).toBe(r.ledger_hash);
  });

  it("entry_hash is recomputable from stored content (Build 001 rule)", async () => {
    await ledger.append(sampleInput());
    const { entry_hash, predecessor_hash, ledger_hash, ...content } = ledger.getByEntryId("SR-001")!;
    expect(await computeEntryHash(content)).toBe(entry_hash);
  });

  it("verifyChain passes on an honest ledger", async () => {
    for (let i = 0; i < 5; i++) await ledger.append(sampleInput({ session_id: `s${i}` }));
    expect(await ledger.verifyChain()).toEqual({ valid: true, length: 5 });
  });

  it("verifyChain detects content tampering at the exact position", async () => {
    for (let i = 0; i < 3; i++) await ledger.append(sampleInput({ session_id: `s${i}` }));
    db.prepare("UPDATE sovereignty_receipts SET content_summary = 'forged' WHERE chain_position = 2").run();
    const v = await ledger.verifyChain();
    expect(v.valid).toBe(false);
    expect(v.broken_at).toBe(2);
    expect(v.reason).toContain("entry_hash");
  });

  it("verifyChain detects a re-hashed splice (broken linkage)", async () => {
    for (let i = 0; i < 3; i++) await ledger.append(sampleInput({ session_id: `s${i}` }));
    // Attacker rewrites entry 2's content AND its hashes; link from 3 must break.
    const { entry_hash, predecessor_hash, ledger_hash, ...content } = ledger.getByEntryId("SR-002")!;
    const forgedContent = { ...content, content_summary: "forged" };
    const forgedEntryHash = await computeEntryHash(forgedContent);
    const forgedLedgerHash = await computeLedgerHash(forgedEntryHash, predecessor_hash);
    db.prepare(
      "UPDATE sovereignty_receipts SET content_summary = ?, entry_hash = ?, ledger_hash = ? WHERE chain_position = 2",
    ).run("forged", forgedEntryHash, forgedLedgerHash);
    const v = await ledger.verifyChain();
    expect(v.valid).toBe(false);
    expect(v.broken_at).toBe(3);
    expect(v.reason).toContain("predecessor_hash");
  });

  it("concurrent appends stay dense and verifiable", async () => {
    const results = await Promise.all(
      Array.from({ length: 10 }, (_, i) => ledger.append(sampleInput({ session_id: `parallel-${i}` }))),
    );
    const positions = results.map((r) => r.chain_position).sort((a, b) => a - b);
    expect(positions).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(await ledger.verifyChain()).toEqual({ valid: true, length: 10 });
  });

  it("formatEntryId pads to 3 and widens past 999", () => {
    expect(formatEntryId(1)).toBe("SR-001");
    expect(formatEntryId(42)).toBe("SR-042");
    expect(formatEntryId(1000)).toBe("SR-1000");
  });

  it("verifyChain detects tail truncation via the head anchor", async () => {
    for (let i = 0; i < 5; i++) await ledger.append(sampleInput({ session_id: `s${i}` }));
    db.prepare("DELETE FROM sovereignty_receipts WHERE chain_position = 5").run();
    const v = await ledger.verifyChain();
    expect(v.valid).toBe(false);
    expect(v.reason).toContain("truncated");
  });

  it("verifyChain detects rollback-to-genesis and full wipe", async () => {
    for (let i = 0; i < 3; i++) await ledger.append(sampleInput({ session_id: `s${i}` }));
    db.prepare("DELETE FROM sovereignty_receipts WHERE chain_position > 1").run();
    expect((await ledger.verifyChain()).valid).toBe(false);
    db.prepare("DELETE FROM sovereignty_receipts").run();
    const wiped = await ledger.verifyChain();
    expect(wiped.valid).toBe(false);
    expect(wiped.reason).toContain("truncated");
  });

  it("verifyChain detects a swapped tail hash via the head anchor", async () => {
    await ledger.append(sampleInput());
    db.prepare("UPDATE sovereignty_ledger_head SET head_ledger_hash = 'deadbeef' WHERE id = 1").run();
    const v = await ledger.verifyChain();
    expect(v.valid).toBe(false);
    expect(v.reason).toContain("head anchor");
  });

  it("empty ledger with no head anchor is valid", async () => {
    expect(await ledger.verifyChain()).toEqual({ valid: true, length: 0 });
  });
});

describe("HTTP routes (through the real parent mount)", () => {
  let app: Hono;
  let ledger: SovereigntyReceiptLedger;

  beforeEach(() => {
    ledger = new SovereigntyReceiptLedger(new Database(":memory:"));
    // Exactly the composition the vault's server entry will use.
    app = new Hono();
    app.route("/receipts", sovereigntyReceiptRoutes(ledger, { postGuard: bearerGuard(TOKEN) }));
  });

  const post = (body: unknown, auth?: string) =>
    app.request("/receipts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(auth ? { authorization: auth } : {}),
      },
      body: JSON.stringify(body),
    });

  it("POST without a token → 401, nothing written", async () => {
    const res = await post(sampleInput());
    expect(res.status).toBe(401);
    expect(ledger.getByEntryId("SR-001")).toBeUndefined();
  });

  it("POST with a wrong token → 401", async () => {
    expect((await post(sampleInput(), "Bearer wrong")).status).toBe(401);
  });

  it("POST valid → 201 with the exact spec response shape", async () => {
    const res = await post(sampleInput(), `Bearer ${TOKEN}`);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(Object.keys(body).sort()).toEqual(
      ["chain_position", "entry_id", "ledger_hash", "predecessor_hash", "timestamp"],
    );
    expect(body.entry_id).toBe("SR-001");
    expect(body.chain_position).toBe(1);
    expect(body.predecessor_hash).toBe("0");
    expect(body.ledger_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });

  it("POST rejects bad action type, bad hash, missing and unknown fields", async () => {
    const cases: [unknown, string][] = [
      [sampleInput({ actions: [{ type: "EXEC" as never, target: "x", url: "y" }] }), "actions[0].type"],
      [sampleInput({ payload_hash: "not-a-hash" }), "payload_hash"],
      [{ ...sampleInput(), actor: undefined }, "actor"],
      [{ ...sampleInput(), extra: 1 }, "unknown field: extra"],
      [sampleInput({ actions: [] }), "actions"],
      [sampleInput({ reversible: "yes" as never }), "reversible"],
      [sampleInput({ timestamp: "not-a-date" }), "timestamp"],
    ];
    for (const [body, needle] of cases) {
      const res = await post(body, `Bearer ${TOKEN}`);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(JSON.stringify(json.details)).toContain(needle);
    }
  });

  it("POST enforces strict ISO-8601 (lenient Date.parse formats are rejected)", async () => {
    for (const bad of ["2026", "01/01/2026", "June 9, 2026 04:35:00", "Thu, 01 Jan 2026 00:00:00 GMT"]) {
      const res = await post(sampleInput({ timestamp: bad }), `Bearer ${TOKEN}`);
      expect(res.status, `should reject: ${bad}`).toBe(400);
    }
    for (const good of ["2026-06-09T04:35:00Z", "2026-06-09T04:35:00.123Z", "2026-06-09T04:35:00+00:00"]) {
      const ledger2 = new SovereigntyReceiptLedger(new Database(":memory:"));
      const app2 = new Hono();
      app2.route("/receipts", sovereigntyReceiptRoutes(ledger2, { postGuard: bearerGuard(TOKEN) }));
      const res = await app2.request("/receipts", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${TOKEN}` },
        body: JSON.stringify(sampleInput({ timestamp: good })),
      });
      expect(res.status, `should accept: ${good}`).toBe(201);
    }
  });

  it("POST rejects oversized bodies with 413", async () => {
    const res = await post(
      sampleInput({ content_summary: "x".repeat(MAX_SUMMARY_FILL) }),
      `Bearer ${TOKEN}`,
    );
    expect(res.status).toBe(413);
  });

  it("bearerGuard throws at construction on empty/short/undefined tokens", () => {
    expect(() => bearerGuard("")).toThrow("misconfigured");
    expect(() => bearerGuard("short")).toThrow("misconfigured");
    expect(() => bearerGuard(undefined as never)).toThrow("misconfigured");
  });

  it("GET is public and returns the stored receipt with the same hash (spec verification path)", async () => {
    const posted = await (await post(SR001_INPUT, `Bearer ${TOKEN}`)).json();
    const res = await app.request(`/receipts/${posted.entry_id}`);
    expect(res.status).toBe(200);
    const entry = await res.json();
    expect(entry.payload_hash).toBe(SR001_INPUT.payload_hash);
    expect(entry.ledger_hash).toBe(posted.ledger_hash);
    expect(entry.predecessor_hash).toBe(posted.predecessor_hash);
    expect(entry.actions).toHaveLength(11);
  });

  it("GET unknown entry → 404", async () => {
    expect((await app.request("/receipts/SR-999")).status).toBe(404);
  });

  it("SR-001 ingestion: the real placeholder payload becomes the genesis chain entry", async () => {
    const res = await post(SR001_INPUT, `Bearer ${TOKEN}`);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.entry_id).toBe("SR-001");
    expect(body.predecessor_hash).toBe("0");
  });
});
