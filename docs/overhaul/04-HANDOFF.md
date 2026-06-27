# Office Pigeon — Session Handoff (READ THIS FIRST TO RESUME)

> Ask me to "read the handoff and continue" → I read this top-to-bottom and pick up exactly here. This file is self-sufficient; the other docs are reference. **Last updated: 2026-06-27.**

---

## 1. What this project is
Marketing + lead-gen site for **Office Pigeon** (agency: Websites, Chatbots, AI Calling Agents, Workflow Automations). Live at **officepigeon.com** on **Hostinger (Node app)**. Currently a **Vite + React 19 SPA served by Express** (`server.ts`). We are mid-overhaul: perf, SEO/AEO/GEO, responsive, security, scalability, and a new hero.

Full brain: [01-ANALYSIS](01-ANALYSIS.md) (issues+IDs) · [02-PLAN](02-PLAN.md) (phases) · [03-STATE](03-STATE.md) (live progress, baselines, decisions) · [05-PREREQS](05-PREREQS.md) (manual-step gate). Root [`CLAUDE.md`](../../CLAUDE.md) auto-loads each session.

## 2. Locked decisions (do NOT re-litigate)
- **Runtime target = Next.js**, run on Hostinger Node via the **entry file** (see §6). Full **SSR/SSG migration** is the SEO fix; it also kills the dead duplicate Next `app/api`.
- **Hero = "show the system working"** demo (done, see §4).
- **Canonical = apex `https://officepigeon.com`** (no www).
- **No staging** → test locally, then push to live. Keep Express build as tagged rollback before cutover.
- **Observability = Sentry + PostHog** (Phase 7).
- Standing rule: **commit & push to `origin/main` at the end of every phase / meaningful task.**
- **Manual-step gate:** before starting a phase, check [05-PREREQS](05-PREREQS.md); if it has unmet manual steps, present them and **wait for the user to reply `done`** before phase code work.

