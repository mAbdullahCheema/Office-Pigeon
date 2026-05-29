# Pip AI Setup

## 1. Create Supabase Tables

Run the SQL in `supabase/pip-ai-schema.sql` in your Supabase SQL editor or through your migration workflow.

The tables are service-role only:
- `pip_ai_leads`
- `pip_ai_conversations`
- `pip_ai_handoff_tickets`
- `pip_ai_events`
- `pip_ai_knowledge_index_log`

RLS is enabled and anon/authenticated access is revoked. Server routes must use `SUPABASE_SERVICE_ROLE_KEY`.

## 2. Set Environment Variables

Copy `.env.example` to `.env` and fill in:
- Supabase URL and service role key
- LLM provider keys and model names
- Pinecone key/index details
- public Cal.com and WhatsApp values
- optional email provider values
- `ADMIN_REINDEX_SECRET`

Never expose service role, LLM, Pinecone, or email keys with `NEXT_PUBLIC_`.

## 3. Create Pinecone Index

Create a Pinecone index that supports integrated embedding if `PINECONE_USE_INTEGRATED_EMBEDDING=true`.

Set:
- `PINECONE_API_KEY`
- `PINECONE_INDEX_NAME`
- `PINECONE_NAMESPACE`
- `PINECONE_INDEX_HOST` if your project requires direct host addressing

## 4. Run Knowledge Indexing

Update Markdown files in `knowledge/`, then run:

```bash
npm run pip:index-knowledge
```

In a Next.js deployment, you can also call:

```bash
curl -X POST "$NEXT_PUBLIC_SITE_URL/api/admin/reindex-knowledge" \
  -H "Authorization: Bearer $ADMIN_REINDEX_SECRET"
```

## 5. Test Pip AI

Use the checklist in `docs/pip-ai-testing.md`.

## 6. Change Office Pigeon Knowledge

Edit files in `knowledge/`, then re-run the knowledge indexing command.

## 7. Change Provider Order

Edit `lib/llm/providerRouter.ts`. Current order is Gemini, OpenRouter, Cerebras, Groq, Cohere.

## 8. Human Fallback

Fallback triggers create a row in `pip_ai_handoff_tickets`, generate a WhatsApp handoff URL, and attempt email notification if configured.

## 9. WhatsApp Handoff

WhatsApp URLs are generated in `lib/pip-ai/whatsapp.ts` using `NEXT_PUBLIC_WHATSAPP_NUMBER`.

## 10. Cal.com Booking

Booking uses `NEXT_PUBLIC_CALCOM_URL` and opens in a new tab from the widget.

## 11. Deploying on Hostinger / Next.js Server

For a real Next.js deployment, move the app fully to Next App Router or place these files in your existing Next app. Set env vars in the hosting dashboard, run the Supabase SQL, run knowledge indexing once, then deploy. Make sure Node.js supports your installed Next.js version.

This repository currently uses Vite + Express, so the included Express compatibility routes keep the visible widget working while the `/app/api` route handlers are ready for Next App Router.
