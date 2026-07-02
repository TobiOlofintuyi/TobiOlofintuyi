-- T-004 · Sovereignty receipt ledger (agent actions)
-- Additive: its own tables, its own chain. The existing egress-receipt ledger
-- in the vault keeps its own semantics and is not touched.
-- NOTE: this file is the documentation copy for the vault's schema.sql;
-- the authoritative runtime DDL is the constructor of
-- src/sovereignty/ledger.ts. Keep the two in sync.
CREATE TABLE IF NOT EXISTS sovereignty_receipts (
  chain_position   INTEGER PRIMARY KEY,   -- 1-based, dense, append-only
  entry_id         TEXT    NOT NULL UNIQUE, -- 'SR-001', 'SR-002', ...
  actor            TEXT    NOT NULL,
  model            TEXT    NOT NULL,
  session_id       TEXT    NOT NULL,
  timestamp        TEXT    NOT NULL,      -- agent-declared ISO-8601
  actions_json     TEXT    NOT NULL,      -- JSON array of {type,target,url}
  content_summary  TEXT    NOT NULL,
  payload_hash     TEXT    NOT NULL,      -- agent's self-attested SHA-256 hex
  reversible       INTEGER NOT NULL,      -- 0 | 1
  received_at      TEXT    NOT NULL,      -- server ISO-8601
  entry_hash       TEXT    NOT NULL,      -- SHA-256(canonical content)
  predecessor_hash TEXT    NOT NULL,      -- previous ledger_hash, genesis '0'
  ledger_hash      TEXT    NOT NULL UNIQUE -- SHA-256(entry_hash|predecessor_hash)
);

-- Head anchor: highest position ever issued + its ledger_hash, updated in the
-- same transaction as every append. Lets verifyChain() detect tail
-- truncation, rollback, and wipe — not just mid-chain edits. An attacker who
-- rewrites BOTH tables still passes; the out-of-band anchor is the Notion
-- mirror of each receipt (Decision 1's mirror format carries ledger_hash).
CREATE TABLE IF NOT EXISTS sovereignty_ledger_head (
  id               INTEGER PRIMARY KEY CHECK (id = 1),
  head_position    INTEGER NOT NULL,
  head_ledger_hash TEXT    NOT NULL
);
