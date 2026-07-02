/*
 * receipts.js — the receipts thesis, in miniature.
 *
 * Every request a person logs mints a plain hash receipt: a SHA-256 of the
 * canonical request JSON, computed in the browser via WebCrypto, shown
 * short-form. It lets a person prove the letter they sent is the letter they
 * logged, and track what they filed and when. Nothing leaves the browser (GR-01).
 *
 * FUTURE ON-RAMP: these standalone hash receipts are the seed of the Clause Ink
 * "membrane ledger" — a hash-chained, signed log where each receipt commits to
 * the one before it, so the whole history is tamper-evident, not just each entry.
 * That ledger is a deliberate NON-goal for this run; we mint the leaves now and
 * chain them later.
 */

const LOG_KEY = 'clause.ink/drop/request-log/v1';

/** SHA-256 of a string, returned as lowercase hex. */
export async function sha256Hex(text) {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Short-form display of a hash: first 6 + last 4, e.g. "a1b2c3…9f0a". */
export function shortHash(hex) {
  if (!hex || hex.length < 12) return hex || '';
  return `${hex.slice(0, 6)}…${hex.slice(-4)}`;
}

/** Read the full request log (newest-first) from localStorage. */
export function readLog() {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLog(entries) {
  localStorage.setItem(LOG_KEY, JSON.stringify(entries));
}

/**
 * Append a logged request and mint its receipt.
 * @param {object} entry { company, right, jurisdiction, date, subject, body }
 * @param {string} canonical the canonical JSON string that was hashed
 * @returns {Promise<object>} the stored record including hash + shortHash
 */
export async function appendLog(entry, canonical) {
  const hash = await sha256Hex(canonical);
  const record = {
    id: hash.slice(0, 12),
    company: entry.company,
    right: entry.right,
    jurisdiction: entry.jurisdiction,
    date: entry.date,
    subject: entry.subject,
    hash,
    shortHash: shortHash(hash),
  };
  const entries = readLog();
  entries.unshift(record);
  writeLog(entries);
  return record;
}

/** Remove one entry by hash. */
export function removeLog(hash) {
  writeLog(readLog().filter((e) => e.hash !== hash));
}

/** Clear the whole log. */
export function clearLog() {
  localStorage.removeItem(LOG_KEY);
}

/**
 * Re-verify a receipt: recompute the hash from a re-canonicalised request and
 * confirm it still matches the stored hash. Lets a person prove the letter they
 * hold is the letter they logged.
 */
export async function verifyReceipt(storedHash, canonical) {
  return (await sha256Hex(canonical)) === storedHash;
}
