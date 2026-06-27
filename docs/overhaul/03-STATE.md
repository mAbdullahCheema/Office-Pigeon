# Office Pigeon — Overhaul State & Memory

> **This is the living file.** Update it every session. The analysis ([01](01-ANALYSIS.md)) and plan ([02](02-PLAN.md)) are stable specs; this file tracks *what's actually done and what's next*.
> Convention: keep the **Decision Log** append-only; update the **Status Board** and **Current Focus** in place. Convert any relative dates to absolute.

Last updated: **2026-06-27** by Claude (analysis session).

---

## Current Focus
**Phase 1 in progress** (perf quick wins, parallel-safe). First safe batch landed: PERF-01, PERF-03, PERF-07, PERF-08 + Phase-0 README. Build + typecheck green. PERF-02 and PERF-06 intentionally deferred to bundle with the Phase 4 hero rebuild (ThreeHub/typewriter get replaced there — avoids double work).

## Next Up (start here next session)
1. **Owner action (Phase 0 baseline):** run PageSpeed Insights on officepigeon.com for `/`, `/websites`, `/pakistan` (mobile+desktop) and paste numbers into the Metrics Baseline table — needs a browser, can't do headless here.
2. Phase 0 tooling: CI (typecheck+build) ✅ done. Still TODO: ESLint/Prettier (install hit an eslint-9 plugin peer-dep conflict vs react19/next16 — resolve with `--legacy-peer-deps` or pinned versions in a focused pass, config advisory/non-breaking), Playwright overflow/console smoke test (needs `npx playwright install`).
3. Follow-up perf: the initial `index` chunk is ~353KB (102KB gz) — investigate deeper splitting (lucide icon imports, config) in a later pass.
4. Phase 2 still blocked on: Hostinger Node version + process manager + exact start command (see Open Questions).

---

## Decision Log (append-only)
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-27 | **Host stays Hostinger Node**; live at officepigeon.com. Target runtime = **Next.js via `next start`**. | Owner confirmed current hosting. Next runs as a Node app, compatible with Hostinger; lets us do full SSR. |
| 2026-06-27 | **Full Next.js SSR/SSG migration** for SEO (not prerender-SPA, not meta-only). | Owner chose the strongest SEO/AEO/GEO option; also consolidates the Express-vs-dead-Next duplication onto one runtime. |
| 2026-06-27 | **Hero = "show the system working"** demo on Home + Pakistan; remove Three.js abstract hub. | Owner: current 3D hub doesn't reflect what they sell. Matches PRODUCT.md "show the system working." Also removes a major perf cost. |
| 2026-06-27 | This session = **docs + memory only**, no code. | Owner chose to align on plan before touching code. |

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
| 0 | Safety net & baselines | 🟡 | README + GitHub Actions CI (typecheck+build) + .gitattributes/.editorconfig done; PageSpeed baselines (owner), ESLint/Prettier, Playwright still TODO |
| 1 | Performance quick wins | 🟡 | PERF-01/03/07/08 done; PERF-02/06 deferred to Phase 4; PERF-05/09/10 TODO |
| 2 | Next.js foundation | ⬜ | Needs Hostinger runtime answers |
| 3 | Pages + API migration + SEO core | ⬜ | Critical path for SEO |
| 4 | Hero "show the system working" | 🟡 | Home + Pakistan now use SystemDemo; three.js removed. Copy polish + responsive matrix pending |
| 5 | Responsive & device hardening | ⬜ | Broad; per-page + matrix |
| 6 | Backend scalability & observability | ⬜ | |
| 7 | Polish, QA, launch | ⬜ | |

