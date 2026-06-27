# Office Pigeon — Deep Analysis Report

> Status snapshot: 2026-06-27 · Branch `main` · Live at officepigeon.com (Node app on Hostinger)
> Companion files: [00-INDEX](00-INDEX.md) · [02-PLAN](02-PLAN.md) · [03-STATE](03-STATE.md) · [04-HANDOFF](04-HANDOFF.md)

This report is the single source of truth for **what is wrong and why**. The fix sequencing lives in [02-PLAN.md](02-PLAN.md). Every issue has a stable ID (e.g. `PERF-01`) referenced by the plan and progress tracker so context survives across sessions.

Severity scale: **S1** = breaks the business goal (SEO invisibility, broken on real devices, security hole) · **S2** = major quality/perf/maintainability hit · **S3** = polish / hardening.

---

## 0. System Overview (as-built)

**Stack:** Vite 6 + React 19 SPA (client-rendered) · TypeScript · Tailwind v4 · `motion` (Framer Motion) · Three.js (hero) · Express `server.ts` (serves the SPA + all live APIs) · Supabase (leads, contact, package inquiries, preview status, pgvector knowledge) · 5-provider LLM fallback chain (Gemini → OpenRouter → Cerebras → Groq → Cohere) · Pip AI RAG assistant · ElevenLabs voice tool endpoint.

**Runtime today:** `npm run build` = `vite build` → `copyPreviews` → `esbuild server.ts` to `dist/server.cjs`. `npm start` = `node dist/server.cjs`. Express serves `dist` static + `index.html` fallback for all routes. **This is the live production path on Hostinger.**

**Routing:** Manual. `App.tsx` maps `window.location.pathname` → a `PageId` and renders via a `switch`; navigation uses `history.pushState` + `popstate`. No router library, no real per-URL server document.

**Pages:** home, websites, chatbots, calling-agents, automations, pakistan (geo-gated to PK), examples, about, contact, faq, legal (privacy/terms/refund/fair-usage), admin (preview manager).

**Two parallel backends (one is dead):**
- **Live:** Express endpoints in `server.ts` (`/api/chat`, `/api/pip/chat`, `/api/pip/lead`, `/api/contact-submission`, `/api/package-inquiry`, `/api/preview-leads`, `/api/region-offer`, `/api/admin/*`, `/api/elevenlabs/tools/...`, preview file serving, Pakistan gating).
- **Dead:** A Next.js 16 `app/api/*` tree duplicating several of these. There is **no `next.config`, no `next` build/start script** — Next never builds or runs. `lib/*` (pip-ai, llm, supabase-vectors, server vector search) is shared and **is** used by Express; the `app/api/*` route handlers are unreachable wrappers.

---

## 1. SEO / AEO / GEO — **S1, root-cause category**

The biggest single problem. The marketing site is a client-rendered SPA, so search crawlers and AI answer engines that don't execute (or under-execute) JS receive an empty shell.

| ID | Sev | Issue | Evidence | Impact |
|----|-----|-------|----------|--------|
| SEO-01 | S1 | Client-only rendering. Initial HTML is `<div id="root"></div>` + a module script. All visible content is painted by React after hydration. | `index.html`, `src/main.tsx` | Crawlers/AI engines index near-zero content. Rankings, rich results, and AI citations all suffer. |
| SEO-02 | S1 | Title/description/OG injected via JS in a `useEffect`, only for `home` and `pakistan`; other pages never get unique meta. | `src/App.tsx:89-116`, `PAGE_DESCRIPTIONS`/`PAGE_OG` only define `pakistan` | Most pages share the static `index.html` title/description. No per-page SERP snippets. |
| SEO-03 | S1 | No server-rendered per-URL HTML. Express returns the same `index.html` for every non-API route. | `server.ts:1392-1394` (`app.get('*')`) | Every URL looks identical to a non-JS crawler. |
| SEO-04 | S1 | No structured data (JSON-LD) anywhere. No Organization, LocalBusiness, Service, Offer, FAQPage, BreadcrumbList. | repo-wide grep: none | No rich results, weak entity understanding, poor AEO/GEO grounding — despite a rich FAQ + knowledge base already authored. |
| SEO-05 | S2 | No `sitemap.xml`; `robots.txt` has no `Sitemap:` directive and is minimal. | `public/robots.txt` | Slower/incomplete discovery. |
| SEO-06 | S2 | Duplicate/abused `<h1>`: a decorative 230px background "AUTOMATE" word is an `<h1>`, plus the real hero `<h1>`. | `src/pages/Home.tsx:106-108` and `:122-124` | Two H1s confuse semantic hierarchy; decorative text competes with the real headline. |
| SEO-07 | S2 | No canonical tags, no `theme-color`, no `lang`-per-page nuance, no Twitter card tags, no `og:image`. | `index.html` | Poor social unfurls and canonicalization. |
| SEO-08 | S2 | No `llms.txt` / AI-readable summary, even though `knowledge/*.md` and `office-pigeon-supabase-knowledge-base/*` are clean factual sources ready to expose. | repo | Missed AEO/GEO opportunity that's almost free given existing content. |
| SEO-09 | S3 | Pakistan page is geo-gated AND `noindex` when blocked; fine, but there's no hreflang/region signaling strategy for the PK vs global split. | `server.ts:1373-1381` | Region targeting left implicit. |

