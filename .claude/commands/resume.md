---
description: Resume the Office Pigeon overhaul — load the brain, report state, continue the current phase
---

You are resuming the multi-phase Office Pigeon overhaul. **Do NOT run `/init`** — that only rewrites CLAUDE.md.

Do these steps in order:

1. Read, in this order:
   - `docs/overhaul/04-HANDOFF.md` (where we left off)
   - `docs/overhaul/03-STATE.md` (Current Focus, Next Up, Status Board, Open Questions, Decision Log)
   - `docs/overhaul/02-PLAN.md` (the active phase's tasks + acceptance criteria)
   - `docs/overhaul/01-ANALYSIS.md` only as needed for issue-ID detail (`PERF-01`, `SEO-04`, …)

2. Post a short status report: current phase, what's done, what's next (the specific next tasks), and any **Open Questions that block progress**.

3. **Manual-step gate (blocking):** open `docs/overhaul/05-PREREQS.md` and check the next phase's Manual Prerequisites. If any are unmet, STOP — present the full step-by-step instructions to the user and **wait for them to reply `done`** (or provide the requested info) before doing any phase code work. Phases marked "none" proceed immediately.

4. If a blocking Open Question / prereq exists, ask the user (use AskUserQuestion where it's a choice) before coding. If nothing blocks, **begin executing the next uncompleted task(s) of the current phase** per the plan — write code, follow the acceptance criteria.

4. Respect locked decisions in STATE's Decision Log — do not re-litigate them.

5. As you complete work: update `docs/overhaul/03-STATE.md` (Status Board, per-issue tracker, Session Log), `docs/overhaul/04-HANDOFF.md`, the Progress Snapshot in `CLAUDE.md`, and tick boxes in `05-PREREQS.md`.

6. **At the end of each phase (and after meaningful tasks): commit & push to `origin/main`** — `git add -A && git commit -m "<scope>: <change>" && git push`. Every phase is a recoverable checkpoint; never close a phase without pushing. (`rtk` prefix if available on PATH; plain `git` otherwise.)

$ARGUMENTS
