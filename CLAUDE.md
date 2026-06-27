# CLAUDE.md — Office Pigeon

Codebase guide + session-resume hub. **Auto-loaded every session** — so context transfers automatically, including after `/init`.

## ▶️ ON SESSION START — DO THIS FIRST
This repo is in a multi-phase overhaul. At the start of every session (and whenever the user says "continue", "resume", or runs `/init` or `/resume`):
1. Read [`docs/overhaul/04-HANDOFF.md`](docs/overhaul/04-HANDOFF.md) → [`docs/overhaul/03-STATE.md`](docs/overhaul/03-STATE.md) (current focus, status board, decisions, open questions).
2. Give the user a short progress report: what's done, the current phase, and the next tasks.
3. Check [`docs/overhaul/05-PREREQS.md`](docs/overhaul/05-PREREQS.md) for the next phase. **If it has unmet manual prerequisites, STOP, present the full step-by-step instructions, and WAIT for the user to reply `done` before doing any phase work.** (See "Manual-step gate" below.)
4. If no manual prereqs block the next task, continue the work per [`02-PLAN.md`](docs/overhaul/02-PLAN.md).

> **`/init` note:** `/init` regenerates this file from the codebase — when doing so, **preserve this "ON SESSION START" section, the Progress Snapshot, the Manual-step gate, and the Locked decisions verbatim**, and still perform the session-start steps above. `/resume` is the project command that does all of this automatically.

## 🚦 Manual-step gate (blocking)
Before starting a phase, consult [`05-PREREQS.md`](docs/overhaul/05-PREREQS.md). If that phase lists manual steps the user must do (e.g. provide Hostinger runtime details, capture PageSpeed baselines, grant Search Console access), **present them step-by-step and do not begin the phase until the user replies `done`.** Phases marked "Manual prerequisites: none" proceed immediately. Tick the boxes in `05-PREREQS.md` as steps complete.

