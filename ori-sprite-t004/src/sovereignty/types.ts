/**
 * SovereigntyEvent extension for agent actions (T-004).
 *
 * The `agent_receipt` event kind extends the Build 001 SovereigntyEvent
 * pattern (hash-chained, SHA-256, genesis previous "0") with the agent-action
 * fields from the T-004 build spec (Architecture Decisions · OUT-1306).
 *
 * GRAFT NOTE for ori-gateway/src/core/types.ts: the executing Forge should
 * add `kind: 'agent_receipt'` to the SovereigntyEvent union there using the
 * AgentReceiptContent shape below, keeping ori-gateway's own id/hash/
 * previous_hash/signature envelope. This file is authoritative for the
 * ori-vault sprite only.
 */

export const AGENT_ACTION_TYPES = ["READ", "WRITE", "UPDATE", "DELETE"] as const;
export type AgentActionType = (typeof AGENT_ACTION_TYPES)[number];

export interface AgentAction {
  type: AgentActionType;
  target: string;
  url: string;
}

/** POST /receipts request body — exactly the T-004 spec input. */
export interface AgentReceiptInput {
  actor: string;
  model: string;
  session_id: string;
  /** Agent-declared ISO-8601 time of the work. */
  timestamp: string;
  actions: AgentAction[];
  content_summary: string;
  /** Agent's self-attested SHA-256 (hex) of its canonical payload string. */
  payload_hash: string;
  reversible: boolean;
}

/**
 * The content that gets hashed into entry_hash: every stored field EXCEPT
 * entry_hash, predecessor_hash, ledger_hash (Build 001 rule: hash over
 * deterministic JSON of event fields excluding the hash/chain fields).
 */
export interface AgentReceiptContent extends AgentReceiptInput {
  kind: "agent_receipt";
  entry_id: string;
  chain_position: number;
  /** Server ISO-8601 time the ledger accepted the entry. */
  received_at: string;
}

/** A full stored ledger entry. */
export interface AgentReceiptEntry extends AgentReceiptContent {
  /** SHA-256 of canonicalJson(AgentReceiptContent). */
  entry_hash: string;
  /** ledger_hash of the previous entry; "0" for the genesis entry. */
  predecessor_hash: string;
  /** SHA-256 of `${entry_hash}|${predecessor_hash}` — chain seal. */
  ledger_hash: string;
}

/** POST /receipts response — exactly the T-004 spec output. */
export interface AppendReceiptResponse {
  entry_id: string;
  chain_position: number;
  predecessor_hash: string;
  ledger_hash: string;
  /** Server confirmation time (= received_at). */
  timestamp: string;
}

export interface ChainVerification {
  valid: boolean;
  length: number;
  /** Populated when valid is false. */
  broken_at?: number;
  reason?: string;
}
