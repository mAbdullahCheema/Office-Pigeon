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
- ⬜ **Capture PageSpeed baselines.** (So we can prove the before/after.)
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

## Phase 2 — Next.js foundation  ⚠️ BLOCKING — needs your input before any code
**Manual prerequisites:**
- ⬜ **Hostinger Node runtime details.** In hPanel → your hosting → **Node.js app** (or "Setup Node.js App"):
  1. Tell me the **Node.js version** available/selected (e.g. 20.x).
  2. Tell me the **process / start setup**: what is the **Application startup file** and **start command** currently? (Today it should be `node dist/server.cjs` or similar.)
  3. Tell me whether you can **change the start command** to `npm run start` / `next start` and change the **Node version** yourself in the panel (yes/no).
  4. Tell me **how environment variables are set** (hPanel "Environment variables" UI, or a `.env` file on the server?).
- ⬜ **Confirm a safe test path.** Can we point a **subdomain** (e.g. `staging.officepigeon.com`) at a Next build to verify parity before touching the live site? (yes/no — if no, we test locally only and cut over carefully.)
- ⬜ **Provide an `og:image`.** A 1200×630 PNG/JPG share image for social/SEO. If you don't have one, say "make one" and I'll generate a branded placeholder.

**Gate:** reply `done` with the four runtime answers + the subdomain yes/no + the og:image (or "make one"). I will not start the Next migration until these land.

---

## Phase 3 — Pages + API migration + SEO core + cutover  ⚠️ BLOCKING items
**Manual prerequisites:**
- ⬜ **Google Search Console access.** Verify `officepigeon.com` in https://search.google.com/search-console (DNS or HTML-tag method). Needed to submit the sitemap and watch indexing. Tell me when verified.
- ⬜ **Confirm Supabase env on the server.** Make sure `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (and the rest of `.env.example`) are set in the Hostinger env. Confirm you have Supabase dashboard access for an RLS/index review.
- ⬜ **Canonical domain decision.** Confirm the canonical host: apex `officepigeon.com` vs `www.` — and that HTTPS is enforced. (Default: apex, HTTPS forced.)
- ⬜ **Cutover window.** Agree a low-traffic window to switch the live start command from Express to Next, with the Express build kept as a tagged rollback.

**Gate:** reply `done` per item (or batch) before the cutover step. Page/JSON-LD/sitemap code can be built first; the **cutover** waits on these.

---

## Phase 4 — Hero "show the system working"
**Manual prerequisites:**
- ✅ Code shipped (Home + Pakistan use `SystemDemo`).
- ⬜ **Your review of the hero** copy + visual (subjective). Optional: send real product screenshots if you want literal mockups instead of the stylized panel.

**Gate:** none (non-blocking). Tell me any copy/visual tweaks anytime.

---

## Phase 5 — Responsive & device hardening
**Manual prerequisites:**
- ⬜ **Device list / access (optional but ideal).** List the real devices you care about most (specific phones, an old laptop, tablet). I test the full emulated matrix regardless; real-device confirmation from you on 2–3 of yours closes the loop.

**Gate:** non-blocking. Provide devices when convenient.

---

## Phase 6 — Backend scalability & observability
**Manual prerequisites:**
- ⬜ **Shared cache/store creds (if we scale).** If we move rate-limit/country/preview caches off in-memory, you'll need to provision a store (e.g. Upstash Redis via Vercel/Upstash, or a Supabase table). I'll give exact signup steps when we reach this; you'll paste the connection string into env.
- ⬜ **Supabase admin** for RLS policies + indexes on lead/preview tables.

**Gate:** reply `done` with creds/access when we start this phase.

---

## Phase 7 — Polish, QA, launch
**Manual prerequisites:**
- ⬜ **Analytics decision.** Want analytics (e.g. Plausible/GA4) to measure the hero/conversion impact? If yes, which — I'll wire it; you provide the site key.
- ⬜ **Final indexing/submit.** Submit the sitemap in Search Console; request indexing on key pages (I'll give the click-path).

**Gate:** reply `done` per item.

---

## How to update this file
When a manual step is completed, change its ⬜ to ✅ and note the date. Keep it honest — an unchecked box means the gate is still closed.
