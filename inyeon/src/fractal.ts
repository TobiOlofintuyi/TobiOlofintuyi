import type { FormId, InsightNode, Maturity } from './data'

// Deterministic fractal geometry, ported verbatim from the design's DCLogic.
// buildSkel(form) is pure and cheap; placeNodes is keyed by (form, node set).
// Both are memoized in logic.ts so layout cost is one-time, not per-render.

export interface Pt { x: number; y: number }
export interface Seg { a: Pt; b: Pt; gen: number }
export interface Slot { x: number; y: number; gen: number; dist: number }
export interface Skel { segs: Seg[]; slots: Slot[]; root: Pt }

// FNV-1a hash → deterministic pseudo-random in [0, 1).
export function h01(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 1000) / 1000
}

export function polar(C: Pt, angDeg: number, r: number): Pt {
  const a = (angDeg * Math.PI) / 180
  return { x: C.x + Math.cos(a) * r, y: C.y + Math.sin(a) * r }
}

type Spread = number | ((g: number) => number)

export function buildSkel(form: FormId): Skel {
  const segs: Seg[] = []
  const slots: Slot[] = []
  let root: Pt

  const rec = (
    from: Pt, ang: number, len: number, gen: number,
    spread: Spread, shrink: number, maxGen: number, key: string,
  ): void => {
    const to = polar(from, ang, len)
    segs.push({ a: from, b: to, gen })
    slots.push({ x: to.x, y: to.y, gen, dist: 0 })
    if (gen >= maxGen) return
    const j = (h01(key + gen + Math.round(from.x) + Math.round(from.y)) - 0.5) * 12
    const sp = typeof spread === 'function' ? spread(gen) : spread
    rec(to, ang - sp + j, len * shrink, gen + 1, spread, shrink, maxGen, key)
    rec(to, ang + sp + j, len * shrink, gen + 1, spread, shrink, maxGen, key)
  }

  if (form === 'tree') {
    root = { x: 500, y: 902 }
    rec(root, -90, 205, 1, (g) => 34 - g * 4, 0.7, 4, 't')
  } else if (form === 'river') {
    root = { x: 88, y: 500 }
    rec(root, 0, 250, 1, (g) => 11 + g * 6, 0.72, 4, 'r')
  } else {
    root = { x: 500, y: 236 }
    const carina = { x: 500, y: 372 }
    segs.push({ a: root, b: carina, gen: 0 })
    rec(carina, 126, 158, 1, (g) => 27 - g * 2, 0.68, 4, 'l')
    rec(carina, 54, 158, 1, (g) => 27 - g * 2, 0.68, 4, 'l')
  }

  slots.forEach((sl) => { sl.dist = Math.hypot(sl.x - root.x, sl.y - root.y) })
  return { segs, slots, root }
}

export function placeNodes(nodes: InsightNode[], skel: Skel): Record<string, Pt> {
  const { slots, root } = skel
  const byDist = [...slots].sort((a, b) => b.dist - a.dist)
  const n = byDist.length || 1
  const rings: Record<Maturity, Slot[]> = {
    evidenced: byDist.slice(0, Math.ceil(n / 3)),
    growing: byDist.slice(Math.ceil(n / 3), Math.ceil((2 * n) / 3)),
    bud: byDist.slice(Math.ceil((2 * n) / 3)),
  }
  const groups: Record<Maturity, InsightNode[]> = { evidenced: [], growing: [], bud: [] }
  nodes.forEach((nd) => groups[nd.m].push(nd))
  const ang = (p: Slot) => Math.atan2(p.y - root.y, p.x - root.x)
  const used = new Set<Slot>()
  const pos: Record<string, Pt> = {}
  ;(['evidenced', 'growing', 'bud'] as Maturity[]).forEach((m) => {
    const gs = groups[m]
    if (!gs.length) return
    const ring = (rings[m].length ? rings[m] : byDist).slice().sort((a, b) => ang(a) - ang(b))
    gs.forEach((nd, i) => {
      const idx = Math.min(ring.length - 1, Math.floor((i + 0.5) * ring.length / gs.length))
      let sl = ring[idx]
      for (let k = 0; k < ring.length && used.has(sl); k++) sl = ring[(idx + k) % ring.length]
      used.add(sl)
      pos[nd.id] = { x: sl.x, y: sl.y }
    })
  })
  return pos
}

export function segPath(form: FormId, a: Pt, b: Pt, key: string): string {
  const r = (v: number) => Math.round(v * 10) / 10
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const px = -dy / len
  const py = dx / len
  if (form === 'tree') {
    const cp = { x: mid.x + (b.x - 500) * 0.05, y: mid.y - 16 }
    return `M${r(a.x)} ${r(a.y)} Q${r(cp.x)} ${r(cp.y)} ${r(b.x)} ${r(b.y)}`
  }
  const o = (h01(key) - 0.5) * (form === 'river' ? 34 : 20)
  return `M${r(a.x)} ${r(a.y)} Q${r(mid.x + px * o)} ${r(mid.y + py * o)} ${r(b.x)} ${r(b.y)}`
}

export interface Tiers { thick: string; mid: string; thin: string }

export function tierPaths(form: FormId, skel: Skel): Tiers {
  const thick: string[] = []
  const mid: string[] = []
  const thin: string[] = []
  skel.segs.forEach((seg, i) => {
    const d = segPath(form, seg.a, seg.b, 's' + i)
    if (seg.gen <= 1) thick.push(d)
    else if (seg.gen === 2) mid.push(d)
    else thin.push(d)
  })
  return { thick: thick.join(' '), mid: mid.join(' '), thin: thin.join(' ') }
}
