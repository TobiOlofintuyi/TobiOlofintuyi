# BUILD_LOG — clause.ink/drop (Path A, Forge run)

Newest on top. Format:
`[YYYY-MM-DD HH:MM] | mission | area | files touched | what shipped | verified (y/n) | live url | blocked`

Project lives in **`clause-ink-site/`** (a subdirectory of this repo). These two
living files (`BUILD_LOG.md`, `ASSUMPTIONS.md`) sit at the repo root so they are
the first thing you see on the branch.

---

## Run summary (2026-07-02, ~06:10–06:26 UTC)

Shipped a fresh **Astro 5 + Tailwind 4** static site containing the **DROP hub**
(`/drop`) and a **client-side Data Rights Request Generator** with per-request
**SHA-256 hash receipts**. Build is green, all routes render, headless smoke
suite is **14/14 passing with zero console errors**. Deploy is a **logged
blocker**: no sprite CLI / sprites.dev auth exists in this environment, and
Tobi's correction forbids any public-host fallback — so local-verified is this
run's receipt. Exact commands to finish the private sprite deploy are below.

---

[2026-07-02 06:26] | M3 | deploy | (probe only) | Deploy attempt → **BLOCKED**. Probed for sprite tooling: no `sprite`/`sprites` binary on PATH, no `~/.config/sprite` or `~/.sprite*`, no `SPRITES_DEV`/deploy env tokens, and `@sprites.dev/cli` is not on npm. Per Tobi's 2026-07-02 correction, STOP after local verify; do NOT fall back to any public host. | n (deploy) / y (local) | — | No sprite CLI or sprites.dev auth on this cloud runner; see "DEPLOY — what remains" below.

[2026-07-02 06:25] | M3 | smoke-test | scratchpad/smoke.mjs (test harness, not shipped) | Headless Chromium (Playwright 1.56) smoke over served `dist/`: both routes load; generator matrix 3 rights × {CA,EU} = 6 letters each cite the correct statute and merge name+email; CA-delete surfaces DROP (callout + Delete Act cite); other-US-state fallback renders; log→receipt persists across reload (hash stable); email form submits (store-and-flag). **14/14 pass, 0 console errors.** | y | — | —

[2026-07-02 06:24] | M1/M2 | facts reconcile | src/data/letters.js, src/data/registry.json, src/pages/drop.astro | Reconciled copy + citations against a 5-agent verification workflow (web-checked July 2026). Broker count 545 (Jan)→**581** (Jun 2026); filers 215K→**300K+**; CA portability citation corrected off the stale `§1798.100(d)` to **`§1798.130(a)(2) & (a)(3)(B)`** (CPRA relocated it); DROP cite sharpened to `§§1798.99.80–.89 / §1798.99.86`; registry contacts refined (Discord→verified email, Spotify/PayPal/BeenVerified/Intelius URLs, Google Takeout deep-link params). All GDPR + other CA cites confirmed correct. | y | — | —

[2026-07-02 06:19] | M2 | generator | src/components/Generator.astro, src/data/letters.js, src/lib/receipts.js, src/data/registry.json | Data Rights Request Generator: 3 flows (REQUEST/DELETE/PORT) × 3 jurisdictions (CA CCPA/CPRA, EU/UK GDPR, other US state), free-text + 22-entry registry company picker, in-browser statute-cited letter, COPY + MAILTO + portal-link actions, localStorage request log with WebCrypto SHA-256 receipts (short-form, persists, re-verifiable). Correction right = labeled disabled stub. | y | — | —

[2026-07-02 06:19] | M1 | hub | src/pages/drop.astro, src/components/{CountdownAug1,EmailCapture,Scoreboard}.astro | `/drop` hub in the admiration→reveal→tool voice: DROP explainer, verification-gap reveal, 5-step filing walkthrough pointing at privacy.ca.gov/drop, Aug-1 penalty countdown, email capture (store-and-flag), Broker Honor Roll teaser (no fake data), verifier line tied to capture. | y | — | —

[2026-07-02 06:19] | M1/M2 | scaffold/build | package.json, astro.config.mjs, tsconfig.json, .gitignore, src/layouts/Base.astro, src/styles/global.css, src/pages/index.astro, public/{favicon.svg,robots.txt} | Fresh Astro 5.18.2 + Tailwind 4.3.2 static site (site: clause.ink, output: static, no third-party trackers/CDN fonts — GR-01). `npm run build` exits 0; renders `/` and `/drop`. | y | — | —

[2026-07-02 06:10] | M0 | baseline | (recon only) | **Ground-truth reconciliation.** Mandate assumed an existing `clause-ink-site/` Astro repo with 10 analysis routes on Tobi's Mac. Reality: this run is in the `TobiOlofintuyi/TobiOlofintuyi` GitHub *profile* repo (only `README.md`); GitHub scope is locked to it; the described Astro site + analysis routes are **not present**. Node 22 + npm 10 ARE available here, so this env CAN build. Decision (per "decide, build, log, never stop"): scaffold the site fresh and ship the real product. No analysis routes existed to preserve. | y | — | Described source repo absent; scaffolded fresh (see ASSUMPTIONS).

---

## DEPLOY — what remains (private sprite, per Tobi's 2026-07-02 correction)

Target is **sprites.dev, private (only-Tobi)** — NOT Cloudflare, and NOT any
public host. This cloud runner has **no sprite CLI and no sprites.dev auth**, so
the deploy cannot be executed here. The built site is ready at
`clause-ink-site/dist/` (static, 104K). On the Mac where the sprite CLI lives:

```bash
cd clause-ink-site
npm install
npm run build            # regenerates dist/  (already green here)

# then deploy dist/ to a PRIVATE sprite using your installed sprite CLI.
# Two patterns from the Sprite Stateful Database playbook:
#   (a) tar-bundle exec:  tar czf site.tgz -C dist . && <sprite-cli> exec ... (unpack + serve dist)
#   (b) Filesystem API push: <sprite-cli> fs push ./dist  →  serve as a static root
# Replace <sprite-cli> with the actual binary/subcommands on your Mac.
```

**Access-gating requirement (hard stop):** the surface must be visible to Tobi
and no one else — no public domain, no directory listing, access gated by the
sprite's own auth (token / allowlist). Before treating this as deployed, confirm
the sprite serves `dist/` behind auth. If sprites.dev cannot guarantee only-Tobi
access for a static surface, DO NOT deploy publicly — keep it local-only and note
the gap here. `public/robots.txt` already disallows all crawlers as a backstop.

**Verify-live checklist once served:** load `/` and `/drop` (zero console
errors), run one generator flow end-to-end (generate → copy → log → reload →
receipt persists), then paste the private URL into this log.
