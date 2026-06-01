/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createServer as createViteServer } from 'vite';
import { answerPipChat } from './lib/pip-ai/server';

const SYSTEM_PROMPT =
  'You are Pip AI, the helpful, on-point, friendly, and fresh AI assistant for Office Pigeon. Keep responses brief, direct, and professional. Mention our Starter Business Website ($500), FAQ bots ($300), and custom onboarding workflows where appropriate.';

const OFFLINE_MESSAGE =
  'Pip AI is having trouble reaching our AI providers right now. Please leave your question here or contact Office Pigeon on WhatsApp, and we will help you shortly.';

type ChatRole = 'system' | 'user' | 'assistant';

interface NormalizedChatMessage {
  role: ChatRole;
  content: string;
}

interface ChatProviderResult {
  provider: string;
  text: string;
}

type PreviewStatus = 'live' | 'expired' | 'sold' | 'draft' | 'archived';

interface PreviewFolder {
  slug: string;
  business_name: string;
  url: string;
  exists_on_disk: boolean;
  has_index: boolean;
}

interface PreviewStatusRow {
  id?: string;
  slug: string;
  business_name?: string | null;
  status: PreviewStatus;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  removed_at?: string | null;
  removed_by_email?: string | null;
}

const SLUG_REGEX = /^[a-z0-9-]+$/;
const VALID_STATUSES: PreviewStatus[] = ['live', 'expired', 'sold', 'draft', 'archived'];
const SERVER_ENTRY_DIR = process.argv[1] ? path.dirname(path.resolve(process.argv[1])) : process.cwd();
const PREVIEW_DIR_CANDIDATES = Array.from(
  new Set([
    path.join(process.cwd(), 'previews'),
    path.join(process.cwd(), 'dist', 'previews'),
    path.join(SERVER_ENTRY_DIR, 'previews'),
    path.join(SERVER_ENTRY_DIR, '..', 'previews')
  ].map((previewPath) => path.resolve(previewPath)))
);
const OFFICE_PIGEON_PHONE = '+1 917 672 6764';
const isBundledServer = /dist[\\/]+server\.cjs$/.test(process.argv[1] || '') || /server\.cjs$/.test(process.argv[1] || '');
const isProductionServer = process.env.NODE_ENV === 'production' || isBundledServer;

let supabase: SupabaseClient | null = null;
let supabaseAuthClient: SupabaseClient | null = null;
const previewLeadAttempts = new Map<string, { count: number; resetAt: number }>();

const getEnv = (...names: string[]) => {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim()) return value.trim();
  }
  return undefined;
};

const getSupabaseUrl = () => getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
const getSupabaseAnonKey = () => getEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
const getSupabaseServiceRoleKey = () => getEnv('SUPABASE_SERVICE_ROLE_KEY');

const getSupabaseClient = () => {
  if (supabase) return supabase;

  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseServiceRoleKey() || getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return supabase;
};

const getSupabaseAuthClient = () => {
  if (supabaseAuthClient) return supabaseAuthClient;

  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseAnonKey() || getSupabaseServiceRoleKey();

  if (!supabaseUrl || !supabaseKey) return null;

  supabaseAuthClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return supabaseAuthClient;
};

const requireSupabase = (res: express.Response) => {
  const client = getSupabaseClient();
  if (!client) {
    res.status(503).json({
      success: false,
      message: 'Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY.'
    });
    return null;
  }
  return client;
};

const nonEmptyString = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);

const compactObject = (payload: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined && value !== ''));

const titleCaseSlug = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const isValidSlug = (slug: string) => SLUG_REGEX.test(slug);

const adminEmails = () =>
  (process.env.ADMIN_EMAILS || 'm.abdullahcheema9@gmail.com')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

const previewPublicUrl = () => getEnv('OFFICE_PIGEON_PUBLIC_URL', 'APP_URL', 'NEXT_PUBLIC_SITE_URL') || 'https://officepigeon.com';
const whatsappNumber = () => getEnv('OFFICE_PIGEON_WHATSAPP_NUMBER', 'NEXT_PUBLIC_WHATSAPP_NUMBER') || '19176726764';

