# T-004 — Sprite `/receipts` + Sovereignty Ledger

Hash-chained, tamper-evident **agent-action receipt ledger** for the `ori-vault`
sprite (Fly app `ori-vault-tobi`). This folder is the **staged, test-verified
code** for Build Package **T-004**, reconstructed verbatim from the T-004 Notion
build package (Agent Dispatch Board → *Build Package · T-004 — Sprite /receipts
Sovereignty Ledger*, staged by **Sutdol**).

- `POST /receipts` — bearer-guarded; appends a receipt to the chain.
- `GET /receipts/{entry_id}` — **public**; returns a receipt so anyone can verify it.

Receipts are identified `SR-NNN` (`SR-001`, `SR-002`, …). Each entry is chained
to the previous by SHA-256, and the head position is anchored out-of-band in
Notion. Full design and verification path are documented in the source headers
(`src/sovereignty/ledger.ts`, `src/sovereignty/canonical.ts`) and the build
package.

## Status of this checkout

This is a **cloud staging checkout**, not the deploy. It carries the code so it
can be version-controlled and reviewed, then lifted into the real vault tree by
**Forge** (Claude Code on the Mac that holds `Projects/Clause/ORI/ori-sprite`).
The deploy, live probes, and Notion/board bookkeeping in the Definition of Done
require the Mac filesystem, the `fly` CLI, and `fly.dev` egress — none of which
exist in a cloud session (the same reason Sutdol staged rather than deployed).

**Verified here** (sandbox replica — Node 22.22, Hono 4.12, better-sqlite3
12.11, vitest 4.1, matching the build package's sandbox):

```
npm install
npm run typecheck   # tsc --noEmit → clean
npm test            # vitest run → 27 passed (27)
```

## File map

Internal paths mirror the vault's exactly, so this drops in without edits:

| This checkout | Drop-in target in `Projects/Clause/ORI/ori-sprite/` |
|---|---|
| `src/sovereignty/canonical.ts` | `src/sovereignty/canonical.ts` |
| `src/sovereignty/types.ts` | `src/sovereignty/types.ts` |
| `src/sovereignty/ledger.ts` | `src/sovereignty/ledger.ts` |
| `src/routes/sovereignty_receipts.ts` | `src/routes/sovereignty_receipts.ts` |
| `test/sovereignty.test.ts` | `test/sovereignty.test.ts` |
| `schema.sql` | append the block to the vault's `schema.sql` (doc copy — runtime DDL self-creates in the ledger constructor; keep the two in sync) |

`package.json`, `tsconfig.json`, `vitest.config.ts`, `.gitignore` here are the
**sandbox harness only** — they exist so the 27 tests run standalone. The vault
has its own; do not copy them over.

## Remaining work — Forge on the Mac (NOT doable from a cloud session)

Run top to bottom; every WHAT is fixed by the build package, you decide HOW.

1. **Preconditions P1–P5** (any failure → stop, post a blocker):
   - **P1 Right codebase** — `Projects/Clause/ORI/ori-sprite/fly.toml` must read
     `app = "ori-vault-tobi"`. *Three other folders are also named `ori-sprite` —
     known landmine.* **NOT** `Projects/Power/ori-sprite`, **NOT** the Inyeon backend.
   - **P2 Single machine** — `fly scale show -a ori-vault-tobi` count = 1 and
     `fly volumes list -a ori-vault-tobi` exactly one volume. Two machines with
     per-machine volumes would silently fork the chain.
   - **P3 Node ≥ 20** — check the Dockerfile `FROM` line (global `crypto.subtle`
     needs ≥ 19; better-sqlite3@12 needs ≥ 20). If pinned to 18, upgrade the base
     image or flag a blocker.
   - **P4 Mount is free** — nothing already served at unprefixed `/receipts`
     (existing egress receipts live under `/api/*`), and **no blanket
     `app.use("*")` auth** that would swallow the public GET.
   - **P5 Baseline probe** — `curl -sS -i https://ori-vault-tobi.fly.dev/receipts/SR-001`
     should 404 (machine may wake from suspend first); check local tree vs deploy
     drift (`fly releases` vs local git log).
2. Copy the source files to the paths above; append the schema block.
3. In the vault's **server entry**:
   - Construct the ledger with the **same** better-sqlite3 `Database` instance the
     vault already opens for `/data` — **do not open a second connection**:
     `const sovereigntyLedger = new SovereigntyReceiptLedger(db);`
   - Mount **exactly**:
     `app.route("/receipts", sovereigntyReceiptRoutes(sovereigntyLedger, { postGuard }));`
     where `postGuard` is the middleware exported by the vault's `src/auth.ts`
     (the same guard as `/api/*`). Only if `auth.ts` exports no reusable
     middleware, fall back to `bearerGuard(<vault's existing token env var>)`.
4. Run the vault's own test suite **plus** these 27 — everything green, no
   regressions.
5. `fly deploy` from `Projects/Clause/ORI/ori-sprite`; wake the machine with any GET.
6. **Definition of Done** — genesis ingestion (the exact `POST /receipts` curl in
   the build package, `payload_hash` `0836294c…`) returns `201` / `SR-001` /
   `predecessor "0"`; unauthenticated `GET /receipts/SR-001` → `200` with that
   `payload_hash` and the matching `ledger_hash`; unauthenticated `POST` → `401`.
7. **Close the loop (security-critical, not bookkeeping):** update the SR-001
   Action Receipt Notion page (`b49f5be2b3b14a388ad12fa863086a87`) with
   `entry_id`, `chain_position`, `predecessor_hash`, `ledger_hash` — the Notion
   mirror is the chain's only out-of-band anchor. Flip the T-004 Dispatch Board
   row to Done, add the outcome, append the work log.
8. **Follow-up (out of scope for this deploy):** graft the `agent_receipt` event
   kind into `ori-gateway/src/core/types.ts`, keeping ori-gateway's own envelope;
   if its canonicalization differs from sorted-keys, ori-gateway's rule wins there.

## How anyone verifies a receipt

1. `GET /receipts/{entry_id}` → the stored receipt (content + `entry_hash`,
   `predecessor_hash`, `ledger_hash`).
2. Recompute `entry_hash`: strip the three hash fields, canonical-JSON the rest
   (keys sorted at every depth, no whitespace), SHA-256.
3. Recompute `ledger_hash = SHA-256(entry_hash + "|" + predecessor_hash)`. Both
   must match.
4. Chain integrity: entry N's `predecessor_hash` = entry N−1's `ledger_hash`;
   genesis is `"0"`.
5. Independent anchor: compare `ledger_hash` against the receipt's Notion mirror.

> Receipts are **world-readable by design** (sequential `SR-NNN`, public GET).
> Never put private content in `content_summary` or action `target`/`url` fields.
