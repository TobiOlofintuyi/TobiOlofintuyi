# clause-ink-site

Static site for **clause.ink** — receipts for your agreements. This branch ships
the **DROP hub** and a **client-side Data Rights Request Generator**.

Astro 5 + Tailwind 4, `output: static`, `site: clause.ink`. No backend, no server
functions, no third-party trackers or CDN fonts. Everything the visitor does runs
in their browser; nothing leaves it except an action they fire themselves
(copy / mailto / form submit).

## Develop

```bash
npm install
npm run dev       # local dev server
npm run build     # -> dist/  (static)
npm run preview   # serve the build
```

## Routes

- `/` — landing.
- `/drop` — the DROP hub (explainer → filing walkthrough → the tool) with the
  **Data Rights Request Generator** embedded at `#generator`.

## Shape

```
src/
  layouts/Base.astro         sealed shell (no off-origin loads)
  pages/index.astro          landing
  pages/drop.astro           the hub (M1) + embeds the generator (M2)
  components/
    Generator.astro          the request generator UI + client logic
    CountdownAug1.astro       Aug-1-2026 penalty-switch countdown
    EmailCapture.astro        store-and-flag email capture (local only)
    Scoreboard.astro          Broker Honor Roll teaser (no fake data)
  data/
    registry.json            starter company registry (contacts + lastChecked)
    letters.js               statute-cited letter template engine (CA/EU/other)
  lib/
    receipts.js              WebCrypto SHA-256 request-log receipts (localStorage)
```

## The generator, briefly

Three rights (**request / delete / port**) × three jurisdictions (**CA CCPA/CPRA**,
**EU/UK GDPR**, **other US state**) × a company (registry or free text) → a
plain-English, statute-cited request letter you copy or email yourself. Every
request you log mints a SHA-256 **receipt** so you can prove the letter you sent is
the letter you logged. Those receipts are the future on-ramp to the Clause Ink
membrane ledger (hash-chained, signed) — deliberately not built here.

Templates and statute summaries are general information, not legal advice.

See `../BUILD_LOG.md` and `../ASSUMPTIONS.md` at the repo root for the build
receipts, the deploy blocker, and every decision made this run.
