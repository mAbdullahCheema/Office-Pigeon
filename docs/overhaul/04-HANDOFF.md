# Office Pigeon — Session Handoff

> Read this first when resuming. It tells a fresh session (you, next time) exactly where things stand and how to continue. The durable detail lives in the other files; this is the "pick up the thread" doc.

## TL;DR
Big multi-phase overhaul of officepigeon.com (websites/chatbots/AI-calling-agents/automations agency site). Deep analysis + phased plan + memory system are written. **No code changed yet** — this first session was docs-only by owner's choice. Resume by reviewing the plan with the owner, then doing Phase 0 baselines + Phase 1 perf quick wins.

## How to resume (do this every new session)
**Type `/resume`** (project slash command) — it loads the brain, reports state, and continues the current phase. **Do NOT use `/init`** (it only rewrites `CLAUDE.md`). Steps `/resume` runs:
1. Read `CLAUDE.md` (auto-loaded) → it points here.
2. Read [03-STATE.md](03-STATE.md) → **Current Focus**, **Next Up**, **Status Board**, **Open Questions**. That's ground truth for progress.
3. Skim [02-PLAN.md](02-PLAN.md) for the current phase's tasks + acceptance criteria.
4. Reference [01-ANALYSIS.md](01-ANALYSIS.md) for the *why* behind any issue ID (e.g. `PERF-01`).
5. After doing work: update [03-STATE.md](03-STATE.md) (Status Board, per-issue tracker, Session Log) and append a line to this handoff's "What changed last session".

## Locked decisions (don't re-litigate — see [03-STATE Decision Log](03-STATE.md#decision-log))
- Host: **Hostinger Node**, live officepigeon.com → run **Next.js via `next start`**.
- SEO: **full Next.js SSR/SSG migration** (also kills the Express-vs-dead-Next duplication).
- Hero: **"show the system working"** demo (Home + Pakistan); remove Three.js hub.
- Cadence: small commits, keep `main` deployable, baseline-then-improve.
- **Commit & push to `origin/main` at the end of every phase** (and after meaningful tasks) — `rtk git add -A && rtk git commit && rtk git push`. Each phase = recoverable checkpoint.

## State of the code (snapshot 2026-06-27)
- Live runtime = Express `server.ts` → serves the **Vite React SPA** (`dist`) + all APIs. This is what's on Hostinger.
- `app/api/*` (Next route handlers) = **dead** (no `next.config`, no `next` scripts). `lib/*` is shared & used by Express.
- Branch `main`, clean except one untracked stray asset: `public/logos/office-pigeon-icon .png` (note the space — likely accidental; verify before adding).
- No tests, no CI, lint = `tsc --noEmit` only.

## What to do next (concrete first steps)
1. **Confirm Open Questions** in [03-STATE](03-STATE.md#open-questions--pending-decisions) — especially the **Hostinger Node runtime details** (blocks the Next cutover) and the **og:image** asset.
2. **Phase 0:** record Lighthouse + view-source SEO baselines in the [Metrics Baseline](03-STATE.md#metrics-baseline-fill-in-phase-0) table; add lint/format + a Playwright overflow/console smoke test.
3. **Phase 1:** start with **PERF-01** (ThreeHub: stop `setActiveNode` every frame — use a ref + throttle or direct DOM). Then fonts (PERF-03), paint layers (PERF-02). These improve the *live* site immediately and are reversible.

## Gotchas / landmines for next session
- Don't "fix" `SmoothScroll.tsx` to add scrolling — it's intentionally a no-op now (native scroll). Just remove it + the misleading comment (PERF-08). Prior scroll-jacking churn is in git history.
- The home `<h1>` "AUTOMATE" background word is decorative but is a real `<h1>` (SEO-06) — collapse to one H1 when touching the hero.
- ThreeHub already disables WebGL <768px and FPS-falls-back; the perf problem is the React state loop, not WebGL itself.
- Pricing is duplicated (config.ts, server `SYSTEM_PROMPT`, knowledge base) — when changing prices, change all sources or (better) single-source it (CONTENT-04).
- `trust proxy: true` + IP rate limits = spoofable (SEC-01); fix when porting to Next.
- Pakistan page is geo-gated server-side (PK only) and bespoke (1022 lines) — mirror any Home changes there.

## What changed last session (append newest first)
- **2026-06-27:** Created the overhaul doc system (`docs/overhaul/00..04`), root `CLAUDE.md` hub, and global memory entries. Ran a full read-only analysis. No source code modified.
