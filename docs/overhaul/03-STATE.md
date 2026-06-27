# Office Pigeon — Overhaul State & Memory

> **This is the living file.** Update it every session. The analysis ([01](01-ANALYSIS.md)) and plan ([02](02-PLAN.md)) are stable specs; this file tracks *what's actually done and what's next*.
> Convention: keep the **Decision Log** append-only; update the **Status Board** and **Current Focus** in place. Convert any relative dates to absolute.

Last updated: **2026-06-27** by Claude (Phase 2 — Next.js foundation shipped).

---

## Current Focus
**Phase 3 in progress — frontend SSR + SEO core DONE.** All 13 marketing pages are ported to Next App Router Server Components (`app/(site)/<route>`), each reusing its existing `src/views/*` UI as a client island fed by the `SiteChrome` actions context (navigate/openConsultation/openPackageModal). Per-route metadata + JSON-LD (Org/LocalBusiness/Service/FAQ/Breadcrumb) + `sitemap.xml` + `robots.txt` are live and verified in view-source. **Remaining Phase 3 = backend:** API 1:1 parity, Pakistan gating → middleware, security headers, og:image, then the **boot cutover** (needs owner Hostinger action). Express still live until cutover.

## Next Up (start here next session)
1. **API parity (Phase 3 backend):** Next has `app/api/pip/*`, `admin/reindex-knowledge`, `elevenlabs/.../search`. Add Next Route Handlers for the rest the SPA calls: `/api/chat`, `/api/pip-lead`, `/api/contact-submission`, `/api/package-inquiry`, `/api/preview-leads`, `/api/region-offer`, `/api/admin/{config,me,previews}`, `/api/public/previews`, and **preview file serving + banner injection** (`/previews/:slug/*`). Reconcile vs `server.ts` 1:1; reuse `lib/*`. zod (BE-04), origin/honeypot (SEC-08).
2. **Pakistan geo-gating → `middleware.ts`:** port `canAccessPakistanPage` + country resolution; keep `/pakistan` noindex/region-gated (SEO-09).
3. **Security headers** via `next.config` `headers()` (SEC-02); fix `trust proxy` (SEC-01).
4. **og:image** 1200×630 branded → wire into OpenGraph in `pageMetadata`/root.
5. **Boot cutover (last):** build copies `.next/standalone/*`+static+public into `dist/`; `dist/server.cjs` → thin shim booting Next standalone. **Tag Express rollback first.** ⚠️ Needs owner Hostinger action (entry/startup file + Node 22) — assistant hands exact steps. Test locally → push.
6. **RESP-08:** re-measure `/websites` CLS post-cutover. Phase 0 leftovers (ESLint/Prettier, Playwright). Search Console TXT (owner) + sitemap submit after green signal.