## ✅ Progress Snapshot  (keep in sync with 03-STATE; update after each work chunk)
- **Done:**
  - Overhaul docs/memory system + `/resume` command + manual-step gate (`05-PREREQS`) + this hub.
  - Phase 0: CI (`npm install` — fixed lockfile-drift fail), `.gitattributes`, `.editorconfig`, real README, **PageSpeed baselines captured** (in 03-STATE).
  - Phase 1 perf: PERF-01/03/07/08.
  - Phase 4 hero: `SystemDemo` on Home + Pakistan; Three.js/typewriter removed; single H1; **interactive channel tabs** (Website/WhatsApp/Call/Automation) — PERF-04/06, CONTENT-01/02/03/05, SEO-06.
  - **Phase 2 (Next.js foundation): DONE.** Next 16 App Router builds + runs **beside** the live Vite/Express SPA without breaking it. SSR proven (view-source title/desc/canonical/h1, no JS) + `/api/pip/health` works through Next; SPA path still green. Coexistence: `postcss.config.mjs` (Next-only) + Vite pinned to inline empty postcss; **`tsconfig.next.json`** scopes Next type-check to `app/`+`lib/` (root tsconfig untouched = SPA's); **`src/pages/`→`src/views/`** rename (App-vs-Pages-Router clash). Live `npm run build`/`start`/`postinstall` untouched; Next-only `build:next`/`start:next`/`dev:next`. (See 04-HANDOFF §6a.)
  - **Phase 3 frontend SSR + SEO core: DONE.** All 13 marketing pages ported to `app/(site)/<route>` Server Components (reuse `src/views/*` as client islands via `SiteChrome` context). Per-route metadata (SEO-02), JSON-LD (SEO-04), sitemap/robots (SEO-05) — verified in view-source. Pattern in 04-HANDOFF §6b.
  - **Phase 3 backend: CODE-COMPLETE.** Full API parity 1:1 with `server.ts` (forms, region-offer, admin previews, public previews, **preview file serving + banner** at `app/previews/[slug]/[[...rest]]`, **preview-leads**) + **Pakistan middleware** + **security headers** (SEC-02) + **branded og:image**. Shared logic in `lib/server/{env,formUtils,previews,adminAuth,pakistanPage}` + `lib/geo/country`. **Cutover proven:** `scripts/buildNext.mjs` → `node dist/server.cjs` boots Next (home/about/api/previews 200).
- **Not done / next:**
  - **THE BOOT CUTOVER (owner-gated, only thing left in Phase 3):** owner sets Hostinger Node→22; assistant tags `express-rollback`, flips `package.json` build → `next build && node scripts/buildNext.mjs`, pushes → live on Next. Then verify live + hand green-signal checklist for sitemap submit. Express stays as tagged rollback. See 04-HANDOFF §6.
  - **RESP-08:** `/websites` CLS ≈ 0.99 — inherently fixed by SSR; re-measure after porting `src/views/Websites.tsx`.
  - Phase 0 leftovers: ESLint/Prettier (`--legacy-peer-deps`), Playwright smoke test.
  - Phase 5 responsive matrix (16:9 + 16:10, old+new devices), Phase 6 backend/scale, Phase 7 launch (Sentry + PostHog; owner submits sitemap after green signal).

**After doing work, update `03-STATE.md`, `04-HANDOFF.md`, and this Progress Snapshot.** Don't re-litigate locked decisions (see STATE Decision Log).

**Standing rule:** at the end of **every phase** (and after meaningful tasks), **commit & push to `origin/main`** — `git add -A && git commit -m "..." && git push` (`rtk` prefix if on PATH). Every phase is a recoverable checkpoint; never close a phase without pushing.

### Locked decisions
- Host = **Hostinger Node**, live officepigeon.com → run **Next.js via `next start`**.
- SEO = **full Next.js SSR/SSG migration** (also consolidates the dead duplicate Next backend).
- Hero = **"show the system working"** demo (Home + Pakistan); remove the Three.js hub.

---

## What this is
Marketing + lead-gen site for **Office Pigeon**, an agency selling: **Websites, Smart Chatbots, AI Calling Agents, Workflow Automations** to small/growing businesses. Includes a **Pip AI** RAG assistant, an **ElevenLabs voice tool** endpoint, a **free-preview hosting** system (`/previews/:slug`) with an admin manager, and a geo-gated **Pakistan** page (PK-only). Brand voice + design principles: see [`PRODUCT.md`](PRODUCT.md).

## Current architecture (as-built — see ANALYSIS for issues)
- **Frontend:** Vite 6 + React 19 **SPA**, TypeScript, Tailwind v4, `motion` (Framer Motion), Three.js hero. Manual routing in `src/App.tsx` (`history.pushState` + a `switch`, no router lib). SPA view components in `src/views/*` (renamed from `src/pages/` in Phase 2 to avoid the Next App-Router-vs-Pages-Router clash), shared UI in `src/components/*`, content/pricing in `src/config.ts`.
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
**No test runner** — `tsc --noEmit` (`npm run lint`) is the only automated check; there are no unit/e2e tests. The `pip:test-vectors` script is a manual Supabase vector-search smoke check, not a test suite.
**`postinstall` runs `npm run build`** — a plain `npm install` triggers a full prod build (vite + esbuild → `dist/server.cjs`). This is how Hostinger deploys, but it makes installs slow and they fail if env/deps are missing. Use `npm install --ignore-scripts` to skip it locally.
Env: copy `.env.example` → `.env`. Needs Supabase + at least one LLM key (GEMINI_API_KEY). Full list in `.env.example`.

> Note: tooling here is RTK-aware (see global `~/.claude/CLAUDE.md`) — prefer `rtk <cmd>` for git/build/test where applicable.

## Conventions / gotchas
- **No router** — navigation is manual via `App.tsx`. Page IDs/paths/titles live in `App.tsx` maps.
- **SEO is client-side only** today (meta set in a `useEffect`) — this is the #1 thing the migration fixes; don't add more client-only meta hacks.
- `src/components/SmoothScroll.tsx` is an intentional **no-op** (native scroll). Don't "restore" scroll-jacking.
- The home `<h1>` "AUTOMATE" background word is decorative but a real `<h1>` (collapse to one H1 when editing the hero).
- The hero is now `src/components/SystemDemo.tsx` (lightweight CSS/SVG "show the system working" panel) on both Home and Pakistan. The old `ThreeHub` (Three.js) was deleted; `three` is no longer loaded. Old `PakistanHeroVisual`/`heroModes` in `Pakistan.tsx` are dead (tree-shaken) — remove in the ESLint cleanup pass.
- **Pricing is duplicated** across `src/config.ts`, the server `SYSTEM_PROMPT`, and the knowledge base — change all or single-source it.
- Pakistan page (`src/views/Pakistan.tsx`, ~1022 lines) is bespoke + geo-gated — mirror Home changes there.
- Two component trees exist (`src/components` vs root `components/pip-ai` via a re-export shim) — to be unified in the migration.
- Keep `main` deployable; small commits; preview routes + `/admin` stay `noindex`.

## Key files
| Path | What |
|------|------|
| `server.ts` | Live Express server (~1400 lines): APIs, previews, geo-gating, LLM fan-out, admin auth |
| `src/App.tsx` | SPA shell: manual routing, page maps, client meta injection |
| `src/views/Home.tsx` | Home (hero = SystemDemo) |
| `src/views/Pakistan.tsx` | Geo-gated PK page (hero = SystemDemo; has dead PakistanHeroVisual) |
| `src/components/SystemDemo.tsx` | Hero "show the system working" demo (CSS/SVG, reduced-motion safe) |
| `src/config.ts` | Packages, pricing, FAQs, example builds |
| `lib/pip-ai/*`, `lib/llm/*` | Pip AI RAG + LLM provider router (shared) |
| `app/api/*` | DEAD Next route handlers (to consolidate) |
| `docs/overhaul/*` | **The overhaul brain — start here each session** |
