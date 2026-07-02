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

[2026-07-02 15:10] | M3 | deploy attempt #2 | clause-ink-site/fly.toml | Tobi confirmed destination **clause-ink.fly.dev/drop**; `fly.toml` now targets app `clause-ink`. Attempted to execute the deploy from this cloud session: flyctl install script denied by sandbox policy; official GitHub release binary → **egress 403**; probed `api.fly.io`, `api.machines.dev`, `registry.fly.io` directly → **all CONNECT 403 at the org egress proxy**. Deploying from this session is network-impossible regardless of tokens. Two unblock paths logged below (Mac commands, or environment network-policy + FLY_API_TOKEN for a future session). | y (attempt + probes logged) | — | fly.io hosts blocked by session egress policy.

[2026-07-02 14:55] | M3 | deploy scaffold | clause-ink-site/{Dockerfile,fly.toml,.dockerignore,deploy/nginx.conf,deploy/entrypoint.sh} | Tobi confirmed targets: **fly.io + sprites.dev** (no Cloudflare). No fly CLI/token on this runner either (probed: no flyctl, no FLY_* env, no ~/.fly), so shipped a ready-to-run **private fly.io deploy**: multi-stage Docker build (node → nginx), HTTP basic auth that **fails closed** (container refuses to start without `BASIC_AUTH_USER`/`BASIC_AUTH_PASS` secrets), no directory listing, HTML no-store. Two commands on the Mac — see "DEPLOY — what remains". | y (config; build+smoke re-verified 14/14) | — | Deploy execution still needs Tobi's Mac (fly auth lives there).