## 3. Status — what's DONE
- **Docs/memory system + `/resume` command + manual-step gate.**
- **Phase 0 (partial):** GitHub Actions CI (uses `npm install` — fixed the lockfile-drift failure), `.gitattributes` (LF), `.editorconfig`, real README, **PageSpeed baselines captured** (in [03-STATE](03-STATE.md#metrics-baseline--captured-2026-06-27-pagespeedlighthouse-134-post-phase-14)).
- **Phase 1 (perf):** PERF-01 (no per-frame setState in old hero), PERF-03 (fonts preconnect), PERF-07 (vite chunks), PERF-08 (dead SmoothScroll removed).
- **Phase 4 (hero):** `src/components/SystemDemo.tsx` on Home + Pakistan — Three.js + typewriter removed (`three` no longer loaded), single H1, and **interactive channel tabs** (Website/WhatsApp/Call/Automation each show a distinct scenario). PERF-04/06, CONTENT-01/02/03/05, SEO-06.
- **RESP-08 interim:** `/websites` CLS≈0.99 root-caused (lazy-route Suspense fallback) and mitigated (fallback now `min-h-[100dvh]`). Real fix = SSR.

## 4. Status — what's NOT done / next
1. **Phase 2 — Next.js foundation (the next big task).** See §6 for the exact approach.
2. **Phase 3 — SSR pages + JSON-LD + sitemap/robots + backend consolidation + cutover.** The actual SEO payoff.
3. **RESP-08 full fix** via SSR; owner to re-run PageSpeed on `/websites` to confirm the interim drop.
4. **Phase 0 leftovers:** ESLint/Prettier (install hit an eslint-9 peer-dep conflict vs react19/next16 → use `--legacy-peer-deps` or pinned versions, advisory/non-breaking config), Playwright smoke test (`npx playwright install`).
5. **og:image** 1200×630 branded asset (generate during Phase 3 metadata).
6. **Phase 5** responsive matrix (old+new mobile, tablet, laptop, desktop; esp **16:9 and 16:10**; 200% zoom; no-WebGL; reduced-motion). **Phase 6** backend/scale. **Phase 7** Sentry+PostHog + launch.
7. **Clean up** dead `PakistanHeroVisual`/`heroModes` in `src/pages/Pakistan.tsx` (tree-shaken, but remove from source in the ESLint pass).

## 5. Waiting on the owner (non-blocking for code)
- Confirm **CI is green** now (switched to `npm install`).
- Add **Search Console TXT** at officepigeon.com DNS → `google-site-verification=E3BCUJxl6vi7Owulx2oiRpF41YgCRhF8s8RGtDw4xw0`, then Verify. Needed before sitemap submit, not before code.
- **Sentry DSN + PostHog key/host** when we reach Phase 7.
- Owner will **submit the sitemap only after the assistant's green signal** (all on-page + technical SEO finalized).

## 6. ▶️ EXACT NEXT STEP — start Phase 2 (Next.js foundation)
**Gate:** Phase 2 prereqs are satisfied (see [05-PREREQS Phase 2](05-PREREQS.md#phase-2--nextjs-foundation--unblocked-answers-received-2026-06-27)). Proceed.

**Hard Hostinger constraint:** the start command is fixed to `node dist/server.cjs` (run by npm) and **cannot change** — but the **entry/startup file CAN change** and **Node can be set to 22.x**. So Next must be launched *through that entry path*, not via a new `next start` command.

**Approach:**
1. Add Next.js App Router scaffolding **without breaking the live Express build**: `next.config.{js,ts}` with `output: 'standalone'`, `app/layout.tsx` (root metadata, Tailwind v4 via Next, fonts via `next/font`), a first `app/page.tsx`. Wire Tailwind v4 + PostCSS for Next.
2. Decide the production boot: make the build emit a **Next standalone server** and have the configured Hostinger entry point at it — either (a) set Hostinger's startup file to the standalone `server.js`, or (b) keep `dist/server.cjs` as a thin shim that `require()`s/launches the standalone server. Document the exact build script + the entry path the owner must set.
3. Reuse `lib/*` as-is (framework-agnostic, already used). Inventory every live Express endpoint in `server.ts` (chat, pip/*, contact, package-inquiry, preview-leads, region-offer, admin/*, elevenlabs tool, **preview file serving + banner injection**, **Pakistan geo-gating**) and plan 1:1 mapping to Next Route Handlers / **Next middleware** (gating). Un-dead the existing `app/api/*` and reconcile against Express behavior.
4. Keep Express (`npm run build` → `dist/server.cjs`) as the live path until Phase 3 parity is proven. Tag a rollback commit before any cutover.
5. **Acceptance (Phase 2):** `next build && next start` locally serves a real SSR home page whose `<title>`/meta appear in **view-source** (no JS), and one API route works end-to-end through Next.

**Quick win to also do early:** investigate any remaining CLS and confirm RESP-08 mitigation; the SSR pages inherently fix it.

## 7. Landmines / gotchas
- Live runtime is **Express** (`server.ts`), NOT Next. `app/api/*` is currently **dead** (no `next.config`/scripts).
- `lib/*` IS used by Express — reuse it, don't rewrite.
- Don't restore `SmoothScroll` (deleted; native scroll is intended).
- Pricing is duplicated (`src/config.ts`, server `SYSTEM_PROMPT`, `knowledge/*`) — single-source it during migration (CONTENT-04).
- `trust proxy: true` + IP rate limits are spoofable (SEC-01) — fix when porting to Next; add security headers (SEC-02).
- Pakistan page is bespoke + geo-gated (PK only); mirror Home changes; it still has dead `PakistanHeroVisual`/`heroModes`.
- Build verify = `npm run lint` (tsc) + `npx vite build`. `gh`/`rtk` are NOT on PATH in this environment — use plain `git`.
- Untracked stray file: `public/logos/office-pigeon-icon .png` (note the space) — confirm intent before adding/deleting.

## 8. Commit log this overhaul (newest first)
- `7f4a9b3` fix(perf): mitigate /websites CLS (RESP-08)
- `9dae432` feat(hero): interactive channel tabs + record baselines & phase inputs
- `2818bed` fix(ci): npm install (lockfile drift) + phase-gate system
- `983e73d` docs: eslint peer-dep deferral
- `a4b0926` chore: Phase 0 infra — CI, line endings, editorconfig
- `f8cf513` feat(hero): replace 3D hub with SystemDemo
- `5e3a1b9` perf: Phase 1 quick wins
- `4a9682c` chore: add /resume command
- `71ee53b` docs: overhaul analysis/plan/memory/handoff

## 9. End-of-session checklist (every time)
Update [03-STATE](03-STATE.md) (Status Board, per-issue tracker, Session Log) + this handoff (§3/§4/§8) + the Progress Snapshot in [`CLAUDE.md`](../../CLAUDE.md) + tick [05-PREREQS](05-PREREQS.md) boxes → then **commit & push**.