### Per-issue tracker (fill as you go)
> Only listing S1/key items here; full list in [01-ANALYSIS](01-ANALYSIS.md#9-issue-index-quick-reference).

| ID | Title | Phase | Status | Commit/PR |
|----|-------|-------|--------|-----------|
| SEO-01 | Client-only rendering | 2/3 | ⬜ | |
| SEO-02 | Per-page metadata | 3 | ⬜ | |
| SEO-04 | JSON-LD structured data | 3 | ⬜ | |
| SEO-05 | sitemap + robots | 3 | ⬜ | |
| PERF-01 | ThreeHub re-render storm | 1 | ✅ | ref + 150ms throttle; only setState on change |
| PERF-02 | Always-on paint layers | 4 | ⏸ | deferred to Phase 4 hero rebuild |
| PERF-03 | Render-blocking fonts | 1 | ✅ | @import → preconnect + <link> in index.html |
| PERF-07 | Bundle chunking | 1 | ✅ | vite manualChunks: three/motion/react split |
| PERF-08 | Dead SmoothScroll | 1 | ✅ | removed component + misleading comment |
| ARCH-04 | Stale README | 0 | ✅ | real setup/run/deploy README |
| ARCH-01 | Two backends (Express/dead Next) | 2/3 | ⬜ | |
| RESP-01..03 | Overflow / absolute hero | 4/5 | ⬜ | |
| SEC-01/02 | trust proxy / security headers | 3 | ⬜ | |
| CONTENT-01/02 | Hero shows the system | 4 | ✅ | new SystemDemo (CSS/SVG) on Home + Pakistan |
| CONTENT-03 | De-gimmick headline | 4 | ✅ | typewriter → static gradient headline |
| PERF-04 | Three.js off home path | 4 | ✅ | ThreeHub deleted; `three` no longer bundled/loaded |
| PERF-06 | Typewriter setState loop | 4 | ✅ | removed with headline |
| SEO-06 | Single H1 on Home | 4 | ✅ | decorative "AUTOMATE" h1 → aria-hidden span |
| _cleanup_ | Dead `PakistanHeroVisual`/`heroModes` | 5 | ⬜ | tree-shaken from bundle; remove from source w/ ESLint pass |

---

## Metrics Baseline (fill in Phase 0)
| Metric | Home (mobile) | Home (desktop) | /websites | /pakistan |
|--------|---------------|----------------|-----------|-----------|
| Lighthouse Perf | | | | |
| LCP | | | | |
| CLS | | | | |
| TBT | | | | |
| Total JS (KB) | | | | |
| SSR title in view-source? | No (SPA) | No (SPA) | No (SPA) | No (SPA) |

Targets (Phase 7): mobile Perf ≥ 90, LCP < 2.5s, CLS < 0.1, unique SSR metadata on every route, `three` off the home path.

---

## Session Log (newest first)
- **2026-06-27 (f)** — Phase 0 infra: added GitHub Actions CI (`.github/workflows/ci.yml` — typecheck + build on push/PR), `.gitattributes` (LF normalization — stops the CRLF churn) and `.editorconfig`. Still TODO in Phase 0: ESLint+Prettier (deferred — will surface a warning flood + needs deps; do as a focused pass with non-breaking config), Playwright smoke test (needs browser install; add config + spec next), and owner PageSpeed baselines.
- **2026-06-27 (e)** — Phase 4 hero (autonomous). Built `src/components/SystemDemo.tsx` — a lightweight CSS/SVG "show the system working" panel (customer msg → AI books it → lead captured/team notified, with the 4 product channels). Wired into Home + Pakistan heroes; deleted `ThreeHub.tsx` and removed `three` from the home path (PERF-04); removed the typewriter (PERF-06/CONTENT-03) for a static gradient headline; demoted the decorative "AUTOMATE" `<h1>` to an aria-hidden span (SEO-06); simplified Home's risky absolute hero column to an in-grid layout (RESP-02). Old `PakistanHeroVisual`/`heroModes` now unused (tree-shaken; source cleanup pending). Reduced-motion-safe (CSS gated). tsc + build green; `three` chunk gone, Pakistan chunk 42→32KB. **Subjective:** hero copy/visual are my call per "show the system working" — owner can tweak wording.
- **2026-06-27 (d)** — Started Phase 1. Landed PERF-01 (ThreeHub: ref + 150ms throttle, no per-frame setState), PERF-03 (fonts off @import → preconnect+link in index.html), PERF-07 (vite manualChunks split three/motion/react), PERF-08 (deleted dead SmoothScroll.tsx + comment), and Phase-0 ARCH-04 (real README). `tsc` clean; `vite build` green in 8.79s — three (504KB) + motion (96KB) now lazy/separate chunks. Deferred PERF-02/PERF-06 to Phase 4 (hero replaces ThreeHub/typewriter). Noted: initial index chunk ~353KB needs deeper splitting later.
- **2026-06-27 (c)** — `/init` didn't resume work (it only rewrites CLAUDE.md). Added `/resume` project command (`.claude/commands/resume.md`) that loads the brain, reports state, and continues the current phase. Pointed CLAUDE.md/INDEX/HANDOFF at `/resume`. **To resume: type `/resume`, not `/init`.**
- **2026-06-27 (b)** — Added standing rule: commit & push to `origin/main` at end of every phase (recorded in PLAN/CLAUDE.md/HANDOFF). Committed + pushed the docs/memory deliverables.
- **2026-06-27 (a)** — Deep scan of codebase. Identified root causes: SPA client-render kills SEO (SEO-01..04), ThreeHub `setActiveNode` per rAF frame (PERF-01), always-on gradient repaints (PERF-02), dead Next `app/api` duplicating Express (ARCH-01), hero doesn't sell (CONTENT-01). Got 4 decisions from owner (see Decision Log). Wrote analysis, plan, this state file, handoff, index, root `CLAUDE.md`, and global memory. No code changes.
