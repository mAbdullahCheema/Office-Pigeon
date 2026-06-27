# Office Pigeon

Marketing + lead-generation site for **Office Pigeon** — an agency selling Websites, Smart Chatbots, AI Calling Agents, and Workflow Automations to small/growing businesses. Live at **officepigeon.com** (Node app on Hostinger).

Includes a **Pip AI** RAG assistant, an **ElevenLabs voice tool** endpoint, a **free-preview hosting** system (`/previews/:slug`) with an admin manager, and a geo-gated **Pakistan** page.

> 🛠 This repo is undergoing a planned multi-phase overhaul (SEO/perf/responsive/security/maintainability + a Next.js SSR migration). **Start any work session by reading [`docs/overhaul/`](docs/overhaul/00-INDEX.md)** (handoff → state → plan). Contributors/agents: see [`CLAUDE.md`](CLAUDE.md).

## Stack (as-built)
- **Frontend:** Vite 6 + React 19 SPA, TypeScript, Tailwind v4, `motion`, Three.js hero. Manual routing in `src/App.tsx` (no router lib).
- **Server (live):** `server.ts` — Express; serves the built SPA (`dist`) plus all APIs, preview hosting, and Pakistan geo-gating.
- **Shared logic:** `lib/*` (Pip AI, LLM provider router, Supabase vectors).
- **Data/AI:** Supabase (leads, previews, pgvector knowledge). LLM fallback chain: Gemini → OpenRouter → Cerebras → Groq → Cohere.

> Note: `app/api/*` (Next.js route handlers) is currently **dead** — there is no `next.config` and no `next` build/start script. It will be consolidated during the planned Next.js migration.

## Prerequisites
- Node.js (LTS) + npm
- A Supabase project and at least one LLM API key (`GEMINI_API_KEY` is the primary provider)

## Setup
```bash
npm install --ignore-scripts   # skip the postinstall prod build during local setup
cp .env.example .env           # then fill in Supabase + LLM keys (see .env.example)
```
> `npm install` (without `--ignore-scripts`) triggers `postinstall` → a full prod build (`npm run build`). That's how Hostinger deploys, but it's slow and fails if env/deps are incomplete.

## Run
```bash
npm run dev      # tsx server.ts — Express + Vite middleware (hot dev)
npm run build    # vite build → scripts/copyPreviews.mjs → esbuild server.ts → dist/server.cjs
npm start        # node dist/server.cjs  (production / Hostinger)
npm run lint     # tsc --noEmit (type check — the only automated check today)
```

## Knowledge base (Pip AI vectors)
```bash
npm run pip:generate-knowledge   # build knowledge chunks
npm run pip:index-knowledge      # upload vectors to Supabase
npm run pip:test-vectors         # manual vector-search smoke check
```

## Environment
All config is via environment variables — see [`.env.example`](.env.example) for the full list (Supabase, the five LLM providers, email/SMTP, admin allowlist, ElevenLabs tool secret, Pip AI tuning).

## Project layout
```
src/            React SPA (pages/, components/, config.ts)
server.ts       Live Express server (APIs, previews, geo-gating, LLM fan-out)
lib/            Framework-agnostic logic (pip-ai, llm, supabase-vectors)
app/api/        Next.js route handlers (currently dead — to be consolidated)
knowledge/      Source content for Pip AI / AEO
supabase/       SQL schemas
docs/overhaul/  The overhaul brain — analysis, plan, state, handoff
```