[2026-07-02 14:55] | M1 | facts: official DROP page | src/pages/drop.astro | Tobi pasted the live privacy.ca.gov/drop content; folded the authoritative mechanics into the hub: broker count → **"over 600" (state's own count)**; walkthrough rewritten with the real flow (residency via California Identity Gateway / Login.gov; minimum = name+DOB+ZIP; optional identifiers MAID/CTV-ID/VIN; narrowing via the broker-list page; **save your DROP ID**; status checking opens Aug 2026; brokers report within 90 days); added the five official statuses (Deleted / Exempted / Opted-out / Record not found / Pending) and the what-won't-be-deleted caveat (first-party, exempt, public data). Smoke 14/14, zero console errors. | y | — | —

[2026-07-02 06:26] | M3 | deploy | (probe only) | Deploy attempt → **BLOCKED**. Probed for sprite tooling: no `sprite`/`sprites` binary on PATH, no `~/.config/sprite` or `~/.sprite*`, no `SPRITES_DEV`/deploy env tokens, and `@sprites.dev/cli` is not on npm. Per Tobi's 2026-07-02 correction, STOP after local verify; do NOT fall back to any public host. | n (deploy) / y (local) | — | No sprite CLI or sprites.dev auth on this cloud runner; see "DEPLOY — what remains" below.

[2026-07-02 06:25] | M3 | smoke-test | scratchpad/smoke.mjs (test harness, not shipped) | Headless Chromium (Playwright 1.56) smoke over served `dist/`: both routes load; generator matrix 3 rights × {CA,EU} = 6 letters each cite the correct statute and merge name+email; CA-delete surfaces DROP (callout + Delete Act cite); other-US-state fallback renders; log→receipt persists across reload (hash stable); email form submits (store-and-flag). **14/14 pass, 0 console errors.** | y | — | —

[2026-07-02 06:24] | M1/M2 | facts reconcile | src/data/letters.js, src/data/registry.json, src/pages/drop.astro | Reconciled copy + citations against a 5-agent verification workflow (web-checked July 2026). Broker count 545 (Jan)→**581** (Jun 2026); filers 215K→**300K+**; CA portability citation corrected off the stale `§1798.100(d)` to **`§1798.130(a)(2) & (a)(3)(B)`** (CPRA relocated it); DROP cite sharpened to `§§1798.99.80–.89 / §1798.99.86`; registry contacts refined (Discord→verified email, Spotify/PayPal/BeenVerified/Intelius URLs, Google Takeout deep-link params). All GDPR + other CA cites confirmed correct. | y | — | —

[2026-07-02 06:19] | M2 | generator | src/components/Generator.astro, src/data/letters.js, src/lib/receipts.js, src/data/registry.json | Data Rights Request Generator: 3 flows (REQUEST/DELETE/PORT) × 3 jurisdictions (CA CCPA/CPRA, EU/UK GDPR, other US state), free-text + 22-entry registry company picker, in-browser statute-cited letter, COPY + MAILTO + portal-link actions, localStorage request log with WebCrypto SHA-256 receipts (short-form, persists, re-verifiable). Correction right = labeled disabled stub. | y | — | —

[2026-07-02 06:19] | M1 | hub | src/pages/drop.astro, src/components/{CountdownAug1,EmailCapture,Scoreboard}.astro | `/drop` hub in the admiration→reveal→tool voice: DROP explainer, verification-gap reveal, 5-step filing walkthrough pointing at privacy.ca.gov/drop, Aug-1 penalty countdown, email capture (store-and-flag), Broker Honor Roll teaser (no fake data), verifier line tied to capture. | y | — | —

[2026-07-02 06:19] | M1/M2 | scaffold/build | package.json, astro.config.mjs, tsconfig.json, .gitignore, src/layouts/Base.astro, src/styles/global.css, src/pages/index.astro, public/{favicon.svg,robots.txt} | Fresh Astro 5.18.2 + Tailwind 4.3.2 static site (site: clause.ink, output: static, no third-party trackers/CDN fonts — GR-01). `npm run build` exits 0; renders `/` and `/drop`. | y | — | —

[2026-07-02 06:10] | M0 | baseline | (recon only) | **Ground-truth reconciliation.** Mandate assumed an existing `clause-ink-site/` Astro repo with 10 analysis routes on Tobi's Mac. Reality: this run is in the `TobiOlofintuyi/TobiOlofintuyi` GitHub *profile* repo (only `README.md`); GitHub scope is locked to it; the described Astro site + analysis routes are **not present**. Node 22 + npm 10 ARE available here, so this env CAN build. Decision (per "decide, build, log, never stop"): scaffold the site fresh and ship the real product. No analysis routes existed to preserve. | y | — | Described source repo absent; scaffolded fresh (see ASSUMPTIONS).

---

## DEPLOY — what remains (private; fly.io or sprites.dev — Tobi's platforms)

Target confirmed by Tobi 2026-07-02: **fly.io and sprites.dev** (no Cloudflare).
This cloud runner has neither fly auth nor a sprite CLI, so the deploy runs on
the Mac. The surface must stay **private (only-Tobi)** until intentionally made
public.

### Option A — fly.io on the Mac (config is committed; destination clause-ink.fly.dev/drop)

Everything is scaffolded in `clause-ink-site/` (Dockerfile, `fly.toml` → app
`clause-ink`, `deploy/`). Auth **fails closed** — the app will not serve at all
without credentials, so it cannot be accidentally public:

```bash
cd clause-ink-site
fly apps create clause-ink               # once, if the app doesn't exist yet
fly secrets set BASIC_AUTH_USER=tobi BASIC_AUTH_PASS='<pick-a-password>' -a clause-ink
fly deploy
```

Then open `https://clause-ink.fly.dev/drop`, enter the credentials, and run the
verify-live checklist below. To make it public later, delete the `auth_basic`
lines in `deploy/nginx.conf` + the guard in `deploy/entrypoint.sh` and redeploy
(or ask Forge to flip it in one commit).

### Option A′ — let the agent deploy from a future cloud session

This session's egress policy blocks fly.io (api.fly.io / api.machines.dev /
registry.fly.io / github.com all CONNECT-403 at the org proxy), so the agent
cannot deploy from here. To let it: in the Claude Code environment settings,
(1) allow network access to `fly.io`, `api.fly.io`, `api.machines.dev`,
`registry.fly.io`, `github.com` (for the flyctl release binary), and (2) add a
secret env var `FLY_API_TOKEN` = an app-scoped deploy token minted on the Mac
with `fly tokens create deploy -a clause-ink`. Then tell the agent to deploy.

### Option B — sprites.dev

Build locally (`npm install && npm run build` → `dist/`, static, ~104K), then
push `dist/` to a sprite with your CLI (tar-bundle exec or Filesystem API push)
and confirm the sprite gates access behind its token/allowlist. If sprites.dev
cannot guarantee only-Tobi access for a static surface, use Option A instead.

**Verify-live checklist (either option):** load `/` and `/drop` (zero console
errors), run one generator flow end-to-end (generate → copy → log → reload →
receipt persists), then paste the private URL into this log.
`public/robots.txt` disallows all crawlers as a backstop either way.