## Phase 2 — how Next & Vite coexist (read before touching the build)
- **Two runtimes, one repo (transitional).** Live = Vite SPA + Express (`server.ts` → `dist/server.cjs`); new = Next App Router (`app/`). Live build path **untouched**: `npm run build`, `npm start`, `postinstall` unchanged.
- **Next-only scripts:** `npm run build:next` / `start:next` / `dev:next`.
- **Tailwind split:** `postcss.config.mjs` (`@tailwindcss/postcss`) is for **Next only**; `vite.config.ts` pins inline `css.postcss:{plugins:[]}` so Vite ignores it and keeps using `@tailwindcss/vite`. `app/globals.css` mirrors `src/index.css` brand tokens (fonts via `next/font` vars).
- **TypeScript split:** root `tsconfig.json` stays the SPA's (untouched). Next uses `tsconfig.next.json` (via `next.config` `typescript.tsconfigPath`) scoped to `app/` + `lib/` only — so Next does NOT type-check the legacy SPA. Next mutates `tsconfig.next.json`, not root.
- **Rename:** `src/pages/` → `src/views/` (these are SPA view components, not Next pages) so Next's App Router doesn't collide with a Pages Router dir. Only `src/App.tsx` imported them.
- **Boot cutover (Phase 3, not yet wired):** `next.config` `output:'standalone'` → build copies `.next/standalone/*` into `dist/` and `dist/server.cjs` becomes a thin shim that boots the standalone Next server (Hostinger's fixed `node dist/server.cjs` then runs Next; entry file changeable, Node→22).

---

## Decision Log (append-only)
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-27 | **Host stays Hostinger Node**; live at officepigeon.com. Target runtime = **Next.js via `next start`**. | Owner confirmed current hosting. Next runs as a Node app, compatible with Hostinger; lets us do full SSR. |
| 2026-06-27 | **Full Next.js SSR/SSG migration** for SEO (not prerender-SPA, not meta-only). | Owner chose the strongest SEO/AEO/GEO option; also consolidates the Express-vs-dead-Next duplication onto one runtime. |
| 2026-06-27 | **Hero = "show the system working"** demo on Home + Pakistan; remove Three.js abstract hub. | Owner: current 3D hub doesn't reflect what they sell. Matches PRODUCT.md "show the system working." Also removes a major perf cost. |
| 2026-06-27 | This session = **docs + memory only**, no code. | Owner chose to align on plan before touching code. |
| 2026-06-27 | **Next runtime via the entry file, not the start command.** Hostinger start command is fixed (`node dist/server.cjs`, run by npm) and CANNOT change, but the **entry file CAN** change and **Node can be set to 22.x**. → The Next migration must make `dist/server.cjs` (or the configured entry) **boot the Next production server** (Next standalone `server.js` or a thin programmatic `next start` wrapper bundled to that path). Env vars come from Hostinger Node settings (not a .env file). | Owner-provided Hostinger constraints. |
| 2026-06-27 | **No staging subdomain** — test locally, then push to live officepigeon.com. Keep the Express `dist/server.cjs` as a tagged rollback before cutover. | Owner. |
| 2026-06-27 | **Canonical = apex `https://officepigeon.com`** (no www). | Owner. |
| 2026-06-27 | **og:image:** generate a branded one (owner has none). | Owner said "make one". |
| 2026-06-27 | **Observability = Sentry + PostHog** (Phase 7). | Owner request. |
| 2026-06-27 | **Hero channel tabs must be interactive** — each shows a distinct relevant scenario. Done in (h). | Owner feedback on Phase 4. |

## Open Questions / Pending Decisions
- **Hostinger runtime details:** Node version available? Process manager (PM2 / Passenger / systemd)? Exact prod start command + how env vars are set? (Blocks Phase 2 cutover.)
- **og:image asset:** need a real share image (none exists). Brand has logos in `public/logos/`.
- **PK vs global SEO:** hreflang strategy? Is `/pakistan` meant to rank in PK, or stay `noindex` gated? (Currently gated + noindex when blocked.)
- **Hero demo fidelity:** how literal should the mock UIs be (real product screenshots vs stylized)? Any brand assets/screenshots to use?
- **CI host:** is there a CI provider (GitHub Actions ok?) for Phase 0 lint/build/test gate?
- **Analytics:** any analytics installed (to measure conversion impact of hero change)? None found in repo.

---

## Status Board
Legend: ⬜ not started · 🟡 in progress · ✅ done · ⏸ blocked

| Phase | Title | Status | Notes |
|-------|-------|--------|-------|
| 0 | Safety net & baselines | 🟡 | README + CI + .gitattributes/.editorconfig + **PageSpeed baselines** done; ESLint/Prettier + Playwright still TODO |
| 1 | Performance quick wins | 🟡 | PERF-01/03/07/08 done; PERF-02/06 deferred to Phase 4; PERF-05/09/10 TODO |
| 2 | Next.js foundation | ✅ | App Router builds + runs beside live SPA; SSR + 1 API route verified; coexistence (Tailwind/tsconfig split, src/views rename) documented |
| 3 | Pages + API migration + SEO core | 🟡 | Frontend SSR + SEO core DONE (13 pages ported, metadata/JSON-LD/sitemap/robots). Remaining: API parity, PK middleware, security headers, og:image, boot cutover |
| 4 | Hero "show the system working" | 🟡 | SystemDemo on Home + Pakistan; three.js removed; **channel tabs interactive** (CONTENT-05). Responsive matrix in Phase 5 |
| 5 | Responsive & device hardening | ⬜ | Broad; per-page + matrix |
| 6 | Backend scalability & observability | ⬜ | |
| 7 | Polish, QA, launch | ⬜ | |

### Per-issue tracker (fill as you go)
> Only listing S1/key items here; full list in [01-ANALYSIS](01-ANALYSIS.md#9-issue-index-quick-reference).

| ID | Title | Phase | Status | Commit/PR |
|----|-------|-------|--------|-----------|
| SEO-01 | Client-only rendering | 2/3 | 🟡 | Phase 3: all 13 pages SSR'd in Next (content+meta in view-source). ✅ once Next is the live runtime (cutover) |
| SEO-02 | Per-page metadata | 3 | ✅ | Unique title/desc/canonical/OG/Twitter per route from single ROUTES source (`lib/seo/pageMetadata.ts`) |
| SEO-04 | JSON-LD structured data | 3 | ✅ | Org+LocalBusiness site-wide; Service/Offer on service pages; FAQPage on /faq; BreadcrumbList per page (`lib/seo/jsonld.ts`) |
| SEO-05 | sitemap + robots | 3 | ✅ | `app/sitemap.ts` (from ROUTES) + `app/robots.ts` (disallow /previews,/admin) verified |
| PERF-01 | ThreeHub re-render storm | 1 | ✅ | ref + 150ms throttle; only setState on change |
| PERF-02 | Always-on paint layers | 4 | ⏸ | deferred to Phase 4 hero rebuild |
| PERF-03 | Render-blocking fonts | 1 | ✅ | @import → preconnect + <link> in index.html |
| PERF-07 | Bundle chunking | 1 | ✅ | vite manualChunks: three/motion/react split |
| PERF-08 | Dead SmoothScroll | 1 | ✅ | removed component + misleading comment |
| ARCH-04 | Stale README | 0 | ✅ | real setup/run/deploy README |
| ARCH-01 | Two backends (Express/dead Next) | 2/3 | 🟡 | Phase 2: `app/api/*` un-deaded (build green, health route verified through Next). Full 1:1 reconcile + Express retirement in Phase 3 |
| RESP-01..03 | Overflow / absolute hero | 4/5 | ⬜ | |
| SEC-01/02 | trust proxy / security headers | 3 | ⬜ | |
| CONTENT-01/02 | Hero shows the system | 4 | ✅ | new SystemDemo (CSS/SVG) on Home + Pakistan |
| CONTENT-03 | De-gimmick headline | 4 | ✅ | typewriter → static gradient headline |
| PERF-04 | Three.js off home path | 4 | ✅ | ThreeHub deleted; `three` no longer bundled/loaded |
| PERF-06 | Typewriter setState loop | 4 | ✅ | removed with headline |
| SEO-06 | Single H1 on Home | 4 | ✅ | decorative "AUTOMATE" h1 → aria-hidden span |
| _cleanup_ | Dead `PakistanHeroVisual`/`heroModes` | 5 | ⬜ | tree-shaken from bundle; remove from source w/ ESLint pass |
| RESP-08 | **/websites CLS ≈ 0.99** (near-full-page shift) | 1/5 | 🟡 | Root cause: lazy-route **Suspense fallback** (`min-h-[60vh]` spinner) swapped for the tall page on direct load → footer jumps up. Applies to all lazy routes; Home exempt (non-lazy). **Interim fix applied:** fallback now `min-h-[100dvh]` so below-fold content isn't painted then shifted. **Real fix = SSR (Phase 3)** — re-measure then. Owner to re-run PageSpeed on /websites to confirm interim improvement. |
| CONTENT-05 | Interactive hero channel tabs | 4 | ✅ | tabs switch Website/WhatsApp/Call/Automation scenarios |

---

## Metrics Baseline — captured 2026-06-27 (PageSpeed/Lighthouse 13.4, post Phase 1+4)
| Metric | Home mob | Home desk | /websites mob | /websites desk | /pakistan* |
|--------|----------|-----------|----------------|----------------|-----------|
| Perf | 90 | 98 | **62** | **74** | 93 (gate) |
| FCP | 2.9s | 0.7s | 2.9s | 0.7s | 2.6s |
| LCP | 2.9s | 0.7s | 3.2s | 0.8s | 2.6s |
| TBT | 20ms | 0ms | 0ms | 0ms | 0ms |
| CLS | 0 | 0.005 | **0.99 ⚠️** | **0.991 ⚠️** | 0.002 |
| SI | 3.4s | 1.3s | 3.6s | 1.2s | 2.6s |
| A11y / BP / SEO | 88/100/100 | 88/100/100 | 88/100/100 | 88/100/100 | 91/100/58 |

\* **/pakistan PageSpeed measured the region-GATE page** (Google's crawler isn't in PK), not the real PK content — so it's not a true baseline. Re-measure post-migration with a PK check or header simulation.

**Big finding:** `/websites` has **CLS ≈ 0.99** (near-full-viewport layout shift) on both mobile + desktop — the sole reason its perf is 62/74 while the rest of its metrics are green. New high-priority issue **RESP-08** (below). "Agentic Browsing" score is low (1/3 home, 0/3 websites) — reinforces the SSR/AEO migration value.

Targets (Phase 7): mobile Perf ≥ 90 every route, LCP < 2.5s, **CLS < 0.05 every route** (fix /websites first), unique SSR metadata + JSON-LD on every route.

---

## Session Log (newest first)
- **2026-06-27 (j)** — **Phase 3 frontend SSR + SEO core shipped.** Built the repeatable migration pattern: Server-Component pages in `app/(site)/<route>` that render the existing `src/views/*` as client islands via a thin adapter, fed nav/modal actions from a new `SiteChrome` client context (mirrors `src/App.tsx` chrome: Navbar/Footer/PipWidget/VoiceTools/PakistanCurtain/PackageModal; currentPage from `usePathname`). **Ported all 13 marketing pages** (home, websites, chatbots, calling-agents, automations, examples, contact, faq, about, pakistan + privacy/terms/refund/fair-usage). Added single-source `lib/site/routes.ts` (routes + per-page titles/descriptions, SEO-02), `lib/seo/jsonld.ts` + `app/_components/JsonLd.tsx` (Org/LocalBusiness/Service/FAQPage/Breadcrumb, SEO-04), `lib/seo/pageMetadata.ts`, `app/robots.ts` + `app/sitemap.ts` (SEO-05). Org+LocalBusiness JSON-LD injected site-wide in root layout. Pakistan noindex + sitemap-excluded pending hreflang (SEO-09). **Verified:** `next build` green (26 routes); every page serves unique title+content+JSON-LD in raw HTML (no JS); sitemap.xml/robots.txt correct; SPA still green (`npm run lint` + `npm run build`→dist/server.cjs). **Remaining Phase 3:** API parity, PK gating middleware, security headers, og:image, boot cutover (needs owner Hostinger change). Commits c197e20 (foundation) + 2ed3211 (all pages).
- **2026-06-27 (i)** — **Phase 2 (Next.js foundation) shipped.** Stood up Next 16 App Router *beside* the live Vite/Express SPA without breaking it. Added `next.config.ts` (`output:'standalone'`, scoped `tsconfig.next.json`), `postcss.config.mjs` (Next-only), `app/layout.tsx` (metadata + `next/font` Manrope/JetBrains Mono, canonical=apex), `app/globals.css` (brand tokens), `app/page.tsx` (real SSR home placeholder). Resolved 3 coexistence collisions: (1) Tailwind — pinned Vite to inline empty PostCSS so it ignores the Next PostCSS config; (2) tsconfig — gave Next its own `tsconfig.next.json` scoped to `app/`+`lib/`, restored root tsconfig to the SPA's (Next no longer type-checks the legacy SPA); (3) routing — renamed `src/pages/`→`src/views/` (App Router vs Pages Router clash; only `src/App.tsx` imports them). Un-deaded `app/api/*`. Fixed 2 latent type issues that the refreshed dep tree surfaced (`lib/server/office-pigeon-vector-search.ts` `never[]`; `Pakistan.tsx` `sectionMotion` `ease` widening → `as const`). **Verified:** `next build` green; `next start` view-source shows real title/desc/canonical/h1 (SSR, no JS); `/api/pip/health` returns JSON through Next; **and** SPA path unbroken — `npm run lint` green + full `npm run build` → `dist/server.cjs` (128KB). Boot cutover + page/API/SEO migration = Phase 3.
- **2026-06-27 (h)** — Owner provided PageSpeed baselines (recorded above) + all Phase 2/3/5/7 prereq answers (recorded in Decision Log + 05-PREREQS). Found **RESP-08: /websites CLS 0.99**. Made the hero **interactive** (CONTENT-05): channel tabs now switch between distinct Website (browser+form), WhatsApp (chat), Call (transcript+waveform), and Automation (step flow) scenarios; fixed min-height to avoid switch-induced CLS; accessible tabs (role/aria/focus-visible). tsc + build green. Phase 2 now unblocked → next.
- **2026-06-27 (g)** — **Fixed failing CI** (root cause: committed `package-lock.json` drifts on optional platform binaries → `npm ci` strict check fails; also `--ignore-scripts` skipped esbuild's native binary). CI now uses `npm install` (provisions binaries + builds via postinstall, mirrors Hostinger). Added the **manual-step gate system**: new [05-PREREQS.md](05-PREREQS.md) listing per-phase manual steps; assistant must present them and wait for `done` before starting a gated phase. Reworked `CLAUDE.md` top: ON-SESSION-START protocol + Progress Snapshot (done/not-done) + gate + `/init`-preserve note, so context+progress transfer on any new session. Wired the gate into `/resume`, 02-PLAN, 00-INDEX.
- **2026-06-27 (f)** — Phase 0 infra: added GitHub Actions CI (`.github/workflows/ci.yml` — typecheck + build on push/PR), `.gitattributes` (LF normalization — stops the CRLF churn) and `.editorconfig`. Still TODO in Phase 0: ESLint+Prettier (deferred — will surface a warning flood + needs deps; do as a focused pass with non-breaking config), Playwright smoke test (needs browser install; add config + spec next), and owner PageSpeed baselines.
- **2026-06-27 (e)** — Phase 4 hero (autonomous). Built `src/components/SystemDemo.tsx` — a lightweight CSS/SVG "show the system working" panel (customer msg → AI books it → lead captured/team notified, with the 4 product channels). Wired into Home + Pakistan heroes; deleted `ThreeHub.tsx` and removed `three` from the home path (PERF-04); removed the typewriter (PERF-06/CONTENT-03) for a static gradient headline; demoted the decorative "AUTOMATE" `<h1>` to an aria-hidden span (SEO-06); simplified Home's risky absolute hero column to an in-grid layout (RESP-02). Old `PakistanHeroVisual`/`heroModes` now unused (tree-shaken; source cleanup pending). Reduced-motion-safe (CSS gated). tsc + build green; `three` chunk gone, Pakistan chunk 42→32KB. **Subjective:** hero copy/visual are my call per "show the system working" — owner can tweak wording.
- **2026-06-27 (d)** — Started Phase 1. Landed PERF-01 (ThreeHub: ref + 150ms throttle, no per-frame setState), PERF-03 (fonts off @import → preconnect+link in index.html), PERF-07 (vite manualChunks split three/motion/react), PERF-08 (deleted dead SmoothScroll.tsx + comment), and Phase-0 ARCH-04 (real README). `tsc` clean; `vite build` green in 8.79s — three (504KB) + motion (96KB) now lazy/separate chunks. Deferred PERF-02/PERF-06 to Phase 4 (hero replaces ThreeHub/typewriter). Noted: initial index chunk ~353KB needs deeper splitting later.
- **2026-06-27 (c)** — `/init` didn't resume work (it only rewrites CLAUDE.md). Added `/resume` project command (`.claude/commands/resume.md`) that loads the brain, reports state, and continues the current phase. Pointed CLAUDE.md/INDEX/HANDOFF at `/resume`. **To resume: type `/resume`, not `/init`.**
- **2026-06-27 (b)** — Added standing rule: commit & push to `origin/main` at end of every phase (recorded in PLAN/CLAUDE.md/HANDOFF). Committed + pushed the docs/memory deliverables.
- **2026-06-27 (a)** — Deep scan of codebase. Identified root causes: SPA client-render kills SEO (SEO-01..04), ThreeHub `setActiveNode` per rAF frame (PERF-01), always-on gradient repaints (PERF-02), dead Next `app/api` duplicating Express (ARCH-01), hero doesn't sell (CONTENT-01). Got 4 decisions from owner (see Decision Log). Wrote analysis, plan, this state file, handoff, index, root `CLAUDE.md`, and global memory. No code changes.
