# Inyeon

> 인연 — *a place to return to yourself.*

A voice journal that listens, and grows with you. Inyeon keeps your words exactly
as you said them, reflects back what you said (a **mirror, not a guide**), and lets
insights grow into a living **fractal landscape** of intentions you're nurturing.

This is a from-scratch, production-oriented implementation of the canonical Inyeon
design ("the whole of Inyeon, one thread"), built as an **offline-first
Progressive Web App**. It is a faithful, pixel-level recreation of the design —
onboarding through insights, end to end — wired to a real state machine, on-device
storage, and PWA delivery.

## What's here

- **Onboarding** (welcome → what's different → a room of your own → plant an
  intention → rhythm → first reflection → breath → first mirror).
- **Journal** — speak or write; a breath while the mirror is readied.
- **Entries** — search, Newest / Held filters, the dog-ear fold.
- **The detail screen** — verbatim transcript with tappable evidence spans,
  feelings & mentions with drill-to-source, the OFNR mirror, the emerging insight,
  and a carried question that the entry can attach to.
- **Insights** — a **forest** of intentions, each a deterministic fractal
  (Tree / River / Lung); step in to a **landscape** of insight lights (open ·
  in practice · settled), open a node's question, log a practice, and follow any
  light back to the exact words it came from. Every door works both ways.
- **Settings** — intentions, appearance (Dark / Light, live re-theme), journal
  experience, rhythm, safety, and your data.

## The design laws it holds

- **Deterministic first** — the fractal geometry is a pure function of the form
  and the insight set; nothing is random at runtime.
- **A mirror, not a guide** — Inyeon surfaces what's in your words; meaning is
  always yours.
- **No numbers to the journaler** — degrowth counters (prompt dismissals,
  questions rested) live locally and are never surfaced as numbers. Three
  consecutive dismissals rest prompt delivery for seven days, shown only as a
  quiet, reversible note.
- **Dismissal costs nothing** — every prompt steps aside.
- **Your words stay yours** — entries and settings live on-device; when you
  delete, it is gone.

## Tech

- **React 18 + TypeScript + Vite**.
- **PWA** via `vite-plugin-pwa` (Workbox): offline-precached shell, installable,
  `theme-color` swapped per theme (`#0C0906` dark / `#F8F7F4` light).
- **On-device persistence** in IndexedDB (localStorage fallback).
- **Accessibility**: screen-reader labels on every insight node and control,
  focus-trapped overlays with Escape-to-close, 44px hit targets, and full
  `prefers-reduced-motion` support (transitions become opacity fades; the breath
  becomes a still ring; ambient motion pauses when the tab is hidden).

## Develop

```bash
npm install
npm run dev        # local dev server
npm run build      # typecheck + production build (outputs dist/)
npm run preview    # serve the production build
```

The build uses a **relative base** (`base: './'`), so `dist/` can be served from
any path — a static host, a subdirectory, or previewed from disk.

## Note on fonts

The type system is Source Serif 4 (voice), Outfit (UI), and IBM Plex Mono (labels),
loaded from Google Fonts with system fallbacks, so the app still reads well offline.
