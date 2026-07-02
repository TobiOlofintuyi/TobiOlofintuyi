/**
 * SovereigntyReceiptLedger — hash-chained, append-only agent-action receipts.
 *
 * Chain rules (reconciling the T-004 spec with the Build 001 substrate):
 * - entry_hash       = SHA-256(canonicalJson(content))
 *                      content = every stored field except entry_hash,
 *                      predecessor_hash, ledger_hash  (Build 001 rule)
 * - predecessor_hash = ledger_hash of the previous entry; "0" for genesis
 *                      (Build 001 genesis rule)
 * - ledger_hash      = SHA-256(`${entry_hash}|${predecessor_hash}`)
 *                      (the spec's "SHA-256 of this entry + predecessor",
 *                      made byte-precise: lowercase hex digests joined by "|")
 * - entry_id         = "SR-" + chain_position zero-padded to 3
 *                      (matches the established SR-001 naming)
 *
 * A class because it holds state (DB handle + append mutex) — the Build 001
 * "no classes where a function will do" rule permits exactly this.
 *
 * Appends are serialized through an in-process mutex: better-sqlite3 is
 * synchronous but hashing is async, so the read-tail → hash → insert sequence
 * must not interleave. HARD PRECONDITION: exactly one machine, one process,
 * one volume (verify with `fly scale show` before deploying — two machines
 * with per-machine volumes would silently fork the chain).
 *
 * Tamper-evidence, honestly stated:
 * - mid-chain edits, splices, reorders, and deletions: detected by verifyChain
 * - tail truncation / rollback / wipe: detected via the head-anchor table,
 *   which records the highest position ever issued in the same transaction
 *   as each append
 * - an attacker who rewrites BOTH tables consistently: NOT detectable from
 *   inside the box. The out-of-band anchor is the Notion mirror of each
 *   receipt (Decision 1's mirror format carries ledger_hash), which is
 *   exactly what the architecture prescribes.
 */
import type { Database } from "better-sqlite3";
import { canonicalJson, sha256Hex } from "./canonical.js";
import type {
  AgentReceiptContent,
  AgentReceiptEntry,
  AgentReceiptInput,
  AppendReceiptResponse,
  ChainVerification,
} from "./types.js";

const GENESIS_PREDECESSOR = "0";

const DDL = `
CREATE TABLE IF NOT EXISTS sovereignty_receipts (
  chain_position   INTEGER PRIMARY KEY,
  entry_id         TEXT    NOT NULL UNIQUE,
  actor            TEXT    NOT NULL,
  model            TEXT    NOT NULL,
  session_id       TEXT    NOT NULL,
  timestamp        TEXT    NOT NULL,
  actions_json     TEXT    NOT NULL,
  content_summary  TEXT    NOT NULL,
  payload_hash     TEXT    NOT NULL,
  reversible       INTEGER NOT NULL,
  received_at      TEXT    NOT NULL,
  entry_hash       TEXT    NOT NULL,
  predecessor_hash TEXT    NOT NULL,
  ledger_hash      TEXT    NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS sovereignty_ledger_head (
  id               INTEGER PRIMARY KEY CHECK (id = 1),
  head_position    INTEGER NOT NULL,
  head_ledger_hash TEXT    NOT NULL
)`;

interface Row {
  chain_position: number;
  entry_id: string;
  actor: string;
  model: string;
  session_id: string;
  timestamp: string;
  actions_json: string;
  content_summary: string;
  payload_hash: string;
  reversible: number;
  received_at: string;
  entry_hash: string;
  predecessor_hash: string;
  ledger_hash: string;
}

export function formatEntryId(chainPosition: number): string {
  return `SR-${String(chainPosition).padStart(3, "0")}`;
}

export async function computeEntryHash(content: AgentReceiptContent): Promise<string> {
  return sha256Hex(canonicalJson(content));
}

export async function computeLedgerHash(entryHash: string, predecessorHash: string): Promise<string> {
  return sha256Hex(`${entryHash}|${predecessorHash}`);
}

export class SovereigntyReceiptLedger {
  private db: Database;
  private appendQueue: Promise<unknown> = Promise.resolve();

  constructor(db: Database) {
    this.db = db;
    this.db.exec(DDL);
  }

  /** Append a receipt; serialized so chain reads and writes never interleave. */
  async append(input: AgentReceiptInput, now: () => string = isoNow): Promise<AppendReceiptResponse> {
    const run = this.appendQueue.then(() => this.appendUnlocked(input, now));
    // Keep the queue alive even when an append rejects.
    this.appendQueue = run.catch(() => undefined);
    return run;
  }

