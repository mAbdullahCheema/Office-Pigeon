# Deploying Office Pigeon to Hostinger Business hosting

This is the complete path from a clean Hostinger account to `https://officepigeon.com` serving the app as a Node.js process, with the keep-alive cron running and monitoring live.

Read it once before starting. Steps 1–4 can be done in any order; steps 5 onward are sequential.

---

## What you are deploying

Next.js 16 builds this app in **standalone** mode: a self-contained server bundle that runs under plain Node and does not need `node_modules` at runtime. Hostinger's Node.js application manager runs exactly that kind of process, so there is no adapter, no container and no serverless shim involved.

The upload folder is produced by `npm run package:hostinger` and looks like this:

```
deploy/
  server.js          ← the startup file Hostinger runs
  package.json       ← declares `npm start` → `node server.js`
  .next/             ← the built app, including .next/static
  public/            ← images, icons, fonts
  node_modules/      ← only the handful the standalone bundle traces in
```

---

## Prerequisites

| Thing | Why |
| --- | --- |
| Hostinger **Business** plan (or higher) | Node.js applications require Business or above |
| The domain `officepigeon.com` pointed at Hostinger | Set in **Domains → DNS / Nameservers** |
| A Supabase project | Already provisioned |
| Node 20+ locally | To run the build |

> **Node version on the server.** In hPanel choose the newest Node version offered — 20 or 22. Next.js 16 requires Node 20.9 or later. If hPanel only offers 18, stop and open a support ticket to have Node 20+ enabled before continuing; the app will not start on 18.

---

## Step 1 — Decide the canonical URL

Everything downstream depends on this being decided once and used consistently.

**Canonical: `https://officepigeon.com`** (apex, no `www`).

`NEXT_PUBLIC_SITE_URL` must equal it **exactly** — no trailing slash, `https` not `http`. It is what builds every canonical tag, every Open Graph URL, every entry in the sitemap, and every OAuth redirect. A mismatch here is the single most common cause of "Google indexed the wrong URL" and "sign-in redirects to localhost".

You will add a `www → apex` redirect in step 8.

---

## Step 2 — Collect the environment variables

Take your local `.env.local` as the starting point and change these:

| Variable | Local value | Production value |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://officepigeon.com` |
| `NODE_ENV` | *(unset)* | `production` |
| `SENTRY_ENVIRONMENT` | `development` | `production` |
| `PORT` | *(unset)* | *(set by Hostinger — do not hard-code)* |

Everything else — Supabase, OpenRouter, Google AI, Cerebras, Groq, Pinecone, Cal.com, Redis, `CRON_SECRET` — carries over unchanged.

Add these two if you have not already (see steps 3 and 4):

- `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, and optionally `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN`

> **Security.** Never commit `.env.local`. `.gitignore` already excludes `.env*` except `.env.example`. The service key bypasses row level security — it belongs in the host's environment panel and nowhere else.

---

## Step 3 — Set up PostHog *(optional, skip if not using it)*

1. Create a project at [posthog.com](https://posthog.com).
2. **Project settings → Project API key** → copy the `phc_…` value into `NEXT_PUBLIC_POSTHOG_KEY`.
3. Note the region shown on the same page and set `NEXT_PUBLIC_POSTHOG_HOST` to `https://us.i.posthog.com` or `https://eu.i.posthog.com` accordingly.

Nothing loads until a visitor accepts the analytics category in the cookie banner. With the key unset, PostHog is never initialised at all — and `next.config.ts` will not even add its origin to the Content Security Policy.

---

## Step 4 — Set up Sentry *(optional, skip if not using it)*

