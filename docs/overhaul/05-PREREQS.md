# Office Pigeon — Phase Prerequisites & Manual-Step Gate

> **Hard rule for the assistant (and the human).** Before starting ANY phase, open this file and check that phase's **Manual Prerequisites**. If the phase has unmet manual steps, the assistant MUST:
> 1. Stop. Do **no** phase code work yet.
> 2. Present the full step-by-step instructions for those manual steps (copy them from below, expand if needed).
> 3. **Wait for the user to reply `done`** (or provide the requested info).
> 4. Only then start the phase, and tick the prereq boxes here.
>
> This is a blocking gate. Never begin a phase with unmet manual prerequisites. If a phase has "Manual prerequisites: none," proceed without waiting.

Legend: ⬜ not done · ✅ done · ➖ n/a

---

## Phase 0 — Safety net & baselines
**Manual prerequisites:**
- ✅ **PageSpeed baselines captured** (2026-06-27) — recorded in [03-STATE Metrics Baseline](03-STATE.md). Note: `/pakistan` measured the region-gate page (crawler not in PK); `/websites` has CLS ≈ 0.99 (RESP-08).
- ⬜ *(original)* **Capture PageSpeed baselines.** (So we can prove the before/after.)
  1. Open https://pagespeed.web.dev/
  2. Test each URL, **Mobile** and **Desktop** tabs: `https://officepigeon.com/`, `https://officepigeon.com/websites`, `https://officepigeon.com/pakistan`
  3. For each, record: Performance score, LCP, CLS, TBT (and "Total Blocking Time").
  4. Paste the numbers into the Metrics Baseline table in [03-STATE.md](03-STATE.md#metrics-baseline-fill-in-phase-0). (Or paste them in chat and I'll fill the table.)
- ➖ Everything else in Phase 0 (CI, lint configs, smoke tests) is code — no manual step.

**Gate:** reply `done` (with the numbers) when baselines are captured. *Non-blocking for the code parts of Phase 0/1, which are already underway — but needed before we can claim measured wins.*

---

## Phase 1 — Performance quick wins
**Manual prerequisites: none.** Pure code. (Already in progress.)

---

## Phase 2 — Next.js foundation  ✅ COMPLETE (shipped 2026-06-27; was unblocked, answers received same day)
**Owner answers (recorded):**
- ✅ **Node.js version:** 22.x available; owner **can change** the Node version.
- ✅ **Start setup:** Hostinger runs `node dist/server.cjs` via npm. Owner **CANNOT change the start command**, but **CAN change the entry file**. → Build must make the entry (`dist/server.cjs` or the configured startup file) **boot the Next production server** (Next `output: 'standalone'` server.js, or a thin programmatic `next start` wrapper bundled to that path).
- ✅ **Env vars:** set in Hostinger's Node.js deployment settings (UI), not a `.env` file → Next reads `process.env` at runtime.
- ✅ **No staging subdomain** → test locally, then push to live. Keep Express build tagged for rollback.
- ⬜ **og:image:** owner said **"make one"** → assistant generates a branded 1200×630 asset (Phase 3 metadata wiring).

**Gate:** satisfied. Proceed with Phase 2.

---

## Phase 3 — Pages + API migration + SEO core + cutover
**Owner answers (recorded 2026-06-27):**
- ⬜ **Google Search Console — TXT pending.** Owner has the verification record. **ACTION (owner):** in Hostinger DNS zone for `officepigeon.com`, add a **TXT record** (host `@` / root) with value:
  `google-site-verification=E3BCUJxl6vi7Owulx2oiRpF41YgCRhF8s8RGtDw4xw0`
  then click **Verify** in Search Console. Tell me when verified. (Non-blocking for building code; needed before sitemap submit.)
- ✅ **Supabase env present** on Hostinger (URL + service role key). RLS/index review still to schedule.
- ✅ **Canonical = apex `https://officepigeon.com`** (no www), HTTPS enforced.
- ✅ **Cutover approved** ("agree if it's the better way") — proceed with the careful local-test→push cutover, Express kept as tagged rollback.

**Gate:** Page/JSON-LD/sitemap/robots code builds first. **Sitemap submission + final indexing wait for the owner's green-signal after everything is finalized** (owner: "I will submit the proper sitemap after you finalize everything and give me the green signal").

**⬜ CUTOVER manual step (NEW — blocking the runtime switch only; all Phase 3 code is done):**
- Owner sets **Hostinger Node version → 22.x**. Start command stays `node dist/server.cjs` (new shim boots Next; no entry-file change). Confirm Supabase + LLM env vars present in Hostinger Node settings.
- Then assistant tags `express-rollback`, flips `package.json` `build` → `next build && node scripts/buildNext.mjs`, pushes → Hostinger redeploys onto Next. Reply **`cutover ready`** (with Node set to 22) to proceed. Rollback = revert that commit / `git checkout express-rollback -- package.json`.

---

## Phase 4 — Hero "show the system working"
**Manual prerequisites:**
- ✅ Code shipped (Home + Pakistan use `SystemDemo`).
- ✅ **Owner review:** "good, but the Website/WhatsApp/Call/Automation buttons should work and show different relevant things." → **Done:** channel tabs are now interactive, each rendering a distinct scenario (CONTENT-05).

**Gate:** none. Further copy/visual tweaks welcome anytime.

---

## Phase 5 — Responsive & device hardening
**Owner target devices (recorded):** mobile (old **and** new), tablet, laptops, and desktops across **different resolutions + aspect ratios — especially 16:9 and 16:10**.
- Test matrix to use: 320 / 360 / 390 / 414 px phones (old + modern), 768 / 834 / 1024 tablet, 1280 / 1366 / 1440 / 1536 / 1920 / 2560 desktop, both 16:9 and 16:10, plus 200% zoom, no-WebGL, and reduced-motion. Zero overflow/clipping everywhere.

**Gate:** non-blocking.

---

## Phase 6 — Backend scalability & observability
**Manual prerequisites:**
- ⬜ **Shared cache/store creds (if we scale).** If we move rate-limit/country/preview caches off in-memory, you'll need to provision a store (e.g. Upstash Redis via Vercel/Upstash, or a Supabase table). I'll give exact signup steps when we reach this; you'll paste the connection string into env.
- ⬜ **Supabase admin** for RLS policies + indexes on lead/preview tables.

**Gate:** reply `done` with creds/access when we start this phase.

---

## Phase 7 — Polish, QA, launch
**Owner answers (recorded):**
- ✅ **Observability decided: Sentry + PostHog.** Assistant wires both; owner provides the Sentry DSN + PostHog project key/host when we reach this phase.
- ⬜ **Final indexing/submit — owner-gated.** Owner: "I'll submit the proper sitemap **after** you finalize everything and give me the **green signal** — all on-page + technical SEO, robots.txt, sitemap correct." → Assistant must complete + verify all SEO/technical work, then explicitly hand a green-signal checklist; owner then submits the sitemap and requests indexing.

**Gate:** Sentry/PostHog keys when starting; final submit waits on the green signal.

---

## How to update this file
When a manual step is completed, change its ⬜ to ✅ and note the date. Keep it honest — an unchecked box means the gate is still closed.