**Direction (decided):** Full migration to **Next.js App Router with SSR/SSG**, run as the Node app on Hostinger via `next start`. Real per-route HTML, Next Metadata API for per-page title/description/canonical/OG, JSON-LD components, generated `sitemap.ts` + `robots.ts`, optional `llms.txt`. This simultaneously kills the Express/Next duplication (ARCH-01).

---

## 2. Performance — **S1/S2, the "laggy, stuttery, slow" complaints**

These are concrete, reproducible causes — not vibes.

| ID | Sev | Issue | Evidence | Impact |
|----|-----|-------|----------|--------|
| PERF-01 | S1 | **React re-render storm.** `ThreeHub` calls `setActiveNode(...)` inside the `requestAnimationFrame` loop — potentially every frame. The "highest-Z node" flips constantly, so state genuinely changes ~many×/sec, re-rendering the overlay subtree each time. | `src/components/ThreeHub.tsx:296-304` (inside `animate`) | Main-thread React reconciliation fighting the 60fps render loop → jank, dropped frames, scroll stutter on the home hero. |
| PERF-02 | S2 | **Always-on large paint layers.** Three fixed 500–600px blurred radial-gradient circles render site-wide; plus `home-orbit-field` animates `background-position` over a full-viewport masked gradient for 24s infinite. | `src/App.tsx:245-247`; `src/index.css:137-162`; `src/pages/Home.tsx:102` | Continuous large-area repaints; expensive on integrated GPUs / old devices; competes with scroll. |
| PERF-03 | S2 | **Render-blocking fonts.** Google Fonts loaded via CSS `@import` (Manrope 6 weights + JetBrains Mono 4 weights). No `preconnect`, no `preload`, no `font-display` control beyond the URL param. | `src/index.css:1` | Blocks first paint; CLS and slow FCP, worst on slow networks. |
| PERF-04 | S2 | **Heavy hero dependency.** Three.js (~150KB+ gz) shipped purely for a decorative desktop hub. Lazy-loaded but still parsed/run on every desktop visit; drives PERF-01. | `src/components/ThreeHub.tsx`, `Home.tsx:11` | Large JS + GPU cost for decoration that (per business) doesn't even communicate the product. |
| PERF-05 | S2 | **Eager idle prefetch of everything.** On idle, App imports all 11 lazy pages + ThreeHub at once. | `src/App.tsx:124-145` | CPU/network spike shortly after load; can collide with hero animation and first interactions. |
| PERF-06 | S2 | **Multiple high-frequency setState timers.** `TypewriterWord` setState every 80–150ms indefinitely on the hero. | `src/pages/Home.tsx:13-61` | Constant re-renders + layout of the hero headline; minor but additive to PERF-01/02. |
| PERF-07 | S2 | **No build chunking strategy.** `vite.config.ts` has no `build.rollupOptions.manualChunks`, no compression, no modern/legacy target tuning. | `vite.config.ts` | Sub-optimal cache granularity and bundle splitting. |
| PERF-08 | S3 | **`SmoothScroll` is a dead no-op** `<div>` while `App.tsx` comments still advertise a "physics-based inertial smooth scroller." Global `scroll-behavior: smooth` + JS `scrollTo` remain. | `src/components/SmoothScroll.tsx`; `src/App.tsx:261-262`; `src/index.css:18-19` | Not itself slow (native scroll is good), but the misleading code/comment mismatch hides intent; prior scroll-jacking churn is likely part of the "stutter" history. Confirm no leftover global smooth-scroll fighting anchor jumps. |
| PERF-09 | S3 | `motion` (Framer Motion) `whileInView` used across most pages → many IntersectionObservers + animation work on scroll. | `Home/Pakistan/Websites/Chatbots/...` | Additive scroll cost on lower-end devices; candidate for reduced-motion gating + lighter transitions. |
| PERF-10 | S3 | No central `prefers-reduced-motion` strategy; animations are opt-out per spot, inconsistently. | repo-wide | Accessibility + perf on motion-sensitive / weak devices. |

