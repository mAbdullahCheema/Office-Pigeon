# Deploying Office Pigeon to Hostinger

The complete path from a connected repository to `https://officepigeon.com` serving the app, with the keep-alive cron running and error monitoring live.

Read it once before starting. Steps 1–4 can be done in any order; steps 5 onward are sequential.

---

## Two ways to deploy, and which one this describes

Hostinger offers two routes and they are genuinely different. Everything below is written for **A**, with **B** kept as a fallback.

**A — Git deployment.** You connect the GitHub repository in hPanel. Hostinger clones it, installs dependencies, runs `npm run build` and serves the result. You never upload anything: you push to `main` and it redeploys. Environment variables live in Hostinger's panel, because `.env.local` is deliberately not in the repository.

**B — Manual upload.** `npm run package:hostinger` produces a self-contained `deploy/` folder you upload and start yourself. Slower to iterate on, but entirely under your control and useful when a platform build misbehaves. See [Appendix: manual upload](#appendix-manual-upload).

### Why `output: 'standalone'` stays on

`next.config.ts` sets `output: 'standalone'`, which emits an extra `.next/standalone/server.js` beside the ordinary `.next` build. That is what route B uploads, and it costs route A nothing: the standalone folder is **additive**, `next build` still produces the normal output, and `next start` runs against it perfectly well — verified against this build, not assumed. Leaving it on means both routes work with no config change, and route B remains available as a rollback.

---

## Prerequisites

| Thing | Why |
| --- | --- |
| Hostinger **Business** plan or higher | Node.js applications require Business or above |
| `officepigeon.com` pointed at Hostinger | **Domains → DNS / Nameservers** |
| A Supabase project | Already provisioned |
| Node 20+ locally | Only for running the test suites and route B |

> **Node version.** Choose the newest offered — 20 or 22. Next.js 16 requires Node 20.9 or later and will not start on 18.

---

## Step 1 — Decide the canonical URL

Everything downstream depends on this being decided once and used consistently.

**Canonical: `https://officepigeon.com`** — apex, no `www`.

`NEXT_PUBLIC_SITE_URL` must equal it **exactly**: no trailing slash, `https` not `http`. It builds every canonical tag, every Open Graph URL, every sitemap entry and every OAuth redirect. A mismatch is the single most common cause of "Google indexed the wrong URL" and "sign-in redirects to localhost".

The `www → apex` redirect comes in step 6.

---

## Step 2 — Collect the environment variables

Start from your local `.env.local` and change these:

| Variable | Local | Production |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://officepigeon.com` |
| `SENTRY_ENVIRONMENT` | `development` | `production` |
| `NODE_ENV` | *leave it out entirely* | `production` |
| `PORT` | *unset* | *set by Hostinger — never hard-code it* |

Everything else — Supabase, OpenRouter, Google AI, Cerebras, Groq, Pinecone, Cal.com, Redis, `CRON_SECRET` — carries over unchanged.

> **Never put `NODE_ENV` in `.env.local`.** Next sets it itself: `development` for `next dev`, `production` for `next build` and `next start`. Forcing `production` in that file makes your local dev server drop `'unsafe-eval'` from the CSP — which React Refresh needs — and switch HSTS on against `localhost`. It belongs in the hosting panel and only there.

> **Security.** Never commit `.env.local`. `.gitignore` excludes `.env*` except `.env.example`. The Supabase secret key bypasses row level security: it belongs in the host's environment panel and nowhere else.

### There is no analytics vendor

The site ships no third-party JavaScript — no analytics, no tag manager, no pixel. The only external origin the browser may reach is Sentry's ingest endpoint, and only when a DSN is configured. If you ever add an analytics tool, gate it on the cookie banner's analytics category via `lib/consent.ts` and load it as a dynamic import, so declining costs the visitor nothing.

> If you add a PostHog-style tool later, the browser key is the **project** key (`phc_…`). A key beginning `phs_` is a **secret server-side key**: it can read your feature-flag and cohort definitions, and putting it behind a `NEXT_PUBLIC_` name publishes it to every visitor.

---

## Step 3 — Set up Sentry *(optional)*

1. Create a project at [sentry.io](https://sentry.io), platform **Next.js**.
2. Copy the DSN into both `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN`. The DSN is public by design — it only says where to send events.
3. For readable stack traces, create an auth token at **Settings → Auth Tokens** with the `project:releases` scope and set `SENTRY_ORG`, `SENTRY_PROJECT` and `SENTRY_AUTH_TOKEN`. On route A these belong in Hostinger's panel, because Hostinger runs the build.

Without the token the build still succeeds; traces are just minified. Without a DSN, Sentry's build plugin is not applied at all, and `next.config.ts` does not add its origin to the Content Security Policy.

To confirm ingestion works at any time:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST "https://<org-id>.ingest.us.sentry.io/api/<project-id>/envelope/?sentry_key=<public-key>&sentry_version=7" -H "Content-Type: application/x-sentry-envelope" --data-binary $'{"event_id":"00000000000000000000000000000001","sent_at":"2026-01-01T00:00:00Z"}\n{"type":"event"}\n{"event_id":"00000000000000000000000000000001","message":{"formatted":"probe"},"level":"info"}\n'
```

`200` means the DSN is valid and the project is reachable.

---

## Step 4 — Point Supabase at the production URL

1. **Authentication → URL Configuration → Site URL** → `https://officepigeon.com`
2. **Redirect URLs** — add both:
   - `https://officepigeon.com/api/auth/callback`
   - `https://www.officepigeon.com/api/auth/callback`
3. If Google sign-in is enabled, add the Supabase callback to your Google Cloud OAuth client's **Authorised redirect URIs**:
   - `https://<project-ref>.supabase.co/auth/v1/callback`

Supabase only redirects to URLs on this allow-list. A missing entry produces a silent failed sign-in.

---

## Step 5 — Connect the repository and set the build

In hPanel, import from GitHub and pick the `Office-Pigeon` repository. The settings that matter:

| Setting | Value | Why |
| --- | --- | --- |
| Framework preset | **Next.js** | |
| Branch | **main** | The only branch; CI gates every push to it |
| Node version | **22.x** | Next 16 needs ≥ 20.9 |
| Root directory | **`./`** | The app is at the repository root |
| Build command | **`npm run build`** | |
| Package manager | **npm** | `package-lock.json` is committed; npm is what CI uses |
| Output directory | **`.next`** | The standard build output. `next start` serves from here |
| Install command | `npm ci` if offered, else default | `ci` installs exactly the lockfile |

**Start command**, if the panel exposes one: `npm start` — which is `next start`. Do not point it at `.next/standalone/server.js` on this route; that file exists but the standard start is what matches an output directory of `.next`.

> **The build needs the environment variables.** Every `NEXT_PUBLIC_*` value is compiled into the browser bundle at build time. If they are missing or wrong when Hostinger builds, no amount of fixing them afterwards changes what visitors download — it needs a rebuild. Add them (step 6) **before** triggering the first deploy.

---

## Step 6 — Environment variables, domain and SSL

### Environment variables

Add every variable from step 2 in the panel's environment section, one per row. Do **not** set `PORT`.

Minimum for the app to boot:

```
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://officepigeon.com
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
CRON_SECRET=...
```

Then the rest: `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED`, `REDIS_URL`, `PIP_ENABLED`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_FREE_MODEL`, `GOOGLE_AI_API_KEY`, `GOOGLE_MODEL`, `CEREBRAS_API_KEY`, `CEREBRAS_MODEL`, `GROQ_API_KEY`, `GROQ_MODEL`, `PINECONE_API_KEY`, `PINECONE_INDEX_HOST`, `PINECONE_NAMESPACE`, `CALCOM_API_KEY`, `CALCOM_EVENT_TYPE_ID`, `CALCOM_USERNAME`, `CALCOM_EVENT_SLUG`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_ENVIRONMENT`.

That is 27 plus `NODE_ENV`. If your panel shows more than that, you are carrying variables the app no longer reads — remove anything matching `POSTHOG`, and remove `ADMIN_PASSWORD` once the owner account exists.

### Domain

Point `officepigeon.com` at this hosting account and make sure the application's domain is set to it.

### SSL

**Security → SSL** → install the free Let's Encrypt certificate for `officepigeon.com` **and** `www.officepigeon.com`. Wait for **Active** before enabling **Force HTTPS** — turning it on against a pending certificate locks you out of your own site.

> **HSTS is a two-year commitment.** In production the app sends `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`. Once a browser has seen it, plain HTTP to this domain *and every subdomain* is refused for two years. Confirm SSL works on the apex, on `www`, and on any subdomain you plan to use (`finance.`, `school.`, `whiteboard.`) before enabling it.

### www → apex redirect

**Domains → Redirects**: redirect `www.officepigeon.com` to `https://officepigeon.com` with a **301**. This is what stops search engines treating the two as separate sites.

---

## Step 7 — Deploy and verify

Trigger the first deploy, then watch the build log. A successful build ends with the route table — a list of `/`, `/pricing`, `/api/...` and so on.

If the build fails with `TypeError: Invalid URL` pointing at `app/layout.tsx`, `NEXT_PUBLIC_SITE_URL` is empty or malformed in the panel. The CI workflow has a preflight step that reports exactly this; the same check locally is:

```bash
node -e 'new URL(process.env.NEXT_PUBLIC_SITE_URL); console.log("ok")'
```

Then check, in order:

```bash
curl -s https://officepigeon.com/api/health
```

Expect `{"ok":true,"database":{"ok":true,...},"cache":{"status":"ok",...}}`.

| Result | Meaning |
| --- | --- |
| `database.ok: false` | Supabase variables wrong, or the project is paused |
| `cache.status: "off"` | `REDIS_URL` unset. The site works; rate limits are per-process |
| `cache.status: "degraded"` | Redis unreachable — the URL must start `rediss://`, two s's, so TLS is negotiated |

```bash
curl -sI https://officepigeon.com | grep -i "content-security-policy\|strict-transport"
```

```bash
curl -s https://officepigeon.com/llms.txt | head -20
```

---

## Step 8 — Wire up the keep-alive cron

A free-tier Supabase project **pauses after seven days without activity**, taking the site down until someone restores it by hand. The repository ships a GitHub Actions workflow that prevents that.

### Add the repository secrets

GitHub → **Settings → Secrets and variables → Actions**:

| Secret | Value |
| --- | --- |
| `CRON_SECRET` | The same value as in Hostinger |
| `NEXT_PUBLIC_SITE_URL` | `https://officepigeon.com` |

### Run it once by hand

**Actions → Supabase keep-alive → Run workflow.** It should finish green with `HTTP 200`.

- **401** — `CRON_SECRET` differs between GitHub and Hostinger.
- **503** — the site is up but cannot reach Postgres.

### The schedule

`17 4 */5 * *` fires on the 1st, 6th, 11th, 16th, 21st, 26th and 31st at 04:17 UTC. The longest gap in any month is five days, comfortably inside Supabase's seven.

### The one caveat

**GitHub disables scheduled workflows in a repository idle for 60 days**, emailing the owner first. Either push something every couple of months, or add a second trigger from hPanel → **Advanced → Cron Jobs**, every 3 days:

```bash
curl -s -X POST https://officepigeon.com/api/cron/keepalive -H "Authorization: Bearer YOUR_CRON_SECRET" -o /dev/null
```

Two triggers cost nothing and remove the single point of failure.

---

## Step 9 — Post-launch checks

**Function**

- [ ] Home page loads over HTTPS with no console errors
- [ ] `www.officepigeon.com` 301-redirects to the apex
- [ ] The cookie banner appears on a first visit in a clean browser profile, and "Reject all" makes it stay away
- [ ] Contact form submits and appears in **Dashboard → Messages**
- [ ] Order flow completes and appears in **Dashboard → Orders**
- [ ] Sign-in works, including Google if enabled
- [ ] `/dashboard` redirects a signed-out visitor to `/login`
- [ ] Pip answers, quotes a price, offers a slot, and the confirm card books
- [ ] An order status change live-updates an open dashboard without a reload

**Machine surface**

- [ ] `/sitemap.xml` lists production URLs, not localhost
- [ ] `/robots.txt` points at the production sitemap
- [ ] `/llms.txt` returns the catalogue with current prices
- [ ] Structured data passes [Google's Rich Results Test](https://search.google.com/test/rich-results) on `/`, `/pricing`, `/faq` and a service page
- [ ] Social card renders in [opengraph.xyz](https://www.opengraph.xyz) — and on a 404 URL, which has its own `metadataBase`

**Search**

- [ ] Domain verified and sitemap submitted in [Google Search Console](https://search.google.com/search-console)
- [ ] Submitted in [Bing Webmaster Tools](https://www.bing.com/webmasters) — this also feeds ChatGPT's web search

**Monitoring**

- [ ] Sentry has received at least one event
- [ ] Keep-alive workflow has run green
- [ ] An uptime monitor pings `/api/health` every 5 minutes — [UptimeRobot](https://uptimerobot.com) is free and enough

**Database**

- [ ] Supabase performance advisor's "multiple permissive policies" warnings are **expected**: each table carries an own-row policy *and* a staff policy, and both are evaluated for a signed-in reader. Merging each pair into a single `OR` policy is a real optimisation but rewrites the authorisation model across 25 tables. Revisit only when a dashboard query actually shows up slow in Sentry's traces.

**Rebuild the knowledge base** if any price or content changed during setup:

```bash
npm run kb:index
```

---

## Updating a live deployment

Push to `main`. Hostinger rebuilds and redeploys.

Environment variable changes need a redeploy to take effect, and `NEXT_PUBLIC_*` changes need a **rebuild**, not just a restart — they are compiled into the browser bundle.

CI runs typecheck, lint and build on every push, so a broken commit fails on GitHub before Hostinger ever sees it.

---

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Build fails, `TypeError: Invalid URL` at `app/layout.tsx` | `NEXT_PUBLIC_SITE_URL` empty or malformed in the panel | Set it to `https://officepigeon.com` and redeploy |
| Build succeeds, site 502s | Wrong start command, or a missing required env var | Start command should be `npm start`; check the runtime log |
| Pages render but images 404 | Output directory wrong | It must be `.next` |
| Sign-in loops back to `/login` | Redirect URL not allow-listed in Supabase | Step 4 |
| Sign-in redirects to localhost | `NEXT_PUBLIC_SITE_URL` was wrong **at build time** | Fix it and rebuild — a runtime change is not enough |
| Pip says it cannot answer | No provider key reached the server, or `PIP_ENABLED=false` | Check the panel. `/api/health` stays green — Pip is not a health dependency |
| `cache.status: "degraded"` | Redis unreachable or using `redis://` | Use `rediss://` for TLS |
| Site down after ~7 days idle | Supabase project paused | Restore it, then fix the keep-alive (step 8) |
| CSP errors after adding a script | The policy allows no third-party `script-src` | Add the origin in `next.config.ts` deliberately, and rebuild |
| Scheduled workflow stopped running | 60-day repository inactivity | Re-enable in the Actions tab, and add the hPanel cron |

---

## Scaling beyond one instance

The app is already written for it: rate-limit counters and the content cache live in Redis, so several instances share one budget and one cache rather than each keeping its own.

1. Set `REDIS_URL` on every instance, pointing at the same Redis.
2. Put them behind a load balancer that honours `/api/health` — it returns 503 when Postgres is unreachable, which is the signal to drain that instance.
3. Sessions are Supabase JWTs in cookies, so no sticky sessions are needed.

Well before you reach a single process's ceiling, the useful next step is a CDN in front of the origin: the marketing pages are cacheable, and `/dashboard` and `/api` already send `no-store`, so a cache can be enabled without leaking a session.

---

## Appendix: manual upload

The fallback when a platform build misbehaves, and the route that gives you an exact rollback artefact.

Build locally with the **production** `NEXT_PUBLIC_SITE_URL` in `.env.local`:

```bash
npm ci && npm run build && npm run package:hostinger
```

Verify nothing local leaked into the browser bundle:

```bash
grep -rl "localhost:3000" deploy/.next/static || echo "clean"
```

The result in `deploy/` is self-contained:

```
deploy/
  server.js          ← the startup file
  package.json       ← declares `npm start` → `node server.js`
  .next/             ← the built app, including .next/static
  public/            ← images, icons, fonts
  node_modules/      ← only what the standalone bundle traces in
```

Upload it over SSH (host, port and username are in hPanel → **Advanced → SSH Access**; 65002 is Hostinger's usual shared-hosting port):

```bash
tar -czf deploy.tar.gz -C deploy .
```

```bash
scp -P 65002 deploy.tar.gz u123456789@your-server-ip:~/office-pigeon/
```

```bash
ssh -p 65002 u123456789@your-server-ip "cd ~/office-pigeon && tar -xzf deploy.tar.gz && rm deploy.tar.gz && ls -la"
```

Without SSH: zip the **contents** of `deploy/` — not the folder itself — upload through **Files → File Manager** into `office-pigeon/`, and extract there. `server.js` must end up at `office-pigeon/server.js`, not `office-pigeon/deploy/server.js`.

Then set the Node application's startup file to `server.js` and restart. Keep the previous `deploy.tar.gz` until the new one is verified — that archive is your rollback.

| Symptom | Fix |
| --- | --- |
| `Cannot find module 'next'` | You uploaded the repository instead of `deploy/` |
| Will not start, no logs | `server.js` must be at the application root |
| Images 404 | `public/` or `.next/static` missing — re-run `package:hostinger` |
