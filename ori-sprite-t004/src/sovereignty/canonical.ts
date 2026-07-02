/**
 * Canonical JSON + SHA-256 for the sovereignty receipt ledger.
 *
 * Follows the Build 001 crypto substrate rules (OUT-529, Brief 2 Addendum):
 * - SHA-256 via crypto.subtle only (browser + Node compatible, zero deps)
 * - async everywhere, even for in-memory operations
 * - hashes are computed over a deterministic JSON stringification
 *
 * Determinism rule used here: object keys sorted lexicographically at every
 * depth, arrays kept in order, no insignificant whitespace. If the executing
 * Forge finds a different canonicalization in ori-gateway/src/core/ledger.ts,
 * that one wins for ori-gateway; this ledger is self-contained, so internal
 * consistency is what matters for chain verification.
 */

export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value !== null && typeof value === "object") {
    const source = value as Record<string, unknown>;
    // Null-prototype accumulator + defineProperty so hostile keys like
    // "__proto__" serialize faithfully instead of silently vanishing —
    // otherwise two different objects could canonicalize identically.
    const sorted: Record<string, unknown> = Object.create(null);
    for (const key of Object.keys(source).sort()) {
      const v = source[key];
      if (v !== undefined) {
        Object.defineProperty(sorted, key, {
          value: sortValue(v),
          enumerable: true,
          writable: true,
          configurable: true,
        });
      }
    }
    return sorted;
  }
  return value;
}

export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