  private async appendUnlocked(input: AgentReceiptInput, now: () => string): Promise<AppendReceiptResponse> {
    const tail = this.db
      .prepare(
        "SELECT chain_position, ledger_hash FROM sovereignty_receipts ORDER BY chain_position DESC LIMIT 1",
      )
      .get() as Pick<Row, "chain_position" | "ledger_hash"> | undefined;

    const chain_position = (tail?.chain_position ?? 0) + 1;
    const predecessor_hash = tail?.ledger_hash ?? GENESIS_PREDECESSOR;

    const content: AgentReceiptContent = {
      kind: "agent_receipt",
      entry_id: formatEntryId(chain_position),
      chain_position,
      actor: input.actor,
      model: input.model,
      session_id: input.session_id,
      timestamp: input.timestamp,
      actions: input.actions,
      content_summary: input.content_summary,
      payload_hash: input.payload_hash,
      reversible: input.reversible,
      received_at: now(),
    };

    const entry_hash = await computeEntryHash(content);
    const ledger_hash = await computeLedgerHash(entry_hash, predecessor_hash);

    // Receipt row and head anchor commit atomically.
    this.db.transaction(() => {
      this.db
        .prepare(
          `INSERT INTO sovereignty_receipts (
             chain_position, entry_id, actor, model, session_id, timestamp,
             actions_json, content_summary, payload_hash, reversible,
             received_at, entry_hash, predecessor_hash, ledger_hash
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          content.chain_position,
          content.entry_id,
          content.actor,
          content.model,
          content.session_id,
          content.timestamp,
          JSON.stringify(content.actions),
          content.content_summary,
          content.payload_hash,
          content.reversible ? 1 : 0,
          content.received_at,
          entry_hash,
          predecessor_hash,
          ledger_hash,
        );
      this.db
        .prepare(
          `INSERT INTO sovereignty_ledger_head (id, head_position, head_ledger_hash)
           VALUES (1, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             head_position = excluded.head_position,
             head_ledger_hash = excluded.head_ledger_hash`,
        )
        .run(content.chain_position, ledger_hash);
    })();

    return {
      entry_id: content.entry_id,
      chain_position: content.chain_position,
      predecessor_hash,
      ledger_hash,
      timestamp: content.received_at,
    };
  }

  getByEntryId(entryId: string): AgentReceiptEntry | undefined {
    const row = this.db
      .prepare("SELECT * FROM sovereignty_receipts WHERE entry_id = ?")
      .get(entryId) as Row | undefined;
    return row ? rowToEntry(row) : undefined;
  }

  /** Recompute every hash from stored content and walk the chain. */
  async verifyChain(): Promise<ChainVerification> {
    const rows = this.db
      .prepare("SELECT * FROM sovereignty_receipts ORDER BY chain_position ASC")
      .all() as Row[];

    let expectedPredecessor = GENESIS_PREDECESSOR;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const entry = rowToEntry(row);
      if (row.chain_position !== i + 1) {
        return { valid: false, length: rows.length, broken_at: row.chain_position, reason: "chain_position not dense" };
      }
      if (entry.predecessor_hash !== expectedPredecessor) {
        return { valid: false, length: rows.length, broken_at: row.chain_position, reason: "predecessor_hash does not link to previous entry" };
      }
      const { entry_hash, predecessor_hash, ledger_hash, ...content } = entry;
      const recomputedEntryHash = await computeEntryHash(content);
      if (recomputedEntryHash !== entry_hash) {
        return { valid: false, length: rows.length, broken_at: row.chain_position, reason: "entry content does not match entry_hash" };
      }
      const recomputedLedgerHash = await computeLedgerHash(entry_hash, predecessor_hash);
      if (recomputedLedgerHash !== ledger_hash) {
        return { valid: false, length: rows.length, broken_at: row.chain_position, reason: "ledger_hash does not seal entry + predecessor" };
      }
      expectedPredecessor = ledger_hash;
    }

    // Head-anchor check: catches tail truncation, rollback, and wipe.
    const head = this.db
      .prepare("SELECT head_position, head_ledger_hash FROM sovereignty_ledger_head WHERE id = 1")
      .get() as { head_position: number; head_ledger_hash: string } | undefined;
    if (!head) {
      if (rows.length > 0) {
        return { valid: false, length: rows.length, broken_at: rows.length, reason: "head anchor missing" };
      }
      return { valid: true, length: 0 };
    }
    if (head.head_position !== rows.length) {
      return {
        valid: false,
        length: rows.length,
        broken_at: rows.length,
        reason: `tail truncated: head anchor expects position ${head.head_position}`,
      };
    }
    if (rows.length > 0 && head.head_ledger_hash !== rows[rows.length - 1].ledger_hash) {
      return { valid: false, length: rows.length, broken_at: rows.length, reason: "head anchor hash does not match tail entry" };
    }
    return { valid: true, length: rows.length };
  }
}

function rowToEntry(row: Row): AgentReceiptEntry {
  return {
    kind: "agent_receipt",
    entry_id: row.entry_id,
    chain_position: row.chain_position,
    actor: row.actor,
    model: row.model,
    session_id: row.session_id,
    timestamp: row.timestamp,
    actions: JSON.parse(row.actions_json),
    content_summary: row.content_summary,
    payload_hash: row.payload_hash,
    reversible: row.reversible === 1,
    received_at: row.received_at,
    entry_hash: row.entry_hash,
    predecessor_hash: row.predecessor_hash,
    ledger_hash: row.ledger_hash,
  };
}

function isoNow(): string {
  return new Date().toISOString();
}
