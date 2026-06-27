# CLAUDE.md — Office Pigeon

Codebase guide + session-resume hub. Auto-loaded every session.

## 🔄 Overhaul / Resume Protocol (READ FIRST)
This repo is in a multi-phase improvement program. **To regain context, open [`docs/overhaul/`](docs/overhaul/00-INDEX.md):**
1. [`docs/overhaul/04-HANDOFF.md`](docs/overhaul/04-HANDOFF.md) — where we left off.
2. [`docs/overhaul/03-STATE.md`](docs/overhaul/03-STATE.md) — **living** progress, decisions, open questions, next-up.
3. [`docs/overhaul/02-PLAN.md`](docs/overhaul/02-PLAN.md) — phased fix plan (acceptance criteria per phase).
4. [`docs/overhaul/01-ANALYSIS.md`](docs/overhaul/01-ANALYSIS.md) — deep analysis, issue IDs (`PERF-01`, `SEO-04`, …).

**After doing work, update `03-STATE.md` and `04-HANDOFF.md`.** Don't re-litigate locked decisions (see STATE Decision Log).

**Standing rule:** at the end of **every phase** (and after meaningful tasks), **commit & push to `origin/main`** — `rtk git add -A && rtk git commit -m "..." && rtk git push`. Every phase is a recoverable checkpoint; never close a phase without pushing.

### Locked decisions
- Host = **Hostinger Node**, live officepigeon.com → run **Next.js via `next start`**.
- SEO = **full Next.js SSR/SSG migration** (also consolidates the dead duplicate Next backend).
- Hero = **"show the system working"** demo (Home + Pakistan); remove the Three.js hub.

---

## What this is
Marketing + lead-gen site for **Office Pigeon**, an agency selling: **Websites, Smart Chatbots, AI Calling Agents, Workflow Automations** to small/growing businesses. Includes a **Pip AI** RAG assistant, an **ElevenLabs voice tool** endpoint, a **free-preview hosting** system (`/previews/:slug`) with an admin manager, and a geo-gated **Pakistan** page (PK-only). Brand voice + design principles: see [`PRODUCT.md`](PRODUCT.md).

## Current architecture (as-built — see ANALYSIS for issues)
- **Frontend:** Vite 6 + React 19 **SPA**, TypeScript, Tailwind v4, `motion` (Framer Motion), Three.js hero. Manual routing in `src/App.tsx` (`history.pushState` + a `switch`, no router lib). Pages in `src/pages/*`, shared UI in `src/components/*`, content/pricing in `src/config.ts`.
- **Server (LIVE):** `server.ts` — Express. Serves the built SPA (`dist`) + all APIs (chat, pip/*, contact, package-inquiry, preview-leads, region-offer, admin/*, elevenlabs tool), preview file serving with banner injection, and Pakistan geo-gating.
- **`lib/*`** — framework-agnostic logic (Pip AI, LLM provider router, Supabase vectors). **Used by Express.**
- **`app/api/*`** — Next.js 16 route handlers that **duplicate** some Express routes but are **DEAD** (no `next.config`, no `next` build/start script; the `next` dependency is vestigial). Slated for consolidation in the migration.
- **Data/AI:** Supabase (leads, contact, package inquiries, preview status, pgvector knowledge). LLM fallback chain: Gemini → OpenRouter → Cerebras → Groq → Cohere. Knowledge in `knowledge/*.md` + `office-pigeon-supabase-knowledge-base/*`.

## Commands
```bash
npm run dev      # tsx server.ts — Express + Vite middleware (dev)
npm run build    # vite build → scripts/copyPreviews.mjs → esbuild server.ts → dist/server.cjs
npm start        # node dist/server.cjs  (production / Hostinger)
npm run lint     # tsc --noEmit  (no ESLint yet — Phase 0 adds it)
# Knowledge base:
npm run pip:generate-knowledge | pip:index-knowledge | pip:test-vectors
```
Env: copy `.env.example` → `.env`. Needs Supabase + at least one LLM key (GEMINI_API_KEY). Full list in `.env.example`.

> Note: tooling here is RTK-aware (see global `~/.claude/CLAUDE.md`) — prefer `rtk <cmd>` for git/build/test where applicable.

## Conventions / gotchas
- **No router** — navigation is manual via `App.tsx`. Page IDs/paths/titles live in `App.tsx` maps.
- **SEO is client-side only** today (meta set in a `useEffect`) — this is the #1 thing the migration fixes; don't add more client-only meta hacks.
- `src/components/SmoothScroll.tsx` is an intentional **no-op** (native scroll). Don't "restore" scroll-jacking.
- The home `<h1>` "AUTOMATE" background word is decorative but a real `<h1>` (collapse to one H1 when editing the hero).
- **ThreeHub** drives React state inside its rAF loop — the main perf bug (`PERF-01`). WebGL is already disabled <768px with an FPS fallback.
- **Pricing is duplicated** across `src/config.ts`, the server `SYSTEM_PROMPT`, and the knowledge base — change all or single-source it.
- Pakistan page (`src/pages/Pakistan.tsx`, ~1022 lines) is bespoke + geo-gated — mirror Home changes there.
- Two component trees exist (`src/components` vs root `components/pip-ai` via a re-export shim) — to be unified in the migration.
- Keep `main` deployable; small commits; preview routes + `/admin` stay `noindex`.

## Key files
| Path | What |
|------|------|
| `server.ts` | Live Express server (~1400 lines): APIs, previews, geo-gating, LLM fan-out, admin auth |
| `src/App.tsx` | SPA shell: manual routing, page maps, client meta injection |
| `src/pages/Home.tsx` | Home (hero = ThreeHub + typewriter) |
| `src/pages/Pakistan.tsx` | Geo-gated PK page (bespoke) |
| `src/components/ThreeHub.tsx` | Three.js hero (perf hot spot `PERF-01`) |
| `src/config.ts` | Packages, pricing, FAQs, example builds |
| `lib/pip-ai/*`, `lib/llm/*` | Pip AI RAG + LLM provider router (shared) |
| `app/api/*` | DEAD Next route handlers (to consolidate) |
| `docs/overhaul/*` | **The overhaul brain — start here each session** |