const scanPreviewFolders = async (): Promise<PreviewFolder[]> => {
  const folderMap = new Map<string, PreviewFolder>();

  for (const previewsDir of PREVIEW_DIR_CANDIDATES) {
    const entries = await fs.readdir(previewsDir, { withFileTypes: true }).catch(() => []);
    const folders = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory() && isValidSlug(entry.name))
        .map(async (entry) => {
          const indexPath = path.join(previewsDir, entry.name, 'index.html');
          const hasIndex = await fs
            .access(indexPath)
            .then(() => true)
            .catch(() => false);

          return {
            slug: entry.name,
            business_name: titleCaseSlug(entry.name),
            url: `/previews/${entry.name}`,
            exists_on_disk: true,
            has_index: hasIndex
          };
        })
    );

    for (const folder of folders) {
      const existing = folderMap.get(folder.slug);
      folderMap.set(folder.slug, {
        ...folder,
        has_index: Boolean(existing?.has_index || folder.has_index)
      });
    }
  }

  return Array.from(folderMap.values()).sort((a, b) => a.slug.localeCompare(b.slug));
};

const fetchPreviewStatuses = async (slugs?: string[]) => {
  const client = getSupabaseClient();
  if (!client) return new Map<string, PreviewStatusRow>();

  let query = client.from('preview_statuses').select('*');
  if (slugs?.length) query = query.in('slug', slugs);

  const { data, error } = await query;
  if (error) {
    console.error('[Office Pigeon API] Preview statuses fetch failed:', error);
    return new Map<string, PreviewStatusRow>();
  }

  return new Map((data || []).map((row) => [row.slug, row as PreviewStatusRow]));
};

const mergePreviewRows = async () => {
  const folders = await scanPreviewFolders();
  const statusRows = await fetchPreviewStatuses();
  const folderMap = new Map(folders.map((folder) => [folder.slug, folder]));
  const slugs = Array.from(new Set([...folders.map((folder) => folder.slug), ...statusRows.keys()])).sort();

  return slugs.map((slug) => {
    const folder = folderMap.get(slug);
    const status = statusRows.get(slug);

    return {
      slug,
      business_name: status?.business_name || folder?.business_name || titleCaseSlug(slug),
      status: status?.status || 'live',
      url: `/previews/${slug}`,
      exists_on_disk: Boolean(folder?.exists_on_disk),
      has_index: Boolean(folder?.has_index),
      notes: status?.notes || null,
      created_at: status?.created_at || null,
      updated_at: status?.updated_at || null,
      removed_at: status?.removed_at || null,
      removed_by_email: status?.removed_by_email || null
    };
  });
};

const getPreviewStatus = async (slug: string): Promise<PreviewStatusRow | null> => {
  const client = getSupabaseClient();
  if (!client) return { slug, status: 'live' };

  const { data, error } = await client.from('preview_statuses').select('*').eq('slug', slug).maybeSingle();
  if (error) {
    console.error('[Office Pigeon API] Preview status lookup failed:', error);
    return { slug, status: 'live' };
  }

  return data as PreviewStatusRow | null;
};

const setPreviewHeaders = (res: express.Response, html = false) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  if (html) {
    res.setHeader('Cache-Control', 'no-store');
  } else {
    res.setHeader('Cache-Control', 'private, max-age=300');
  }
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] || char);