**Note on GPU-less / old devices:** ThreeHub already disables WebGL `< 768px` and has an FPS-based fallback (`ThreeHub.tsx:317-326`), which is good. But the desktop re-render storm (PERF-01) and paint layers (PERF-02) still hit low-end laptops with no discrete GPU. The hero redesign (CONTENT-01) is the real fix.

---

## 3. Responsiveness / Device Robustness — **S1 for the "never cut off" goal**

Goal: usable, never clipped, never weird — any device, any aspect ratio, GPU or not. Current state has structural risks that need a systematic audit, not spot fixes.

| ID | Sev | Issue | Evidence | Impact |
|----|-----|-------|----------|--------|
| RESP-01 | S2 | **Overflow masked, not solved.** Root uses `overflow-x-hidden` and Home uses `overflow-hidden`, which hides horizontal overflow rather than preventing it. | `src/App.tsx:240`; `Home.tsx:101` | Real overflow sources (absolute hero, 230px text, gradient circles placed at negative offsets) get clipped silently; on some widths content can still jump or hide. |
| RESP-02 | S2 | **Absolutely-positioned hero viewport.** The 3D viewport uses `lg:absolute ... -right-[8%] xl:-right-[14%] w-[48vw] h-[700px]`. | `Home.tsx:158` | On unusual aspect ratios / zoom levels / between-breakpoint widths, this can collide with text or push off-canvas. Needs a robust grid that can't overlap. |
| RESP-03 | S2 | **Huge decorative type.** 120–230px "AUTOMATE" word positioned absolutely behind the hero. | `Home.tsx:105-109` | At narrow/odd widths it overlaps content and forces overflow. |
| RESP-04 | S2 | **Global typography `!important` overrides** remap Tailwind sizes (e.g. `text-[8px]`→0.8125rem, `text-xs`→0.875rem) and line-heights, fighting the utility framework. | `src/index.css:76-109` | Hard to reason about real rendered sizes; can break tight components, badges, and dense mobile layouts in ways that vary by element. |
| RESP-05 | S2 | No standardized use of dynamic viewport units (`dvh`/`svh`) for full-height sections; mobile browser chrome can clip. | repo-wide (server fallbacks use `100dvh` but the SPA largely doesn't) | Mobile address-bar resize jumps; potential clipping of hero CTAs. |
| RESP-06 | S2 | Pakistan page is 1022 lines of bespoke layout; parallel risk surface to Home for the same overflow/clip patterns, needs the same audit. | `src/pages/Pakistan.tsx` | Duplicated responsive risk. |
| RESP-07 | S3 | No documented breakpoint/spacing system; values are ad-hoc per component (arbitrary `[...]` utilities everywhere). | repo-wide | Inconsistent rhythm across devices; hard to keep "perfect" without a token system. |

**Direction:** Establish a device-matrix test pass (320px → ultrawide, plus zoom + reduced-motion + no-WebGL), convert masking `overflow-hidden` into structural fixes, replace absolute-hero with an unbreakable grid, adopt `dvh`/`svh`, and retire the `!important` typography overrides in favor of a real type scale.

---

## 4. Architecture & Maintainability — **S2**

| ID | Sev | Issue | Evidence | Impact |
|----|-----|-------|----------|--------|
| ARCH-01 | S1 | **Two backends, one dead.** Next.js `app/api/*` duplicates live Express routes but never runs (no `next.config`/scripts). | `app/api/**`, `server.ts`, `package.json` | Confusion, drift, doubled maintenance, and a trap for the next dev. The Next migration must consolidate onto **one** runtime. |
| ARCH-02 | S2 | **Two component trees / re-export shims.** `src/components/PipAIWidget.tsx` is a 1-line re-export of `components/pip-ai/PipAIWidget`; the marketing app lives in `src/`, the Next-flavored UI in root `components/`. | `src/components/PipAIWidget.tsx:1` | Unclear ownership; the migration needs a single canonical structure. |
| ARCH-03 | S2 | **Routing is hand-rolled.** No router; `switch` + `pushState`. Scroll restoration, focus management, and code-split boundaries are manual. | `src/App.tsx:77-237` | Fragile navigation, no per-route data/metadata hooks — exactly what Next App Router gives for free. |
| ARCH-04 | S2 | **Stale/boilerplate docs.** `README.md` is the Google AI Studio template; `metadata.json` is AI Studio scaffolding. | `README.md`, `metadata.json` | New contributors get misled; setup instructions are wrong for the real stack. |
| ARCH-05 | S2 | **God-files.** `server.ts` ~1400 lines mixes preview hosting, geo logic, LLM fan-out, rate limiting, admin auth, and HTML templating. Pages run 700–1022 lines. | `server.ts`, `Home.tsx`, `Pakistan.tsx`, `PackageModal.tsx` (871) | Hard to test, review, and change safely. |
| ARCH-06 | S3 | Config/content (packages, FAQs) lives in a 462-line `src/config.ts` and a parallel hard-coded set inside `Pakistan.tsx`. Pricing duplicated across config, server `SYSTEM_PROMPT`, and knowledge base. | `src/config.ts`, `Pakistan.tsx:57-...`, `server.ts:19-20` | Pricing drift risk (e.g. $500/$300 hardcoded in server prompt). Single-source-of-truth needed. |
| ARCH-07 | S3 | No tests, no CI, no lint beyond `tsc --noEmit`. | `package.json` | No regression safety net for a large refactor. |

---

## 5. Security — **S1/S2 (review-grade, authorized owner)**

| ID | Sev | Issue | Evidence | Impact / Fix direction |
|----|-----|-------|----------|------------------------|
| SEC-01 | S2 | `app.set('trust proxy', true)` trusts **all** proxies, while rate limiting keys on client IP derived from `X-Forwarded-For`. | `server.ts:821`, `getClientIp` `:352-357`, rate limiters `:612-636` | Spoofable `X-Forwarded-For` → rate-limit bypass / pollution. Set trust proxy to the specific hop count / Hostinger proxy, not `true`. |
| SEC-02 | S2 | **No security headers.** No CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`/frame-ancestors, Referrer-Policy, Permissions-Policy. | `server.ts` (none) | XSS blast radius, clickjacking, MIME sniffing. Add helmet-equivalent (or Next headers config). |
| SEC-03 | S2 | **In-memory rate-limit + country caches grow unbounded** (no eviction/sweep). | `server.ts:76-77, 319, 612-636` | Slow memory leak; also resets on every deploy/restart (ineffective in multi-instance). Move to a TTL store / shared cache for scale. |
| SEC-04 | S3 | Hardcoded admin email fallback in source. | `server.ts:156` (`'m.abdullahcheema9@gmail.com'`) | Allowlist baked into code; should be env-only with safe default of empty (deny). |
| SEC-05 | S3 | Preview HTML injection builds markup via string concat with a slug echoed into `wa.me` text. Slug is regex-validated (`^[a-z0-9-]+$`), so currently safe, but the pattern is fragile. | `server.ts:470-555` | Keep strict validation; prefer templating/escaping helpers consistently. |
| SEC-06 | S3 | Outbound geo-IP lookups use user-influenced IP (via XFF under trust-proxy-all). Targets are fixed hosts and IP is validated/public-only, so low SSRF risk, but tied to SEC-01. | `server.ts:374-412` | Resolve with SEC-01. |
| SEC-07 | S3 | Secrets surface is broad (5 LLM keys, Supabase service role, SMTP). No documented rotation; service-role key used server-side (correct) but ensure never bundled client-side. | `.env.example`, `lib/supabase/admin.ts` | Verify client bundle never imports service-role; document rotation. |
| SEC-08 | S3 | No CSRF protection on state-changing POSTs (lead/contact/inquiry). Same-origin SPA mitigates, but public unauthenticated POSTs can be spammed beyond rate limits. | `server.ts:1061-1216` | Add origin checks / honeypot / token; tighten validation (zod) server-side. |

> Scope note: this is a defensive review for the site's owner. No exploit tooling is implied.

---

## 6. Backend / Data / Scalability — **S2/S3**

| ID | Sev | Issue | Evidence | Impact |
|----|-----|-------|----------|--------|
| BE-01 | S2 | Single-process Express with in-memory state (rate limits, country cache) — not horizontally scalable; state lost on restart. | `server.ts` | Caps scaling to one instance; Hostinger restarts wipe caches. Move shared state to Supabase/Redis when scaling. |
| BE-02 | S2 | Preview discovery scans the filesystem on every relevant request (`scanPreviewFolders` reads dirs + per-folder `index.html` access). | `server.ts:164-241` | I/O per request; fine at small scale, slow as previews grow. Cache + invalidate. |
| BE-03 | S2 | LLM fan-out tries up to 5 providers sequentially per chat with 20s timeouts; worst case is very slow before the offline fallback. | `server.ts:803-815`, `.env` `PIP_AI_PROVIDER_TIMEOUT_MS` | Tail latency on the chat path; consider parallel race / shorter budgets / circuit breaking. |
| BE-04 | S3 | Validation is hand-rolled `nonEmptyString` checks; `zod` is a dependency and used in `lib/pip-ai/schemas.ts` but not on the Express request boundary. | `server.ts` vs `lib/pip-ai/schemas.ts` | Inconsistent input validation; standardize on zod at every endpoint. |
| BE-05 | S3 | No structured logging / observability; `console.*` only. No request IDs, no metrics. | `server.ts` | Hard to debug production issues or measure the perf work. |
| BE-06 | S3 | Supabase access patterns not reviewed for RLS/indexes here; schema files exist (`supabase/*.sql`). | `supabase/pip-ai-schema.sql`, `preview-management-schema.sql` | Needs a dedicated DB review (RLS on lead tables, indexes on `slug`, `created_at`). |

---

## 7. Accessibility — **S2 (PRODUCT.md targets WCAG AA)**

| ID | Sev | Issue | Evidence | Impact |
|----|-----|-------|----------|--------|
| A11Y-01 | S2 | Heavy `select-none` and decorative motion; no global reduced-motion respect for the JS/WebGL/typewriter animations. | `App.tsx:240`, `Home.tsx`, `ThreeHub.tsx` | Motion-sensitive users; also ties to PERF-10. |
| A11Y-02 | S2 | Contrast risks: lots of `text-gray-400` mono microcopy and light-on-light badges; PRODUCT.md explicitly warns against low-contrast gray. | `Home.tsx:146-153`, etc. | Fails AA in places; readability on bright/old screens. |
| A11Y-03 | S2 | Manual routing without focus management / skip links / route-change announcements. | `App.tsx` | Keyboard + screen-reader navigation is poor. |
| A11Y-04 | S3 | Tiny font utilities (`text-[8px]`/`[9px]`) used widely (mitigated by the CSS override, but still small) and ALL-CAPS mono for body-ish text. | `index.css:76-82`, pages | Legibility, especially mobile/low-vision. |

---

## 8. Content / Hero / Messaging — **S1 (owner-flagged)**

| ID | Sev | Issue | Evidence | Impact |
|----|-----|-------|----------|--------|
| CONTENT-01 | S1 | **Hero doesn't sell the product.** An abstract orbiting 3D hub of generic nodes doesn't show websites, chat replies, calls, or captured leads. PRODUCT.md says: "Show the system working, not only the final deliverable." | `Home.tsx:157-173`, `ThreeHub.tsx` | Visitors don't instantly grasp the offer; weak conversion + the perf cost of PERF-01/04 for no payoff. |
| CONTENT-02 | S1 | Same problem on the Pakistan hero (separate bespoke layout). | `Pakistan.tsx:1-230` | PK audience (the geo-gated, high-intent segment) gets a non-demonstrative hero too. |
| CONTENT-03 | S2 | Headline leads with a deleting-typewriter gimmick ("LOSING CUSTOMERS") that's perf-costly and reads as fragile vs. a confident outcome promise. | `Home.tsx:13-61, 122-124` | Brand feels gimmicky; PRODUCT.md wants "capable technical partner." |
| CONTENT-04 | S3 | Pricing/claims duplicated across `config.ts`, server `SYSTEM_PROMPT`, and knowledge base — drift risk that confuses AEO answers. | `config.ts`, `server.ts:19-20`, `knowledge/*` | AI assistants may quote stale prices. |

**Decided hero direction:** "**Show the system working.**" A concrete, lightweight, animated demo: an inbound customer (WhatsApp / call / web form) → AI replies instantly → lead captured / booking made → owner notified. Communicates all four products (Websites, Chatbots, Calling Agents, Automations) and the core promise (never miss a customer, reply instantly, capture every lead). Must be cheap to render (CSS/SVG/Canvas, reduced-motion aware), responsive, and SSR-friendly so it doubles as indexable content.

---

## 9. Issue Index (quick reference)

- **S1:** SEO-01, SEO-02, SEO-03, SEO-04, PERF-01, RESP (category), SEC (category review), CONTENT-01, CONTENT-02, ARCH-01
- **S2:** SEO-05/06/07/08, PERF-02/03/04/05/06/07, RESP-01..06, ARCH-02/03/04/05, SEC-01/02/03, BE-01/02/03, A11Y-01/02/03, CONTENT-03
- **S3:** SEO-09, PERF-08/09/10, RESP-07, ARCH-06/07, SEC-04..08, BE-04/05/06, A11Y-04, CONTENT-04

See [02-PLAN.md](02-PLAN.md) for how these map to phases.
