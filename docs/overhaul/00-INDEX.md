# Office Pigeon — Overhaul Workflow (START HERE)

This folder is the **persistent brain** for the Office Pigeon improvement program. It exists so that any new session can run `/init` (or just start, since `CLAUDE.md` auto-loads and links here) and immediately regain full context — no re-explaining.

## The files
| File | Purpose | Update cadence |
|------|---------|----------------|
| [00-INDEX.md](00-INDEX.md) | This map + how the workflow connects to `/init`. | Rarely |
| [01-ANALYSIS.md](01-ANALYSIS.md) | Deep analysis report — every issue, severity, evidence (`file:line`), stable IDs. | When new issues found |
| [02-PLAN.md](02-PLAN.md) | Phase-by-phase fix plan with tasks, acceptance criteria, risks. Stable spec. | When scope changes |
| [03-STATE.md](03-STATE.md) | **Living** memory: decisions, progress board, metrics, next-up, open questions. | **Every session** |
| [04-HANDOFF.md](04-HANDOFF.md) | "Pick up the thread" doc for resuming. | End of each session |

## Resume protocol (every new session)
**Fastest: type `/resume`** — the project command that loads this brain, reports current phase/next-up, and continues work. **Not `/init`** (that only rewrites `CLAUDE.md`).

Manual equivalent:
1. `CLAUDE.md` (auto-loaded) → points here.
2. Read [04-HANDOFF.md](04-HANDOFF.md) (where we left off).
3. Read [03-STATE.md](03-STATE.md) (current focus, status board, open questions).
4. Use [02-PLAN.md](02-PLAN.md) for the active phase, [01-ANALYSIS.md](01-ANALYSIS.md) for the "why" of any issue ID.
5. Do work → **update [03-STATE.md](03-STATE.md) and [04-HANDOFF.md](04-HANDOFF.md)** before ending.

## How this connects to `/init`
- Root `CLAUDE.md` is the codebase doc that `/init` produces and that loads into every session automatically.
- It contains an **"Overhaul / Resume Protocol"** section that links to this folder, so context is regained on session start.
- Durable cross-project facts (decisions, owner, gotchas) are *also* mirrored into the global memory (`MEMORY.md` + memory files) per the memory protocol, so recall surfaces them even outside this repo.
- **Net effect:** start a session → `CLAUDE.md` + memory recall point you here → read STATE/HANDOFF → continue exactly where we stopped.

## One-paragraph context (if you read nothing else)
Office Pigeon is a small-business AI services agency site (websites, chatbots, AI calling agents, workflow automations), live at officepigeon.com on Hostinger Node, currently a **Vite React SPA served by Express** — which makes it **invisible to SEO/AI engines**, **laggy** (a Three.js hero drives React state every animation frame), and the **hero doesn't show the product**. The plan: migrate to **Next.js SSR/SSG** (fixing SEO + consolidating a dead duplicate Next backend), kill the perf hot spots, rebuild the hero to **"show the system working,"** and harden responsiveness/security/scalability — in phases, keeping the live site deployable throughout. Decisions are locked in [03-STATE](03-STATE.md#decision-log).