const buildExpiredPreviewPage = (slug: string, status: PreviewStatus | 'missing' = 'expired') => {
  const baseUrl = previewPublicUrl();
  const whatsappUrl = `https://wa.me/${whatsappNumber()}`;
  const statusLabel = status === 'live' ? 'Unavailable' : 'Preview unavailable';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow,noarchive" />
  <title>${statusLabel} | Office Pigeon</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #faf9f6; color: #1a1a1a; padding: 24px; }
    main { width: min(640px, 100%); background: #fff; border: 1px solid rgba(0,0,0,.07); border-radius: 24px; box-shadow: 0 24px 70px rgba(20,18,15,.08); padding: clamp(28px, 6vw, 56px); text-align: center; }
    .mark { width: 56px; height: 56px; border-radius: 999px; display: grid; place-items: center; margin: 0 auto 22px; color: #fff; background: linear-gradient(135deg, #f97316, #f43f5e, #f59e0b); font-weight: 900; letter-spacing: -.08em; }
    .eyebrow { margin: 0 0 10px; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: #ea580c; font-weight: 800; }
    h1 { margin: 0; font-size: clamp(32px, 7vw, 54px); line-height: .98; letter-spacing: -.04em; }
    p { color: #68625a; line-height: 1.7; font-size: 15px; margin: 18px auto 0; max-width: 460px; }
    .slug { margin-top: 14px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: #9a9288; font-size: 12px; }
    .actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 30px; }
    a { border-radius: 999px; padding: 13px 18px; text-decoration: none; font-size: 13px; font-weight: 800; }
    .primary { background: #111; color: #fff; }
    .secondary { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
  </style>
</head>
<body>
  <main>
    <div class="mark">OP</div>
    <p class="eyebrow">Office Pigeon Preview</p>
    <h1>This preview is expired.</h1>
    <p>Please contact +1 917 672 6764 for any questions or placing an order.</p>
    <div class="slug">${escapeHtml(slug)}</div>
    <div class="actions">
      <a class="primary" href="${whatsappUrl}">Contact on WhatsApp</a>
      <a class="secondary" href="${baseUrl}">Visit Office Pigeon</a>
    </div>
  </main>
</body>
</html>`;
};

const buildPreviewInjection = (slug: string) => {
  const whatsappUrl = `https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(`Hi Office Pigeon, I like the ${slug} preview and want to claim it.`)}`;

  return `
<meta name="robots" content="noindex,nofollow,noarchive" />
<script>
  window.OFFICE_PIGEON_PREVIEW_SLUG = ${JSON.stringify(slug)};
  window.OFFICE_PIGEON_PREVIEW_API = "/api/preview-leads";
</script>
<style>
  #office-pigeon-preview-banner { position: fixed; left: 50%; bottom: 14px; transform: translateX(-50%); z-index: 2147483647; max-width: min(720px, calc(100vw - 24px)); display: flex; align-items: center; gap: 12px; padding: 10px 12px 10px 16px; border: 1px solid rgba(0,0,0,.08); border-radius: 999px; background: rgba(255,255,255,.94); color: #171717; box-shadow: 0 16px 44px rgba(0,0,0,.14); backdrop-filter: blur(18px); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 12px; line-height: 1.35; }
  #office-pigeon-preview-banner a { color: #fff; background: #111; border-radius: 999px; padding: 8px 11px; text-decoration: none; font-weight: 800; white-space: nowrap; }
  #office-pigeon-preview-banner button { border: 0; background: #f3f1ed; color: #555; width: 24px; height: 24px; border-radius: 999px; cursor: pointer; font-weight: 800; line-height: 1; }
  @media (max-width: 560px) { #office-pigeon-preview-banner { border-radius: 18px; align-items: flex-start; flex-wrap: wrap; bottom: 10px; } #office-pigeon-preview-banner a { flex: 1; text-align: center; } }
</style>
<script>
  window.addEventListener("DOMContentLoaded", function () {
    if (sessionStorage.getItem("office-pigeon-preview-banner-dismissed") === "1") return;
    var banner = document.createElement("div");
    banner.id = "office-pigeon-preview-banner";
    banner.innerHTML = '<span>Free preview by <strong>Office Pigeon</strong> - Like this website? Contact us to claim it.</span><a href="${whatsappUrl}" target="_blank" rel="noreferrer">WhatsApp +1 917 672 6764</a><button type="button" aria-label="Dismiss Office Pigeon preview banner">x</button>';
    banner.querySelector("button").addEventListener("click", function () {
      sessionStorage.setItem("office-pigeon-preview-banner-dismissed", "1");
      banner.remove();
    });
    document.body.appendChild(banner);
  });
</script>`;
};

const injectPreviewHtml = (html: string, slug: string) => {
  const injection = buildPreviewInjection(slug);
  if (html.includes('</head>')) return html.replace('</head>', `${injection}\n</head>`);
  if (html.includes('</body>')) return html.replace('</body>', `${injection}\n</body>`);
  return `${html}\n${injection}`;
};

const previewPathForRequest = async (slug: string, rest = '') => {
  if (!isValidSlug(slug)) return null;
  const safeRest = path.normalize(rest || 'index.html').replace(/^(\.\.[/\\])+/, '');

  for (const previewsDir of PREVIEW_DIR_CANDIDATES) {
    const baseDir = path.join(previewsDir, slug);
    const targetPath = path.join(baseDir, safeRest);
    const relative = path.relative(baseDir, targetPath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) return null;

    const hasIndex = await fs
      .access(path.join(baseDir, 'index.html'))
      .then(() => true)
      .catch(() => false);
    if (hasIndex) return { baseDir, targetPath };
  }

  const baseDir = path.join(PREVIEW_DIR_CANDIDATES[0], slug);
  const targetPath = path.join(baseDir, safeRest);
  const relative = path.relative(baseDir, targetPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return { baseDir, targetPath };
};

const requireAdmin = async (req: express.Request, res: express.Response) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';

  if (!token) {
    res.status(401).json({ success: false, message: 'Missing admin session.' });
    return null;
  }

  const authClient = getSupabaseAuthClient();
  if (!authClient) {
    res.status(503).json({ success: false, message: 'Supabase Auth is not configured.' });
    return null;
  }

  const { data, error } = await authClient.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();

  if (error || !email) {
    res.status(401).json({ success: false, message: 'Invalid admin session.' });
    return null;
  }

  if (!adminEmails().includes(email)) {
    res.status(403).json({ success: false, message: 'This account is not allowed to manage previews.' });
    return null;
  }

  return { email, user: data.user };
};

const isPreviewLeadRateLimited = (ip: string) => {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const current = previewLeadAttempts.get(ip);
  if (!current || current.resetAt < now) {
    previewLeadAttempts.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  return current.count > 20;
};

const normalizeMessages = (messages: unknown): NormalizedChatMessage[] => {
  if (!Array.isArray(messages)) return [];

  return messages
    .map((message) => {
      if (!message || typeof message !== 'object') return null;
      const record = message as Record<string, unknown>;
      const rawRole = nonEmptyString(record.role) || (record.sender === 'ai' ? 'assistant' : undefined);
      const role: ChatRole = rawRole === 'assistant' || rawRole === 'system' ? rawRole : 'user';
      const content = nonEmptyString(record.content) || nonEmptyString(record.text);

      if (!content) return null;
      return { role, content };
    })
    .filter((message): message is NormalizedChatMessage => Boolean(message));
};

const toOpenAiMessages = (messages: NormalizedChatMessage[]) => [
  { role: 'system', content: SYSTEM_PROMPT },
  ...messages.map((message) => ({ role: message.role, content: message.content }))
];

const assertText = (provider: string, text: unknown) => {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error(`${provider} returned an empty response`);
  }
  return text.trim();
};

const postJson = async (url: string, headers: Record<string, string>, body: Record<string, unknown>) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof data === 'object' && data && 'error' in data ? JSON.stringify(data.error) : response.statusText;
    throw new Error(`${response.status} ${detail}`);
  }

  return data as Record<string, any>;
};

const tryGoogleAiStudio = async (messages: NormalizedChatMessage[]): Promise<ChatProviderResult> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY or GOOGLE_AI_API_KEY');

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'X-Office-Pigeon-System': 'PipAI'
      },
      timeout: 20000
    }
  });

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: messages.map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }]
    })),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 450,
      temperature: 0.5
    }
  });

  return { provider: 'google-ai-studio', text: assertText('Google AI Studio', response.text) };
};

const tryOpenRouter = async (messages: NormalizedChatMessage[]): Promise<ChatProviderResult> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY');

  const data = await postJson(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.APP_URL || 'https://officepigeon.com',
      'X-Title': 'Office Pigeon Pip AI'
    },
    {
      model: process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash',
      messages: toOpenAiMessages(messages),
      max_tokens: 450,
      temperature: 0.5
    }
  );

  return { provider: 'openrouter', text: assertText('OpenRouter', data.choices?.[0]?.message?.content) };
};

const tryCerebras = async (messages: NormalizedChatMessage[]): Promise<ChatProviderResult> => {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) throw new Error('Missing CEREBRAS_API_KEY');

  const data = await postJson(
    'https://api.cerebras.ai/v1/chat/completions',
    { Authorization: `Bearer ${apiKey}` },
    {
      model: process.env.CEREBRAS_MODEL || 'llama-4-scout-17b-16e-instruct',
      messages: toOpenAiMessages(messages),
      max_tokens: 450,
      temperature: 0.5
    }
  );

  return { provider: 'cerebras', text: assertText('Cerebras', data.choices?.[0]?.message?.content) };
};

const tryGroq = async (messages: NormalizedChatMessage[]): Promise<ChatProviderResult> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('Missing GROQ_API_KEY');

  const data = await postJson(
    'https://api.groq.com/openai/v1/chat/completions',
    { Authorization: `Bearer ${apiKey}` },
    {
      model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      messages: toOpenAiMessages(messages),
      max_tokens: 450,
      temperature: 0.5
    }
  );

  return { provider: 'groq', text: assertText('Groq', data.choices?.[0]?.message?.content) };
};

const tryCohere = async (messages: NormalizedChatMessage[]): Promise<ChatProviderResult> => {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) throw new Error('Missing COHERE_API_KEY');

  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.content || 'Hello';
  const chatHistory = messages
    .slice(0, -1)
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      role: message.role === 'assistant' ? 'CHATBOT' : 'USER',
      message: message.content
    }));

  const data = await postJson(
    'https://api.cohere.com/v1/chat',
    { Authorization: `Bearer ${apiKey}` },
    {
      model: process.env.COHERE_MODEL || 'command-r-plus',
      preamble: SYSTEM_PROMPT,
      message: lastUserMessage,
      chat_history: chatHistory,
      max_tokens: 450,
      temperature: 0.5
    }
  );

  return { provider: 'cohere', text: assertText('Cohere', data.text) };
};

const generateChatReply = async (messages: NormalizedChatMessage[]) => {
  const providers = [tryGoogleAiStudio, tryOpenRouter, tryCerebras, tryGroq, tryCohere];

  for (const provider of providers) {
    try {
      return await provider(messages);
    } catch (error) {
      console.warn(`[Office Pigeon Chat] ${provider.name} failed; falling back.`, error);
    }
  }

  return { provider: 'offline-fallback', text: OFFLINE_MESSAGE };
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/admin/config', (_req, res) => {
    res.json({
      supabaseUrl: getSupabaseUrl() || '',
      supabaseAnonKey: getSupabaseAnonKey() || '',
      adminEmails: adminEmails()
    });
  });

  app.get('/api/admin/me', async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    res.json({ email: admin.email });
  });

  app.get('/api/admin/previews', async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const previews = await mergePreviewRows();
    res.json({ previews });
  });

  app.patch('/api/admin/previews/:slug/status', async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const slug = req.params.slug;
    const status = nonEmptyString(req.body.status) as PreviewStatus | undefined;

    if (!isValidSlug(slug)) {
      res.status(400).json({ success: false, message: 'Invalid preview slug.' });
      return;
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid preview status.' });
      return;
    }

    const client = requireSupabase(res);
    if (!client) return;

    const payload = {
      slug,
      status,
      business_name: nonEmptyString(req.body.business_name) || null,
      notes: nonEmptyString(req.body.notes) || null,
      removed_at: status === 'expired' ? new Date().toISOString() : status === 'live' ? null : undefined,
      removed_by_email: status === 'expired' ? admin.email : status === 'live' ? null : undefined
    };

    const { data, error } = await client
      .from('preview_statuses')
      .upsert(payload, { onConflict: 'slug' })
      .select('*')
      .single();

    if (error) {
      console.error('[Office Pigeon API] Preview status upsert failed:', error);
      res.status(500).json({ success: false, message: 'Unable to update preview status.' });
      return;
    }

    res.json({ preview: data });
  });

  app.patch('/api/admin/previews/:slug', async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const slug = req.params.slug;
    if (!isValidSlug(slug)) {
      res.status(400).json({ success: false, message: 'Invalid preview slug.' });
      return;
    }

    const client = requireSupabase(res);
    if (!client) return;

    const { data, error } = await client
      .from('preview_statuses')
      .upsert(
        {
          slug,
          business_name: nonEmptyString(req.body.business_name) || null,
          notes: nonEmptyString(req.body.notes) || null
        },
        { onConflict: 'slug' }
      )
      .select('*')
      .single();

    if (error) {
      console.error('[Office Pigeon API] Preview metadata upsert failed:', error);
      res.status(500).json({ success: false, message: 'Unable to update preview metadata.' });
      return;
    }

    res.json({ preview: data });
  });

  app.get('/api/public/previews', async (_req, res) => {
    const previews = await mergePreviewRows();
    res.json({
      previews: previews
        .filter((preview) => preview.exists_on_disk && preview.has_index && preview.status === 'live')
        .map((preview) => ({
          slug: preview.slug,
          business_name: preview.business_name,
          url: preview.url,
          status: preview.status
        }))
    });
  });

  app.post('/api/preview-leads', async (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (isPreviewLeadRateLimited(ip)) {
      res.status(429).json({ success: false, message: 'Too many submissions. Please try again later.' });
      return;
    }

    const client = requireSupabase(res);
    if (!client) return;

    const previewSlug = nonEmptyString(req.body.preview_slug) || nonEmptyString(req.body.slug);
    if (!previewSlug || !isValidSlug(previewSlug)) {
      res.status(400).json({ success: false, message: 'A valid preview_slug is required.' });
      return;
    }

    const email = nonEmptyString(req.body.email);
    const phone = nonEmptyString(req.body.phone);
    const name = nonEmptyString(req.body.name);
    const message = nonEmptyString(req.body.message);

    if (!email && !phone) {
      res.status(400).json({ success: false, message: 'Please include an email or phone number.' });
      return;
    }

    const formData = req.body.form_data && typeof req.body.form_data === 'object' && !Array.isArray(req.body.form_data)
      ? req.body.form_data
      : compactObject({ ...req.body });

    const { error } = await client.from('preview_leads').insert({
      preview_slug: previewSlug,
      business_name: nonEmptyString(req.body.business_name) || null,
      name: name || null,
      email: email || null,
      phone: phone || null,
      message: message || null,
      form_data: formData,
      source: 'preview_website'
    });

    if (error) {
      console.error('[Office Pigeon API] Preview lead insert failed:', error);
      res.status(500).json({ success: false, message: 'Unable to save preview lead.' });
      return;
    }

    res.json({ success: true, message: 'Preview lead saved.' });
  });

  app.use('/previews', (_req, res, next) => {
    setPreviewHeaders(res);
    next();
  });

  app.get('/previews/:slug', (req, res, next) => {
    if (req.path.endsWith('/')) {
      next();
      return;
    }

    res.redirect(302, `/previews/${req.params.slug}/`);
  });

  app.get('/previews/:slug/*?', async (req, res) => {
    const slug = req.params.slug;
    const rest = req.params[0] || 'index.html';

    if (!isValidSlug(slug)) {
      setPreviewHeaders(res, true);
      res.status(404).send(buildExpiredPreviewPage(slug, 'missing'));
      return;
    }

    const paths = await previewPathForRequest(slug, rest.endsWith('/') ? `${rest}index.html` : rest || 'index.html');
    if (!paths) {
      setPreviewHeaders(res, true);
      res.status(404).send(buildExpiredPreviewPage(slug, 'missing'));
      return;
    }

    const indexPath = path.join(paths.baseDir, 'index.html');
    const hasIndex = await fs.access(indexPath).then(() => true).catch(() => false);
    if (!hasIndex) {
      setPreviewHeaders(res, true);
      res.status(404).send(buildExpiredPreviewPage(slug, 'missing'));
      return;
    }

    const statusRow = await getPreviewStatus(slug);
    const status = statusRow?.status || 'live';
    if (status !== 'live') {
      setPreviewHeaders(res, true);
      res.status(200).send(buildExpiredPreviewPage(slug, status));
      return;
    }

    const targetExists = await fs.access(paths.targetPath).then(() => true).catch(() => false);
    const isHtmlRequest = paths.targetPath.endsWith('.html') || !path.extname(paths.targetPath);

    if (targetExists && !paths.targetPath.endsWith('.html')) {
      res.sendFile(paths.targetPath);
      return;
    }

    if (targetExists && paths.targetPath.endsWith('.html')) {
      const html = await fs.readFile(paths.targetPath, 'utf8');
      setPreviewHeaders(res, true);
      res.type('html').send(injectPreviewHtml(html, slug));
      return;
    }

    if (isHtmlRequest) {
      const html = await fs.readFile(indexPath, 'utf8');
      setPreviewHeaders(res, true);
      res.type('html').send(injectPreviewHtml(html, slug));
      return;
    }

    res.status(404).json({ success: false, message: 'Preview asset not found.' });
  });

  app.post('/api/contact-submission', async (req, res) => {
    const client = requireSupabase(res);
    if (!client) return;

    const fullName = nonEmptyString(req.body.full_name) || nonEmptyString(req.body.name);
    const businessEmail = nonEmptyString(req.body.business_email) || nonEmptyString(req.body.email);

    if (!fullName || !businessEmail) {
      res.status(400).json({ success: false, message: 'full_name/name and business_email/email are required.' });
      return;
    }

    const messageParts = [
      nonEmptyString(req.body.message),
      nonEmptyString(req.body.main_problem),
      JSON.stringify(compactObject({
        business_name: req.body.business_name,
        service_interest: req.body.service_interest,
        existing_website: req.body.existing_website,
        industry: req.body.industry,
        timeline: req.body.timeline,
        preferred_contact: req.body.preferred_contact,
        budget_range: req.body.budget_range
      }))
    ].filter(Boolean);

    const { error } = await client
      .from('contact_submissions')
      .insert({
        full_name: fullName,
        business_email: businessEmail,
        phone: nonEmptyString(req.body.phone) || null,
        message: messageParts.join('\n\n')
      });

    if (error) {
      console.error('[Office Pigeon API] Contact submission insert failed:', error);
      res.status(500).json({ success: false, message: 'Unable to save contact submission.' });
      return;
    }

    res.json({ success: true, message: 'Contact submission saved.' });
  });

  app.post('/api/package-inquiry', async (req, res) => {
    const client = requireSupabase(res);
    if (!client) return;

    const packageName = nonEmptyString(req.body.package_name) || nonEmptyString(req.body.packageName);
    const contactEmail = nonEmptyString(req.body.contact_email) || nonEmptyString(req.body.email);

    if (!packageName || !contactEmail) {
      res.status(400).json({ success: false, message: 'package_name/packageName and contact_email/email are required.' });
      return;
    }

    const { error } = await client
      .from('package_inquiries')
      .insert({
        package_id: nonEmptyString(req.body.package_id) || nonEmptyString(req.body.packageId) || null,
        package_name: packageName,
        price: nonEmptyString(req.body.price) || null,
        custom_details: compactObject({
          package_type: req.body.packageType,
          name: req.body.name,
          business_name: req.body.businessName,
          phone: req.body.phone,
          answers: req.body.answers,
          whatsapp_message: req.body.whatsappMessage
        }),
        contact_email: contactEmail
      });

    if (error) {
      console.error('[Office Pigeon API] Package inquiry insert failed:', error);
      res.status(500).json({ success: false, message: 'Unable to save package inquiry.' });
      return;
    }

    res.json({ success: true, message: 'Package inquiry saved.' });
  });

  app.post('/api/pip-lead', async (req, res) => {
    const client = requireSupabase(res);
    if (!client) return;

    const name = nonEmptyString(req.body.name);
    const businessName = nonEmptyString(req.body.business_name) || nonEmptyString(req.body.businessName);
    const email = nonEmptyString(req.body.email);
    const phone = nonEmptyString(req.body.phone);
    const helpNode = nonEmptyString(req.body.help_node) || nonEmptyString(req.body.helpNode) || nonEmptyString(req.body.needHelpWith);

    if (!name || !businessName || !email || !phone || !helpNode) {
      res.status(400).json({ success: false, message: 'name, business_name/businessName, email, phone, and help_node/helpNode are required.' });
      return;
    }

    const { error } = await client
      .from('pip_leads')
      .insert({
        name,
        business_name: businessName,
        email,
        phone,
        help_node: helpNode,
        consent: Boolean(req.body.consent)
      });

    if (error) {
      console.error('[Office Pigeon API] Pip AI lead insert failed:', error);
      res.status(500).json({ success: false, message: 'Unable to save Pip AI lead.' });
      return;
    }

    res.json({ success: true, message: 'Pip AI lead saved.' });
  });

  app.post('/api/pip/lead', async (req, res) => {
    const client = requireSupabase(res);
    if (!client) return;

    const name = nonEmptyString(req.body.name);
    const businessName = nonEmptyString(req.body.businessName);
    const email = nonEmptyString(req.body.email);
    const phone = nonEmptyString(req.body.phone);
    const needHelpWith = nonEmptyString(req.body.needHelpWith);

    if (!name || !businessName || !email || !phone || !needHelpWith || req.body.consent !== true) {
      res.status(400).json({ message: 'Please complete all lead fields and consent before chatting.' });
      return;
    }

    const { data, error } = await client
      .from('pip_ai_leads')
      .insert({
        name,
        business_name: businessName,
        email,
        phone,
        need_help_with: needHelpWith,
        consent: true,
        source_page: nonEmptyString(req.body.sourcePage),
        user_agent: req.headers['user-agent'] || null,
        referrer: req.headers.referer || null
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Office Pigeon API] Pip AI lead insert failed:', error);
      res.status(500).json({ message: 'Unable to save lead right now.' });
      return;
    }

    res.json({ leadId: data.id, message: 'Lead saved' });
  });

  app.post('/api/chat', async (req, res) => {
    const messages = normalizeMessages(req.body.messages).slice(-8);

    if (messages.length === 0) {
      res.status(400).json({ success: false, message: 'messages must include at least one non-empty message.' });
      return;
    }

    const result = await generateChatReply(messages);
    res.json({
      success: true,
      provider: result.provider,
      text: result.text,
      memoryLimit: 8
    });
  });

  app.post('/api/pip/chat', async (req, res) => {
    const rawMessages = Array.isArray(req.body.history) ? req.body.history : [];
    const messages = normalizeMessages([...rawMessages, { role: 'user', content: req.body.message }]).slice(-12);

    if (!nonEmptyString(req.body.message)) {
      res.status(400).json({ message: 'Message is required.' });
      return;
    }

    try {
      const result = await answerPipChat({
        leadId: nonEmptyString(req.body.leadId),
        conversationId: nonEmptyString(req.body.conversationId),
        message: nonEmptyString(req.body.message) || '',
        history: messages.slice(0, -1),
        sourcePage: nonEmptyString(req.body.sourcePage)
      });

      res.json(result);
    } catch (error) {
      console.error('[Office Pigeon API] Pip AI RAG chat failed:', error);
      res.status(500).json({
        answer: 'Something went wrong on my side. You can still continue on WhatsApp or book a free consultation.',
        provider: 'server_error',
        actions: [
          { type: 'whatsapp', label: 'Continue on WhatsApp' },
          { type: 'book_call', label: 'Book Free Consultation' }
        ]
      });
    }
  });

  app.post('/api/pip/whatsapp', (req, res) => {
    const type = nonEmptyString(req.body.type) || 'general';
    const message =
      type === 'workflow_audit'
        ? 'Hi Office Pigeon, I want to book a free workflow automation audit for my business.'
        : 'Hi Office Pigeon, I want to book a free consultation.';
    res.json({ message, url: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '19176726764'}?text=${encodeURIComponent(message)}` });
  });

  if (!isProductionServer) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Office Pigeon Server] Activated on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Office Pigeon Server] Server initialization fatal error:', err);
});