1. Create a project at [sentry.io](https://sentry.io) — platform **Next.js**.
2. Copy the DSN into both `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN`. The DSN is public by design; it only says where to send events.
3. For readable stack traces, create an auth token at **Settings → Auth Tokens** with the `project:releases` scope and set `SENTRY_ORG`, `SENTRY_PROJECT` and `SENTRY_AUTH_TOKEN` **on the machine that runs the build** (your laptop, or CI). They are not needed on the server.

Without the token the build still succeeds — traces are just minified. Without a DSN, Sentry's build plugin is not applied at all.

---

## Step 5 — Point Supabase at the production URL

In the Supabase dashboard:

1. **Authentication → URL Configuration → Site URL** → `https://officepigeon.com`
2. **Redirect URLs** — add both:
   - `https://officepigeon.com/api/auth/callback`
   - `https://www.officepigeon.com/api/auth/callback`
3. If Google sign-in is enabled, add the Supabase callback to your Google Cloud OAuth client's **Authorised redirect URIs**:
   - `https://<project-ref>.supabase.co/auth/v1/callback`

Supabase will only redirect to URLs on this allow-list. A missing entry produces a silent failed sign-in.

While you are in there, turn on **Authentication → Policies → Leaked password protection**. It checks new passwords against HaveIBeenPwned and refuses ones that appear in a known breach. It is off by default and it is the only security warning Supabase's own advisor raises against this project.

Re-run the advisor any time you change the schema:

```bash
npx supabase inspect db --linked
```

---

## Step 6 — Build the upload folder

On your machine, from the repository root:

```bash
npm ci
```

```bash
npm run build && npm run package:hostinger
```

The build reads `.env.local`, so make sure `NEXT_PUBLIC_SITE_URL` is set to the **production** URL for this build. `NEXT_PUBLIC_*` values are compiled into the client bundle — changing them on the server afterwards has no effect on what the browser already downloaded.

The practical way to handle that: keep `.env.local` for local development, and build production from a copy.

```bash
cp .env.local .env.local.dev && cp .env.production.local .env.local && npm run build && npm run package:hostinger && cp .env.local.dev .env.local
```

Or simply edit the one line before building and change it back after. Either way, **verify** before uploading:

```bash
grep -rl "localhost:3000" deploy/.next/static || echo "clean — no localhost in the client bundle"
```

---

## Step 7 — Create the Node.js application in hPanel

1. hPanel → your hosting → **Advanced → Node.js** (on some plans: **Website → Node.js app**).
2. **Create application**:
   - **Node version:** the newest offered (20 or 22)
   - **Application mode:** `Production`
   - **Application root:** `office-pigeon` (a folder inside your home directory, *not* `public_html`)
   - **Application URL:** `officepigeon.com`
   - **Application startup file:** `server.js`
3. Create it. Hostinger will show you a virtual-environment activation command — keep it, you will use it if you ever need to run npm on the server.

### Upload the build

**With SSH (faster and repeatable):**

```bash
tar -czf deploy.tar.gz -C deploy .
```

```bash
scp -P 65002 deploy.tar.gz u123456789@your-server-ip:~/office-pigeon/
```

```bash
ssh -p 65002 u123456789@your-server-ip "cd ~/office-pigeon && tar -xzf deploy.tar.gz && rm deploy.tar.gz && ls -la"
```

(Your SSH host, port and username are in hPanel → **Advanced → SSH Access**. Port 65002 is Hostinger's usual shared-hosting SSH port.)

**Without SSH:** zip the *contents* of `deploy/` (not the folder itself), upload through **Files → File Manager** into `office-pigeon/`, and extract there. Confirm afterwards that `server.js` sits at `office-pigeon/server.js` and not `office-pigeon/deploy/server.js`.

---

## Step 8 — Environment variables, domain and SSL

### Environment variables

In the Node.js application panel there is an **Environment variables** section. Add every variable from step 2, one per row. Do **not** set `PORT` — Hostinger injects it, and `server.js` reads it.

Minimum set for the app to boot:

```
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://officepigeon.com
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
CRON_SECRET=...
```

Then the rest: `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED`, `REDIS_URL`, `PIP_ENABLED`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_FREE_MODEL`, `GOOGLE_AI_API_KEY`, `GOOGLE_MODEL`, `CEREBRAS_API_KEY`, `CEREBRAS_MODEL`, `GROQ_API_KEY`, `GROQ_MODEL`, `PINECONE_API_KEY`, `PINECONE_INDEX_HOST`, `PINECONE_NAMESPACE`, `CALCOM_API_KEY`, `CALCOM_EVENT_TYPE_ID`, `CALCOM_USERNAME`, `CALCOM_EVENT_SLUG`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_ENVIRONMENT`.

### Domain

hPanel → **Domains** → point `officepigeon.com` at this hosting account. In the Node.js app panel, make sure the **Application URL** is `officepigeon.com`.

### SSL

hPanel → **Security → SSL** → install the free Let's Encrypt certificate for `officepigeon.com` **and** `www.officepigeon.com`. Wait for it to show *Active* before the next step — enabling forced HTTPS against a pending certificate locks you out of your own site.

Then enable **Force HTTPS**.

> The app sends `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` in production. That is a two-year commitment: once a browser has seen it, it will refuse plain HTTP to this domain *and every subdomain* for two years. Make sure SSL is working on `officepigeon.com`, `www`, and any subdomain you plan to use (`finance.`, `school.`, …) before you go live.

### www → apex redirect

hPanel → **Domains → Redirects**: redirect `www.officepigeon.com` to `https://officepigeon.com` with a **301**. This is what stops search engines treating the two as separate sites.

---

## Step 9 — Start it

In the Node.js application panel: **Run npm install** is *not* needed — the standalone bundle ships its own dependencies. Just press **Restart** / **Start**.

Then check, in order:

```bash
curl -s https://officepigeon.com/api/health
```

Expect `{"ok":true,"database":{"ok":true,...},"cache":{"status":"ok",...}}`.

- `database.ok: false` → the Supabase variables are wrong, or the project is paused.
- `cache.status: "off"` → `REDIS_URL` is unset. The site works; rate limits are per-process.
- `cache.status: "degraded"` → Redis is configured but unreachable. Check that the URL starts with `rediss://` (two s's) so TLS is negotiated.

```bash
curl -sI https://officepigeon.com | grep -i "content-security-policy\|strict-transport"
```

```bash
curl -s https://officepigeon.com/llms.txt | head -20
```

---

## Step 10 — Wire up the keep-alive cron

A free-tier Supabase project **pauses after seven days without activity**, which takes the site down until someone restores it by hand. The repository ships a GitHub Actions workflow that prevents that.

### Add the repository secrets

In GitHub → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
| --- | --- |
| `CRON_SECRET` | The same value you put in Hostinger's environment |
| `NEXT_PUBLIC_SITE_URL` | `https://officepigeon.com` |

### Run it once by hand

GitHub → **Actions → Supabase keep-alive → Run workflow**. It should finish green with `HTTP 200`.

If it returns **401**, `CRON_SECRET` differs between GitHub and Hostinger. If it returns **503**, the site is up but cannot reach Postgres.

### The schedule

`17 4 */5 * *` — the 1st, 6th, 11th, 16th, 21st, 26th and 31st of each month at 04:17 UTC. The longest gap in any month is five days, comfortably inside Supabase's seven.

### The one caveat

**GitHub disables scheduled workflows in a repository with no activity for 60 days.** It emails the owner first. Two ways to be safe:

1. Push something to the repository every couple of months (a README tweak counts), or
2. Add a second trigger from Hostinger's own cron. hPanel → **Advanced → Cron Jobs**, run every 3 days:

```bash
curl -s -X POST https://officepigeon.com/api/cron/keepalive -H "Authorization: Bearer YOUR_CRON_SECRET" -o /dev/null
```

Two triggers cost nothing and remove the single point of failure. Recommended.

---

## Step 11 — Post-launch checks

Work through these once. They catch the things that are invisible until a customer hits them.

**Function**

- [ ] Home page loads over HTTPS with no console errors
- [ ] `www.officepigeon.com` 301-redirects to the apex
- [ ] Contact form submits and the message appears in **Dashboard → Messages**
- [ ] Order flow completes and the order appears in **Dashboard → Orders**
- [ ] Sign-in works, including Google if enabled
- [ ] `/dashboard` redirects a signed-out visitor to `/login`
- [ ] Pip answers, quotes a price, offers a slot, and the confirm card actually books

**Machine surface**

- [ ] `https://officepigeon.com/sitemap.xml` lists production URLs, not localhost
- [ ] `https://officepigeon.com/robots.txt` points at the production sitemap
- [ ] `https://officepigeon.com/llms.txt` returns the catalogue with current prices
- [ ] Structured data passes [Google's Rich Results Test](https://search.google.com/test/rich-results) on `/`, `/pricing`, `/faq` and a service page
- [ ] Social card renders in [opengraph.xyz](https://www.opengraph.xyz)

**Search**

- [ ] Submit the sitemap in [Google Search Console](https://search.google.com/search-console) and verify the domain
- [ ] Submit it in [Bing Webmaster Tools](https://www.bing.com/webmasters) — this is also what feeds ChatGPT's web search

**Database**

- [ ] Supabase security advisor is clean (leaked-password protection on)
- [ ] Performance advisor's "multiple permissive policies" warnings are **expected**: each table carries an own-row policy *and* a staff policy, and both are evaluated for a signed-in reader. Merging each pair into a single `OR` policy is a real optimisation, but it rewrites the authorisation model across 25 tables. Revisit it only when a dashboard query actually shows up slow in Sentry's traces — not before.

**Monitoring**

- [ ] Sentry has received at least one event (visit a URL that throws, or use Sentry's test button)
- [ ] PostHog shows a session after you accept cookies
- [ ] Keep-alive workflow has run green at least once
- [ ] An uptime monitor pings `/api/health` every 5 minutes — [UptimeRobot](https://uptimerobot.com) is free and enough

**Rebuild the knowledge base** if any price or content changed during setup:

```bash
npm run kb:index
```

---

## Updating a live deployment

```bash
npm run build && npm run package:hostinger
```

Upload the new `deploy/` contents over the old ones, then **Restart** in the Node.js panel. Keep the previous `deploy.tar.gz` until the new one is verified — that archive is your rollback.

Environment variable changes need a restart to take effect. `NEXT_PUBLIC_*` changes need a **rebuild**, because they are compiled into the browser bundle.

---

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| App will not start, no logs | Wrong startup file | It must be `server.js` at the application root, not `deploy/server.js` |
| `Cannot find module 'next'` | Uploaded the repo instead of `deploy/` | Upload the contents of `deploy/` only |
| 502 / 503 from Hostinger | Process crashed on boot | Check the Node panel's log. Almost always a missing required env var |
| Pages render but images 404 | `public/` or `.next/static` missing | `package:hostinger` copies both; re-run it and re-upload |
| Sign-in loops back to `/login` | Redirect URL not allow-listed in Supabase | Step 5 |
| Sign-in redirects to localhost | `NEXT_PUBLIC_SITE_URL` was wrong **at build time** | Fix it and rebuild — a server-side change is not enough |
| Pip says it cannot answer | No provider key reached the server, or `PIP_ENABLED=false` | Check the env panel; `/api/health` will still be green, since Pip is not a health dependency |
| `cache.status: "degraded"` | Redis unreachable or using `redis://` | Use `rediss://` for TLS |
| Site down after ~7 days idle | Supabase project paused | Restore it in the Supabase dashboard, then fix the keep-alive (step 10) |
| CSP errors in console after adding a script | The policy allows no third-party `script-src` | Add the origin in `next.config.ts` deliberately, and rebuild |
| Scheduled workflow stopped running | 60-day repository inactivity | Re-enable it in the Actions tab, and add the Hostinger cron as a backup |

---

## Scaling beyond one instance

The app is already written for it: rate-limit counters and the content cache live in Redis, so several instances share one budget and one cache rather than each keeping its own. To run more than one:

1. Set `REDIS_URL` on every instance, pointing at the same Redis.
2. Put them behind a load balancer that honours `/api/health` — it returns 503 when Postgres is unreachable, which is the signal to drain that instance.
3. Sessions are Supabase JWTs in cookies, so no sticky sessions are needed.

On a single Hostinger Node process, the practical ceiling is bounded by that process. Well before you reach it, the useful next step is a CDN in front of the origin: the marketing pages are cacheable, and `/dashboard` and `/api` already send `no-store`, so a cache can be turned on without leaking a session.
