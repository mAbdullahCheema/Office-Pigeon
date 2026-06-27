# Office Pigeon — Overhaul State & Memory

> **This is the living file.** Update it every session. The analysis ([01](01-ANALYSIS.md)) and plan ([02](02-PLAN.md)) are stable specs; this file tracks *what's actually done and what's next*.
> Convention: keep the **Decision Log** append-only; update the **Status Board** and **Current Focus** in place. Convert any relative dates to absolute.

Last updated: **2026-06-27** by Claude (analysis session).

---

## Current Focus
**Phase: pre-implementation.** Deliverables for this session = docs + memory only (no code). Next action = owner reviews the [analysis](01-ANALYSIS.md) + [plan](02-PLAN.md), then we begin **Phase 0 (baselines)** and **Phase 1 (perf quick wins)** — both parallel-safe and improve the live SPA immediately.

## Next Up (start here next session)
1. Confirm owner approved the plan / any scope changes.
2. Phase 0: capture Lighthouse + SEO baselines into the **Metrics Baseline** table below.
3. Phase 1: implement **PERF-01** (ThreeHub re-render storm) first — highest impact, lowest risk.
4. Open decision: Hostinger Node version + process manager + exact start command (needed before Phase 2). See Open Questions.

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
| 0 | Safety net & baselines | ⬜ | Do first; parallel-safe |
| 1 | Performance quick wins | ⬜ | PERF-01 first |
| 2 | Next.js foundation | ⬜ | Needs Hostinger runtime answers |
| 3 | Pages + API migration + SEO core | ⬜ | Critical path for SEO |
| 4 | Hero "show the system working" | ⬜ | Parallel-safe after Phase 2 |
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
| PERF-01 | ThreeHub re-render storm | 1 | ⬜ | |
| PERF-02 | Always-on paint layers | 1 | ⬜ | |
| PERF-03 | Render-blocking fonts | 1 | ⬜ | |
| ARCH-01 | Two backends (Express/dead Next) | 2/3 | ⬜ | |
| RESP-01..03 | Overflow / absolute hero | 4/5 | ⬜ | |
| SEC-01/02 | trust proxy / security headers | 3 | ⬜ | |
| CONTENT-01/02 | Hero shows the system | 4 | ⬜ | |

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
- **2026-06-27 (c)** — `/init` didn't resume work (it only rewrites CLAUDE.md). Added `/resume` project command (`.claude/commands/resume.md`) that loads the brain, reports state, and continues the current phase. Pointed CLAUDE.md/INDEX/HANDOFF at `/resume`. **To resume: type `/resume`, not `/init`.**
- **2026-06-27 (b)** — Added standing rule: commit & push to `origin/main` at end of every phase (recorded in PLAN/CLAUDE.md/HANDOFF). Committed + pushed the docs/memory deliverables.
- **2026-06-27 (a)** — Deep scan of codebase. Identified root causes: SPA client-render kills SEO (SEO-01..04), ThreeHub `setActiveNode` per rAF frame (PERF-01), always-on gradient repaints (PERF-02), dead Next `app/api` duplicating Express (ARCH-01), hero doesn't sell (CONTENT-01). Got 4 decisions from owner (see Decision Log). Wrote analysis, plan, this state file, handoff, index, root `CLAUDE.md`, and global memory. No code changes.
