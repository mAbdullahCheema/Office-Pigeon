/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createServer as createViteServer } from 'vite';
import { answerPipChat } from './lib/pip-ai/server';

const SYSTEM_PROMPT =
  'You are Pip AI, the helpful, on-point, friendly, and fresh AI assistant for Office Pigeon. Keep responses brief, direct, and professional. Mention our landing pages ($250), FAQ bots ($300), and custom onboarding workflows where appropriate.';

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

let supabase: SupabaseClient | null = null;

const getSupabaseClient = () => {
  if (supabase) return supabase;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

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
    model: 'gemini-3.5-flash',
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

  if (process.env.NODE_ENV !== 'production') {
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
