# Office Pigeon — Session Handoff (READ THIS FIRST TO RESUME)

> Ask me to "read the handoff and continue" → I read this top-to-bottom and pick up exactly here. This file is self-sufficient; the other docs are reference. **Last updated: 2026-06-27.**

---

## 1. What this project is
Marketing + lead-gen site for **Office Pigeon** (agency: Websites, Chatbots, AI Calling Agents, Workflow Automations). Live at **officepigeon.com** on **Hostinger (Node app)**. Currently a **Vite + React 19 SPA served by Express** (`server.ts`). We are mid-overhaul: perf, SEO/AEO/GEO, responsive, security, scalability, and a new hero.

Full brain: [01-ANALYSIS](01-ANALYSIS.md) (issues+IDs) · [02-PLAN](02-PLAN.md) (phases) · [03-STATE](03-STATE.md) (live progress, baselines, decisions) · [05-PREREQS](05-PREREQS.md) (manual-step gate). Root [`CLAUDE.md`](../../CLAUDE.md) auto-loads each session.

## 2. Locked decisions (do NOT re-litigate)
- **Runtime target = Next.js**, run on Hostinger Node via the **entry file** (see §6). Full **SSR/SSG migration** is the SEO fix; it also kills the dead duplicate Next `app/api`.
- **Hero = "show the system working"** demo (done, see §4).
- **Canonical = apex `https://officepigeon.com`** (no www).
- **No staging** → test locally, then push to live. Keep Express build as tagged rollback before cutover.
- **Observability = Sentry + PostHog** (Phase 7).
- Standing rule: **commit & push to `origin/main` at the end of every phase / meaningful task.**
- **Manual-step gate:** before starting a phase, check [05-PREREQS](05-PREREQS.md); if it has unmet manual steps, present them and **wait for the user to reply `done`** before phase code work.

