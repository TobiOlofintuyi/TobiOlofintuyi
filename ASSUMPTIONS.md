# ASSUMPTIONS — clause.ink/drop (Path A, Forge run)

Newest on top. Format:
`[YYYY-MM-DD HH:MM] | decision | what I chose | why | what would change it`

Every call I made without stopping to ask, so you can audit on wake.

---

[2026-07-02 06:26] | **Deploy target = sprites.dev, private; blocked → local verify** | Attempted a private sprite deploy per your correction; no sprite CLI/auth exists on this runner, so I stopped after local verification instead of using any public host. | Your correction is explicit: private-only, no public fallback, STOP + log if only-Tobi access can't be guaranteed. It can't be executed from here at all. | You run the deploy on the Mac where the sprite CLI lives (commands in BUILD_LOG), confirming the sprite gates access to you alone.

[2026-07-02 06:24] | **Used live facts over the mandate's stated figures** | Broker count → **581** (Jun 2026 record; ~545 was the Jan 2026 launch number); filers → **300K+** (Jun 2026; ~215K was the launch-weeks figure). Kept both the launch baseline and the current number in copy. | The mandate says re-check dates/penalty and, if anything moved, use the live fact and log the delta. A 5-agent web-verification pass (July 2026) confirmed the movement. Aug 1 2026 / $200-per-request-per-day / no-cure are all still CONFIRMED. | Newer CalPrivacy numbers; re-run the verify workflow at copywriting time.

[2026-07-02 06:24] | **Corrected CA portability citation** | Cite `Cal. Civ. Code § 1798.130(a)(2) & (a)(3)(B)` for portability — NOT `§ 1798.100(d)`. | Adversarial verify caught that under the CPRA-amended code, `§ 1798.100(d)` now governs third-party contract terms; the portable/readily-usable-format duty was relocated to `§ 1798.130`. All other CA/GDPR cites verified correct. | A future code amendment relocating the delivery-format duty again.

[2026-07-02 06:20] | **"No cure period" kept plain in copy** | Copy states the $200/day penalty has "no cure period." | Verified correct: the Delete Act has no statutory right-to-cure. There is an optional one-time 45-day broker extension (with notice + reason) and CalPrivacy settlement discretion, but neither is a cure — not worth caveating in a plain-English hero. | If a reader needs the extension nuance, add a footnote; the letter/hub stay plain.

[2026-07-02 06:19] | **Company registry = 22 seed entries, web-checked 2026-07-02** | Google, Meta, Instagram, Amazon, Apple, Microsoft, TikTok, Netflix, Spotify, Uber, LinkedIn, X, Reddit, Discord, PayPal + 7 brokers (Spokeo, Whitepages, BeenVerified, Acxiom, Intelius, Oracle, Epsilon). Contacts = published privacy portals/emails; each marked `lastChecked`. | Mandate seeds ~15–25 top services and flags the exact list as an OPEN FLAG. Most contacts confirmed via a verification agent; I preferred stable self-serve portals over guessed emails. | **OPEN FLAG:** Oracle + Epsilon were NOT re-confirmed in the pass; and any single contact should be re-verified before being treated as authoritative. Swap `src/data/registry.json`.

[2026-07-02 06:19] | **Email capture = store-and-flag (localStorage), one declared seam** | Submissions are stored only in the visitor's browser; nothing outbound. The single future outbound seam is `submitToProvider()` in `EmailCapture.astro` — currently a no-op returning false. | No email provider is configured in the repo, and your correction says email capture stays local until you make the surface public. GR-01: nothing leaves the browser. | **OPEN FLAG (provider gap):** pick a provider (Buttondown/ConvertKit/etc.) and implement `submitToProvider()` — a one-function change. That becomes the ONE declared outbound seam.

[2026-07-02 06:19] | **Generator lives ON `/drop` (`#generator`), vanilla-JS island** | Embedded the full generator as a section of `/drop`, wired with a plain module `<script>` (no React/framework island) importing the registry JSON + template + receipts modules. | Mandate: "on (or linked one click from) /drop" — embedding satisfies "on" most directly. Vanilla JS keeps the static build simple and console-error-free; WebCrypto is native. | If the tool grows, promote it to its own route and/or a framework island.

[2026-07-02 06:19] | **Receipts = SHA-256 leaves only; membrane ledger NOT built** | Each logged request mints a standalone SHA-256 receipt (WebCrypto, short-form, re-verifiable). No hash-chaining/signing. | Mandate: mint the receipts thesis in miniature; the membrane ledger is a hook, not a build. Noted as the future on-ramp in a code comment (`receipts.js`) and here. | A later run builds the hash-chained, signed membrane ledger; the leaves already carry the full hash to chain from.

[2026-07-02 06:19] | **Correction right = labeled disabled stub** | The 4th PRD right (correction) appears in the flow picker as a disabled "stub · coming" option. | Mandate: correction is out of scope this run; leave a labeled stub + log it. | Implement a correction template (CA `§ 1798.106`, GDPR Art. 16) in a later run.

[2026-07-02 06:19] | **`robots.txt` disallows all crawlers** | `Disallow: /` for all agents. | The surface is a private preview during the build (your correction: private until intentionally made public). Backstop in case it is ever served somewhere reachable. | Flip to allow when you deploy publicly on purpose.

[2026-07-02 06:12] | **Stack = Astro 5.18 + Tailwind 4 (via `@tailwindcss/vite`), system fonts only** | No PostCSS config; Tailwind v4 `@theme` tokens in `global.css`; no CDN font (system stack). | Matches the mandate's Astro 5 + Tailwind + static config; system fonts keep the cell sealed (GR-01, no off-origin loads). | A brand-font requirement would mean self-hosting the font file locally (still no CDN).

[2026-07-02 06:10] | **Scaffolded a fresh site rather than logging "repo missing"** | Built a new Astro 5 + Tailwind project in `clause-ink-site/`, matching the mandate's config (site: clause.ink, output: static). | The described `clause-ink-site/` Astro repo (with 10 analysis routes) is NOT present in this environment — this is the `TobiOlofintuyi` GitHub profile repo, scope-locked, README-only. The mandate says decide/build/log and never stop; the product is well-specified enough to build fresh, which delivers the actual forcing-function artifact. | If the real `clause-ink-site` repo with existing analysis routes surfaces, port these `/drop` + generator files into it (they are additive and self-contained) so the analysis routes are preserved.

[2026-07-02 06:10] | **Living files at the repo root; project in `clause-ink-site/`** | `BUILD_LOG.md` + `ASSUMPTIONS.md` at `/`, Astro project under `clause-ink-site/`. | "Keep two living files in the repo root." Root placement surfaces them immediately; the subdir keeps the profile `README.md` (which renders on your GitHub profile) untouched on this feature branch. | —

---

## Open flags carried from the mandate (log, do not resolve)

- **CA-resident-only dogfooding:** DROP filing is California-resident-only. You
  (Seattle) cannot file DROP yourself — a willing California resident is needed to
  test the filing walkthrough end-to-end against the real `privacy.ca.gov/drop`
  → `consumer.drop.privacy.ca.gov` flow.
- **Email provider:** none confirmed in the repo. Store-and-flag is shipped;
  `submitToProvider()` is the one-function swap-in.
- **Registry seed list:** shipped a sensible 22-entry seed with `lastChecked`
  dates; Oracle + Epsilon unverified this pass. Per-company privacy contacts need
  a periodic re-verification pass.
