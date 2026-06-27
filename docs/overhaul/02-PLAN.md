# Office Pigeon — Phase-by-Phase Fix Plan

> Companion: [01-ANALYSIS](01-ANALYSIS.md) (issue IDs) · [03-STATE](03-STATE.md) (live progress) · [04-HANDOFF](04-HANDOFF.md)
>
> **Locked decisions** (see [03-STATE](03-STATE.md#decision-log)):
> 1. Host = Node app on Hostinger (live at officepigeon.com) → target runtime is **Next.js via `next start`**.
> 2. SEO = **Full Next.js SSR/SSG migration** (consolidate onto one runtime, retire Express + dead Next `app/api`).
> 3. Hero = **"Show the system working"** demo (Home + Pakistan).
> 4. This session = docs + memory only; no code yet.

## How to use this plan
- **Manual-step gate:** before starting any phase, check [05-PREREQS.md](05-PREREQS.md). If that phase has unmet manual prerequisites, present them step-by-step and **wait for the user to reply `done`** before doing phase work.
- Phases are ordered by dependency and risk. **Do not start a phase until its predecessor's acceptance criteria pass**, unless marked parallel-safe.
- Each phase: Goal → Tasks (with issue IDs) → Acceptance criteria → Risk/rollback.
- Mark progress in [03-STATE.md](03-STATE.md), not here. This file is the stable spec.
- Each task should land as its own small commit with a clear message; keep `main` deployable.

## Standing rule — commit & push every phase
**At the end of every phase** (and ideally after each meaningful task), **commit and push to `origin/main`**:
1. Update [03-STATE.md](03-STATE.md) (Status Board, per-issue tracker, Session Log) and [04-HANDOFF.md](04-HANDOFF.md).
2. `rtk git add -A`
3. `rtk git commit -m "<phase/scope>: <what changed>"`
4. `rtk git push`
This guarantees the live repo + the overhaul brain stay in sync and every phase is a recoverable checkpoint. Never close out a phase without pushing.

---

## Phase 0 — Safety net & baselines (parallel-safe, do first)
**Goal:** Be able to measure improvement and refactor without fear.

Tasks:
- [ ] Capture **baseline metrics**: Lighthouse (mobile+desktop) for `/`, `/websites`, `/pakistan`; record LCP, CLS, TBT, total JS, FCP. Save numbers in [03-STATE](03-STATE.md). (PERF-*)
- [ ] Capture **baseline SEO state**: `curl` the live HTML and confirm empty-root rendering; screenshot current SERP/OG. (SEO-01)
- [ ] Add tooling: real `lint` (ESLint flat config + typescript-eslint) and `format` (Prettier/Biome); keep `tsc --noEmit`. Add minimal CI (typecheck + build) if a CI host is available. (ARCH-07)
- [ ] Add a smoke test harness (Playwright) that loads each route and asserts no console errors + no horizontal overflow at 320/768/1280/1920. (RESP-*, ARCH-07)
- [ ] Replace stale `README.md` with real setup/run/build/deploy docs; remove/replace `metadata.json` AI-Studio scaffold. (ARCH-04)

**Acceptance:** Baselines recorded in STATE; `npm run lint` works; smoke test runs locally.
**Risk:** None (additive). 

---

## Phase 1 — Performance quick wins (parallel-safe, no architecture change)
**Goal:** Kill the visible lag/stutter on the current SPA before the migration, so the live site improves immediately and the migration starts from a clean baseline.

Tasks:
- [ ] **PERF-01 (highest impact):** Stop driving React state from the rAF loop in `ThreeHub`. Track `activeNode` in a ref and only `setState` when the value actually changes **and** throttle to ≤4–6 updates/sec (or drive the overlay highlight via direct DOM/class mutation, no React state). Verify zero per-frame re-renders with React DevTools Profiler.
- [ ] **PERF-02:** Reduce always-on paint layers. Make the App gradient circles `content-visibility:auto` / smaller / static; gate `home-orbit-field` animation behind `prefers-reduced-motion: no-preference` AND `min-width` (already partly done) and consider pausing when offscreen. Drop or simplify the 230px background word (also fixes SEO-06/RESP-03).
- [ ] **PERF-03:** Move fonts off `@import`. Add `<link rel="preconnect">` to `fonts.gstatic.com`, `<link rel="preload">` the two primary weights, self-host or use `font-display: swap`. Subset to weights actually used.
- [ ] **PERF-05:** Make idle prefetch incremental (prefetch on link hover/intent, or stagger), not all-11-at-once.
- [ ] **PERF-06/CONTENT-03:** Replace the deleting typewriter with a static confident headline (or a single CSS-only effect) — removes the 80ms setState loop.
- [ ] **PERF-07:** Add Vite `build.rollupOptions.manualChunks` (split `three`, `motion`, vendor), enable minify + gzip/brotli reporting.
- [ ] **PERF-08:** Remove the dead `SmoothScroll` no-op and the misleading comments; confirm native scroll + anchor offsets behave.
- [ ] **PERF-10/A11Y-01:** Add one global `prefers-reduced-motion` strategy (a matchMedia hook / CSS) used everywhere.

**Acceptance:** Home hero holds 60fps while idle (no per-frame React renders); mobile TBT down materially vs Phase 0 baseline; no font-driven layout shift. 
**Risk:** Low. Each change is isolated and reversible. Some overlap with Phase 4 (hero replacement may delete ThreeHub entirely) — if Phase 4 is imminent, do the minimal PERF-01 fix and skip deep ThreeHub polish.

---

## Phase 2 — Next.js foundation (the migration spine)
**Goal:** Stand up Next.js App Router as the real runtime, runnable on Hostinger, without yet moving every page. De-risk by running side-by-side until parity.

Tasks:
- [ ] Add `next.config` (or `vercel.ts`-style config not needed for self-host), `app/layout.tsx` (root metadata, fonts via `next/font`, global CSS), and a working `app/page.tsx`. Wire Tailwind v4 with Next.
- [ ] Decide structure: single Next app at repo root; `src/` React components become client components/islands as needed. Establish folder convention (kills ARCH-02).
- [ ] Port build/run to Next: `next build` + `next start` on the Hostinger Node host; document the exact Hostinger Node start command + env. (Decision dependency: Hostinger Node version / process manager.)
- [ ] **ARCH-01:** Plan the consolidation — Express routes become Next Route Handlers (`app/api/*`) and/or Next Middleware. Inventory every live Express endpoint and map it 1:1 (chat, pip/*, contact, package-inquiry, preview-leads, region-offer, admin/*, elevenlabs tool, preview file serving, Pakistan gating).
- [ ] Reuse `lib/*` as-is (already framework-agnostic). The existing `app/api/*` handlers become the basis (un-dead them), reconciled against the Express versions (keep the Express behavior where it diverges).

**Acceptance:** `next build && next start` serves a real SSR home page with correct `<title>`/meta in **view-source** (no JS needed); one API route works end-to-end through Next.
**Risk:** Medium. Keep the Express server as the live prod path until Phase 3 parity is proven. Rollback = keep deploying `dist/server.cjs`.

---

## Phase 3 — Page & API migration to SSR/SSG + SEO core
**Goal:** Every marketing page is server-rendered with correct per-URL HTML and metadata; backend consolidated onto Next. This is where SEO/AEO/GEO actually lands.

Tasks (pages):
- [ ] Migrate each page to an `app/<route>/page.tsx` Server Component, with interactive pieces (modals, Pip widget, hero demo, voice tools) as client islands. Pages: home, websites, chatbots, calling-agents, automations, examples, about, contact, faq, legal/*, pakistan. (ARCH-03)
- [ ] **SEO-02/07:** Per-page `generateMetadata` (title, description, canonical, OG, Twitter, og:image). (SEO-06: exactly one real `<h1>` per page.)
- [ ] **SEO-04:** JSON-LD components — Organization + LocalBusiness (site-wide), Service + Offer (service pages, sourced from the single config), FAQPage (from `config.ts` FAQs), BreadcrumbList. (CONTENT-04: single source of truth for pricing/claims → feed config, server prompt, and JSON-LD from one module.)
- [ ] **SEO-05:** `app/sitemap.ts` + `app/robots.ts` (with `Sitemap:` + keep `/previews/`,`/admin/` disallowed). **SEO-08:** optional `app/llms.txt` route from the knowledge base.
- [ ] **SEO-09:** decide hreflang/region strategy for PK vs global; keep Pakistan gating in **Next middleware** (port `canAccessPakistanPage` + country resolution).

Tasks (backend consolidation, ARCH-01/SEC/BE):
- [ ] Move preview hosting (static file serve + banner injection + status gating) into a Next Route Handler / middleware; preserve `X-Robots-Tag noindex` + cache headers. (SEC-05)
- [ ] Port rate limiting and country cache to a TTL-bounded or Supabase-backed store. (SEC-03, BE-01)
- [ ] Standardize all endpoint validation on **zod** (BE-04); add origin checks / honeypot on public POSTs (SEC-08).
- [ ] Add **security headers** via Next `headers()` (CSP, HSTS, X-Content-Type-Options, frame-ancestors, Referrer-Policy, Permissions-Policy). (SEC-02)
- [ ] Fix **trust proxy** to the real Hostinger hop, not `true` (SEC-01); admin allowlist env-only, deny by default (SEC-04).
- [ ] Decommission `server.ts` once parity verified; remove `next` vestige confusion is now resolved by becoming real.

**Acceptance:** view-source of every route shows unique title/description/canonical + JSON-LD; Rich Results Test passes for FAQ + Organization; sitemap reachable and listed in robots; all forms/chat/preview/admin work through Next; Express retired; security headers present (securityheaders.com style check).
**Risk:** Medium-High (this is the big one). Migrate page-by-page behind the scenes; cut DNS/prod to Next only after a full parity checklist. Keep a tagged rollback commit of the Express build.

---

## Phase 4 — Hero redesign: "Show the system working" (parallel-safe after Phase 2)
**Goal:** Replace the abstract 3D hub (Home + Pakistan) with a concrete, lightweight, SSR-friendly product demo. (CONTENT-01/02/03)

Tasks:
- [ ] Design the demo concept: inbound customer (WhatsApp bubble / incoming call / web form) → AI replies instantly → lead captured + booking → owner notified. Cover all four products with labeled, real-looking UI (not abstract nodes).
- [ ] Implement with CSS/SVG/lightweight Canvas (no Three.js for the hero); reduced-motion fallback shows a static, still-meaningful composition; fully responsive (no clipping 320px→ultrawide); content is real text (indexable).
- [ ] Remove ThreeHub from the hero (delete or repurpose elsewhere); drop `three` from the hero path → big JS win (PERF-04).
- [ ] Mirror the pattern on the Pakistan hero with PK-appropriate copy/pricing.
- [ ] Rewrite hero copy to a confident outcome promise aligned to PRODUCT.md voice (replace the typewriter gimmick).

**Acceptance:** Hero communicates the offer at a glance (quick unmoderated gut-check / 5-second test); 60fps on a no-GPU laptop; zero overflow on the device matrix; `three` no longer loaded on home.
**Risk:** Low-Medium (self-contained). Can ship independently once Next foundation exists.

---

## Phase 5 — Responsive & device hardening (the "never cut off, any device" goal)
**Goal:** Provably correct on any screen, aspect ratio, zoom, with/without GPU, old/new.

Tasks:
- [ ] **RESP-04:** Retire the global `!important` typography overrides; define a real fluid type scale (clamp-based tokens) and apply consistently. (A11Y-04)
- [ ] **RESP-01/02/03:** Convert masking `overflow-hidden` into structural layout; rebuild any absolute-positioned hero/decoration into grids/containers that cannot overlap or overflow.
- [ ] **RESP-05:** Adopt `dvh`/`svh` for full-height sections; test mobile browser-chrome resize.
- [ ] **RESP-06:** Apply the same audit to Pakistan and all long pages.
- [ ] **A11Y-02:** Contrast pass to WCAG AA (kill low-contrast gray microcopy per PRODUCT.md). **A11Y-03:** focus management + skip link + route-change announcements (Next router helps).
- [ ] Run the Phase 0 Playwright overflow/console matrix across all routes at 320/360/390/768/1024/1280/1440/1920 + 200% zoom; fix every failure.

**Acceptance:** Smoke matrix is green on all routes/breakpoints; manual pass on a real phone + an old/integrated-GPU laptop; AA contrast verified on key text.
**Risk:** Low, but broad — touch many files. Do per-page, re-run matrix each time.

---

## Phase 6 — Backend scalability & observability (hardening)
**Goal:** Ready to scale beyond one Hostinger process; debuggable.

Tasks:
- [ ] **BE-01/SEC-03:** Shared state (rate limits, country cache, preview cache) in Supabase/Redis with TTL.
- [ ] **BE-02:** Cache preview discovery with invalidation instead of per-request FS scans.
- [ ] **BE-03:** Tighten LLM fan-out (parallel race or shorter per-provider budget + circuit breaker) to cut chat tail latency.
- [ ] **BE-05:** Structured logging + request IDs + minimal metrics (capture the perf wins).
- [ ] **BE-06:** Supabase review — RLS on lead/contact/inquiry tables, indexes on `slug`/`created_at`; confirm service-role key never reaches the client (SEC-07).
- [ ] **ARCH-05/06:** Break up remaining god-files; single source of truth for content/pricing.

**Acceptance:** App runs correctly with 2 instances (state shared); DB review checklist complete; chat p95 latency improved; logs queryable.
**Risk:** Low-Medium; mostly additive infra.

---

## Phase 7 — Polish, QA, launch hardening
**Goal:** Ship-quality finish + regression safety.

Tasks:
- [ ] Final Lighthouse targets (see below) on all key routes.
- [ ] Full a11y audit (axe) to zero criticals.
- [ ] Expand Playwright to cover form submits, chat happy-path, preview gating, Pakistan gating, admin auth.
- [ ] AEO/GEO check: validate structured data, confirm AI answer engines can read `llms.txt`/content; verify pricing consistency across config/JSON-LD/knowledge.
- [ ] Re-run baseline-vs-final comparison in STATE; write the launch checklist.

**Acceptance / global success targets:**
- SEO: every route SSR with unique metadata + valid JSON-LD; sitemap+robots correct; Rich Results pass.
- Perf: mobile Lighthouse ≥ 90 perf on home; LCP < 2.5s, CLS < 0.1, TBT low; `three` off the hero path.
- Responsive: zero overflow/clipping across the device matrix incl. no-GPU/old devices + reduced motion.
- Security: headers present, trust-proxy fixed, validation+rate-limit hardened, no secrets client-side.
- Maintainability: one runtime (Next), one component tree, real README, lint+CI+smoke tests.
- Content: hero shows the system working; pricing single-sourced.

---

## Dependency map (at a glance)
```
Phase 0 (baselines)  ─┐ parallel-safe
Phase 1 (perf wins)  ─┴─> improve live SPA now
Phase 2 (Next foundation) ──> Phase 3 (pages+API+SEO)  ──┐
                              Phase 4 (hero) ────────────┤──> Phase 5 (responsive)
                                                          └──> Phase 6 (backend/scale)
All ──> Phase 7 (polish/launch)
```
Phases 1, 4 can land on the live SPA / early Next without waiting for full migration. Phase 3 is the critical path for SEO.