## 3. Status — what's DONE
- **Docs/memory system + `/resume` command + manual-step gate.**
- **Phase 0 (partial):** GitHub Actions CI (uses `npm install` — fixed the lockfile-drift failure), `.gitattributes` (LF), `.editorconfig`, real README, **PageSpeed baselines captured** (in [03-STATE](03-STATE.md#metrics-baseline--captured-2026-06-27-pagespeedlighthouse-134-post-phase-14)).
- **Phase 1 (perf):** PERF-01 (no per-frame setState in old hero), PERF-03 (fonts preconnect), PERF-07 (vite chunks), PERF-08 (dead SmoothScroll removed).
- **Phase 4 (hero):** `src/components/SystemDemo.tsx` on Home + Pakistan — Three.js + typewriter removed (`three` no longer loaded), single H1, and **interactive channel tabs** (Website/WhatsApp/Call/Automation each show a distinct scenario). PERF-04/06, CONTENT-01/02/03/05, SEO-06.
- **RESP-08 interim:** `/websites` CLS≈0.99 root-caused (lazy-route Suspense fallback) and mitigated (fallback now `min-h-[100dvh]`). Real fix = SSR.
- **Phase 2 (Next.js foundation):** Next 16 App Router now **builds + runs side-by-side** with the live Vite/Express SPA without breaking it. `next.config.ts` (`output:'standalone'` + scoped `tsconfig.next.json`), `postcss.config.mjs` (Next-only), `app/layout.tsx` (metadata + `next/font`, canonical=apex), `app/globals.css`. Un-deaded `app/api/*`. Coexistence mechanics in §6a.
- **Phase 3 frontend SSR + SEO core:** **all 13 marketing pages ported** to `app/(site)/<route>` Server Components, each reusing its `src/views/*` UI as a client island via the `SiteChrome` actions context. Single-source `lib/site/routes.ts`; per-route metadata (`lib/seo/pageMetadata.ts`, SEO-02); JSON-LD Org/LocalBusiness/Service/FAQ/Breadcrumb (`lib/seo/jsonld.ts` + `app/_components/JsonLd.tsx`, SEO-04); `app/robots.ts` + `app/sitemap.ts` (SEO-05). **Verified:** `next build` green; every page serves unique title+content+JSON-LD in raw HTML; SPA still green.
- **Phase 3 API parity COMPLETE + PK gating:** ported 1:1 from `server.ts` (reuse `lib/*` + new `lib/server/{env,formUtils,previews,adminAuth,pakistanPage}.ts`, `lib/geo/country.ts`): `/api/contact-submission`, `/api/package-inquiry`, `/api/region-offer`, `/api/public/previews`, `/api/admin/{config,me,previews,previews/[slug],previews/[slug]/status}`, **preview file serving** (`app/previews/[slug]/[[...rest]]` — banner injection + `<base href>` + status gating + content-types + noindex), **`/api/preview-leads`** (rate-limited). `middleware.ts` gates `/pakistan`. **Security headers** (next.config `headers()`, SEC-02) + **branded og:image** (`app/opengraph-image.tsx`, referenced in `pageMetadata`).
- **Cutover proven (not yet flipped):** `scripts/buildNext.mjs` assembles `dist/` from `.next/standalone`; `node dist/server.cjs` boots Next serving home(SSR)/about/api/previews — all 200. Express still the live build until the flip (see §6).

## 4. Status — what's NOT done / next
1. **Phase 3 — SSR pages + JSON-LD + sitemap/robots + backend consolidation + boot cutover (the next big task).** The actual SEO payoff. See §6.
2. **RESP-08 full fix** via SSR; owner to re-run PageSpeed on `/websites` to confirm the interim drop. (Source now `src/views/Websites.tsx`.)
3. **Phase 0 leftovers:** ESLint/Prettier (install hit an eslint-9 peer-dep conflict vs react19/next16 → use `--legacy-peer-deps` or pinned versions, advisory/non-breaking config), Playwright smoke test (`npx playwright install`).
4. **og:image** 1200×630 branded asset (generate during Phase 3 metadata).
5. **Phase 5** responsive matrix (old+new mobile, tablet, laptop, desktop; esp **16:9 and 16:10**; 200% zoom; no-WebGL; reduced-motion). **Phase 6** backend/scale. **Phase 7** Sentry+PostHog + launch.
6. **Clean up** dead `PakistanHeroVisual`/`heroModes` in `src/views/Pakistan.tsx` (tree-shaken, but remove from source in the ESLint pass).

## 5. Waiting on the owner (non-blocking for code)
- Confirm **CI is green** now (switched to `npm install`).
- Add **Search Console TXT** at officepigeon.com DNS → `google-site-verification=E3BCUJxl6vi7Owulx2oiRpF41YgCRhF8s8RGtDw4xw0`, then Verify. Needed before sitemap submit, not before code.
- **Sentry DSN + PostHog key/host** when we reach Phase 7.
- Owner will **submit the sitemap only after the assistant's green signal** (all on-page + technical SEO finalized).

## 6a. Phase 2 result — how Next & Vite coexist NOW (don't re-derive this)
Phase 2 is **done**. Mechanics to know before touching the build:
- **Live path untouched:** `npm run build` (vite+esbuild → `dist/server.cjs`), `npm start`, `postinstall` are unchanged. Express is still the live runtime.
- **Next-only scripts:** `npm run build:next` / `start:next` / `dev:next`.
- **Tailwind split:** `postcss.config.mjs` (`@tailwindcss/postcss`) is for **Next only**; `vite.config.ts` pins inline `css.postcss:{plugins:[]}` so Vite ignores it (Vite keeps `@tailwindcss/vite`). `app/globals.css` mirrors `src/index.css` brand tokens; fonts via `next/font` CSS vars.
- **tsconfig split:** root `tsconfig.json` = the SPA's (untouched). Next uses **`tsconfig.next.json`** (wired via `next.config` `typescript.tsconfigPath`), scoped to `app/`+`lib/` only — Next does NOT type-check the legacy SPA. Next mutates `tsconfig.next.json`, never root. `.next/` + `next-env.d.ts` gitignored.
- **Rename:** `src/pages/` → **`src/views/`** (SPA view components, not Next pages) to avoid App-Router-vs-Pages-Router collision. Only `src/App.tsx` imported them. **All docs/paths now say `src/views/`.**

## 6b. Phase 3 frontend pattern — how pages are ported (reuse this for any remaining UI)
- **Page** = `app/(site)/<route>/page.tsx` Server Component: `export const metadata = pageMetadata('<id>')` + `<JsonLd data={[...]} />` + renders `<XView/>`.
- **View** = `app/(site)/<route>/XView.tsx` `"use client"`: `const {navigate, openPackageModal, openConsultation} = useSite()` → renders the unchanged `@/src/views/X` with those as props.
- **Chrome/context** = `app/(site)/SiteChrome.tsx` (`useSite()`), wrapped by `app/(site)/layout.tsx`. Home lives at `app/(site)/page.tsx` (root `app/page.tsx` removed). Legal = 4 routes sharing `app/(site)/LegalView.tsx`.
- **SEO single source** = `lib/site/routes.ts` (routes+titles+descriptions), `lib/seo/{pageMetadata,jsonld}.ts`, `app/_components/JsonLd.tsx`.

## 6. ▶️ EXACT NEXT STEP — THE BOOT CUTOVER (owner-gated; everything else in Phase 3 is done)
All Phase 3 code is complete + verified locally. The only remaining step flips the live runtime from Express to Next. It's owner-gated because it needs a Hostinger change and is the production switch.

**Cutover steps (do together with owner):**
1. **Owner (Hostinger):** set Node version to **22.x**. Start command stays `node dist/server.cjs` (the new `dist/server.cjs` is a shim that boots Next — no entry-file change needed). Confirm Supabase + LLM env vars are set in Hostinger Node settings.
2. **Assistant:** `git tag express-rollback <sha>` (current Express build) for instant rollback.
3. **Assistant:** flip `package.json` `build` → `next build && node scripts/buildNext.mjs` (keep `postinstall` → `build`; the old vite+esbuild build is the rollback). Commit + push → Hostinger redeploys via postinstall → live on Next.
4. **Verify live:** view-source title/desc/canonical/JSON-LD per route; forms/chat/preview/admin all work; security headers (securityheaders.com); `/pakistan` gated; PageSpeed re-run (RESP-08 `/websites` CLS should drop to ~0).
5. **Rollback if needed:** revert the build-script commit (or `git checkout express-rollback -- package.json`), redeploy → Express back.

**Already proven locally:** `node scripts/buildNext.mjs` (after `next build`) → `node dist/server.cjs` serves home(SSR)/about/api/previews all 200.

**Hard Hostinger constraint:** start command fixed to `node dist/server.cjs` (cannot change); entry file content CAN change + Node→22. Satisfied by the shim approach.

**Acceptance (Phase 3):** ✅ every route view-source has unique title/desc/canonical + JSON-LD; ✅ API parity + security headers + og:image; **pending cutover:** forms/chat/preview/admin verified on live Next, Express retired. Then hand owner the **green-signal checklist** for sitemap submission.

### §3-test — how the ported APIs were verified (local `next start`)
region-offer → JSON; contact/package-inquiry POST → 503 Supabase-guard (no local env), same as Express; admin/config → JSON; admin/me (no token) → 401; public/previews → lists real `previews/` folders; `/pakistan` → restricted page by default, real page with `x-vercel-ip-country: PK`, restricted with `US`.

## 7. Landmines / gotchas
- Live runtime is **Express** (`server.ts`), NOT Next. `app/api/*` is currently **dead** (no `next.config`/scripts).
- `lib/*` IS used by Express — reuse it, don't rewrite.
- Don't restore `SmoothScroll` (deleted; native scroll is intended).
- Pricing is duplicated (`src/config.ts`, server `SYSTEM_PROMPT`, `knowledge/*`) — single-source it during migration (CONTENT-04).
- `trust proxy: true` + IP rate limits are spoofable (SEC-01) — fix when porting to Next; add security headers (SEC-02).
- Pakistan page is bespoke + geo-gated (PK only); mirror Home changes; it still has dead `PakistanHeroVisual`/`heroModes`.
- Build verify = `npm run lint` (tsc) + `npx vite build`. `gh`/`rtk` are NOT on PATH in this environment — use plain `git`.
- Untracked stray file: `public/logos/office-pigeon-icon .png` (note the space) — confirm intent before adding/deleting.

## 8. Commit log this overhaul (newest first)
- `f2963c0` build(next): add cutover build script (scripts/buildNext.mjs; not wired to live build yet)
- `84a7093` feat(next): Phase 3 — security headers (SEC-02) + branded og:image
- `fd7a7cb` feat(next): Phase 3 API parity complete — preview serving + preview-leads
- `6440e17` feat(next): Phase 3 API parity — admin previews, public previews, PK middleware
- `817cdf7` feat(next): Phase 3 API parity — contact, package-inquiry, region-offer
- `2ed3211` feat(next): Phase 3 — port all 13 marketing pages to SSR (metadata + JSON-LD per page)
- `c197e20` feat(next): Phase 3 — SSR foundation, SEO core (routes/jsonld/sitemap/robots), chrome + About
- `2c9c147` chore: add office-pigeon-icon .png asset
- `8dfd263` feat(next): Phase 2 — Next.js App Router foundation beside live SPA (SSR proven; src/pages→src/views; tsconfig/postcss split)
- `368ec6b` docs: rewrite HANDOFF as a complete self-sufficient resume doc
- `7f4a9b3` fix(perf): mitigate /websites CLS (RESP-08)
- `9dae432` feat(hero): interactive channel tabs + record baselines & phase inputs
- `2818bed` fix(ci): npm install (lockfile drift) + phase-gate system
- `983e73d` docs: eslint peer-dep deferral
- `a4b0926` chore: Phase 0 infra — CI, line endings, editorconfig
- `f8cf513` feat(hero): replace 3D hub with SystemDemo
- `5e3a1b9` perf: Phase 1 quick wins
- `4a9682c` chore: add /resume command
- `71ee53b` docs: overhaul analysis/plan/memory/handoff

## 9. End-of-session checklist (every time)
Update [03-STATE](03-STATE.md) (Status Board, per-issue tracker, Session Log) + this handoff (§3/§4/§8) + the Progress Snapshot in [`CLAUDE.md`](../../CLAUDE.md) + tick [05-PREREQS](05-PREREQS.md) boxes → then **commit & push**.
