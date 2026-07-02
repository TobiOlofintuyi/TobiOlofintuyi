import type { CSSProperties } from 'react'

// The design medium is inline CSS. To recreate it pixel-for-pixel we keep the
// exact declaration strings from the source and parse them into React style
// objects at render time. `s(...)` is the bridge: give it a CSS string
// (interpolating dynamic theme tokens) and it returns a typed style object.

const VENDOR = /^-(webkit|moz|ms|o)-/

function toReactProp(prop: string): string {
  const p = prop.trim()
  if (p.startsWith('--')) return p // CSS custom property — keep verbatim
  let key = p.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase())
  const m = VENDOR.exec(p)
  if (m && m[1] !== 'ms') {
    // React expects capitalized vendor prefixes (WebkitX, MozX, OX) — but `ms`
    // stays lowercase (msTransform).
    key = key.charAt(0).toUpperCase() + key.slice(1)
  }
  return key
}

export function s(css: string): CSSProperties {
  const out: Record<string, string> = {}
  // Split on top-level `;` only, so semicolons inside url()/gradient() (rare)
  // don't break declarations.
  const decls: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < css.length; i++) {
    const ch = css[i]
    if (ch === '(') depth++
    else if (ch === ')') depth = Math.max(0, depth - 1)
    else if (ch === ';' && depth === 0) {
      decls.push(css.slice(start, i))
      start = i + 1
    }
  }
  decls.push(css.slice(start))
  for (const decl of decls) {
    const idx = decl.indexOf(':')
    if (idx < 0) continue
    const prop = decl.slice(0, idx).trim()
    const val = decl.slice(idx + 1).trim()
    if (!prop || !val) continue
    out[toReactProp(prop)] = val
  }
  return out as CSSProperties
}
