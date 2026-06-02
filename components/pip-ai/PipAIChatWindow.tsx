'use client';

import { FormEvent, useMemo, useRef, useState, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { motion } from 'motion/react';
import PipAIBookingCard from './PipAIBookingCard';
import PipAIHandoffCard from './PipAIHandoffCard';
import PipAILeadForm, { PipLead } from './PipAILeadForm';
import PipAIMessageBubble, { PipMessage } from './PipAIMessageBubble';
import PipAIQuickActions, { PipAction } from './PipAIQuickActions';
import PipAITypingIndicator from './PipAITypingIndicator';

function makeId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

function actionPrompt(action: PipAction) {
  const prompts: Record<string, string> = {
    recommend_service: 'Please recommend the best Office Pigeon service for me.',
    view_website_packages: 'What website packages does Office Pigeon offer?',
    view_chatbot_packages: 'What chatbot packages does Office Pigeon offer?',
    ask_automations: 'What workflow automations can Office Pigeon build?',
    book_call: 'I want to book a free consultation.',
    whatsapp: 'I want to continue on WhatsApp.',
    view_packages: 'Show me the packages.',
    human_handoff: 'I want to talk to a human.'
  };
  return prompts[action.type] || action.label;
}

function isGreetingOnly(text: string) {
  return /^(hi|hello|hey|hiya|yo|good morning|good afternoon|good evening|salam|assalamualaikum|thanks|thank you)[\s!.?]*$/i.test(
    text.trim()
  );
}

export default function PipAIChatWindow({ onClose, onPageChange }: { onClose: () => void; onPageChange?: (page: string) => void }) {
  const [lead, setLead] = useState<PipLead | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<PipMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [handoffUrl, setHandoffUrl] = useState<string | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, thinking, handoffUrl]);

  const history = useMemo(
    () => messages.map((message) => ({ role: message.role, content: message.content })),
    [messages]
  );

  function onLeadSaved(savedLead: PipLead) {
    setLead(savedLead);
    setHandoffUrl(undefined);
    setMessages([
      {
        id: makeId(),
        role: 'assistant',
        content: "Thanks. I'm Pip AI - Office Pigeon's AI assistant. What would you like help with today?"
      }
    ]);
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;

    const userMessage: PipMessage = { id: makeId(), role: 'user', content: trimmed };
    setInput('');
    setHandoffUrl(undefined);

    if (isGreetingOnly(trimmed)) {
      setMessages((current) => [
        ...current,
        userMessage,
        {
          id: makeId(),
          role: 'assistant',
          content:
            "Hi, I'm Pip AI. I can help with Office Pigeon websites, smart chatbots, AI Calling Agents, workflow automations, pricing, packages, booking, or WhatsApp handoff. What would you like to know?",
          actions: [
            { type: 'recommend_service', label: 'Recommend a Service' },
            { type: 'book_call', label: 'Book Free Consultation' },
            { type: 'whatsapp', label: 'Continue on WhatsApp' }
          ]
        }
      ]);
      return;
    }

    setMessages((current) => [...current, userMessage]);
    setThinking(true);

    try {
      const response = await fetch('/api/pip/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead?.id || localStorage.getItem('pip_ai_lead_id') || undefined,
          conversationId,
          message: trimmed,
          history,
          sourcePage: window.location.pathname
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Chat failed.');
      if (data.conversationId) setConversationId(data.conversationId);
      setHandoffUrl(data.handoff?.whatsappUrl);
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: 'assistant',
          content: data.answer || "I'm not fully sure, so I can connect you with the Office Pigeon team.",
          actions: data.actions
        }
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: 'assistant',
          content: 'Something went wrong on my side. You can still continue on WhatsApp or book a free consultation.',
          actions: [
            { type: 'whatsapp', label: 'Continue on WhatsApp' },
            { type: 'book_call', label: 'Book Free Consultation' }
          ]
        }
      ]);
    } finally {
      setThinking(false);
    }
  }

  async function onAction(action: PipAction) {
    if (action.type === 'book_call') {
      setMessages((current) => [...current, { id: makeId(), role: 'assistant', content: 'Here is the best next step:' }]);
      return;
    }
    if (action.type === 'whatsapp') {
      const response = await fetch('/api/pip/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'general' })
      }).catch(() => null);
      const data = response ? await response.json().catch(() => ({})) : {};
      window.open(data.url || 'https://wa.me/19176726764?text=Hi%20Office%20Pigeon%2C%20I%20want%20help%20from%20your%20team.', '_blank', 'noreferrer,noopener');
      return;
    }
    if (action.type === 'view_website_packages') {
      onClose();
      onPageChange?.('websites');
      setTimeout(() => {
        const el = document.getElementById('website-pricing');
        if (el) window.scrollTo({ top: el.offsetTop });
      }, 100);
      return;
    }
    if (action.type === 'view_chatbot_packages') {
      onClose();
      onPageChange?.('chatbots');
      setTimeout(() => {
        const el = document.getElementById('chatbot-pricing');
        if (el) window.scrollTo({ top: el.offsetTop });
      }, 100);
      return;
    }
    await sendMessage(actionPrompt(action));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 28, scale: 0.96 }}
      className="fixed bottom-4 right-4 z-50 flex h-[min(680px,calc(100vh-2rem))] w-[calc(100vw-2rem)] max-w-[410px] flex-col overflow-hidden rounded-[28px] border border-cyan-100 bg-white/95 shadow-2xl shadow-cyan-950/15 backdrop-blur-xl max-[640px]:right-3 max-[640px]:bottom-24 max-[640px]:h-[min(620px,calc(100vh-7rem))] max-[640px]:w-[calc(100vw-1.5rem)] sm:bottom-6 sm:right-6"
      role="dialog"
      aria-label="Pip AI Assistant"
    >
      <div className="flex items-center justify-between bg-cyan-600 px-5 py-4 text-white">
        <div>
          <p className="text-sm font-black">Pip AI Assistant</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-100">Office Pigeon</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-white/15" aria-label="Close Pip AI">
          <X size={17} />
        </button>
      </div>

      {!lead ? (
        <PipAILeadForm onSaved={onLeadSaved} />
      ) : (
        <>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[#FAF9F6] p-4">
            {messages.map((message) => (
              <div key={message.id}>
                <PipAIMessageBubble message={message} onAction={(action) => void onAction(action)} />
              </div>
            ))}
            {messages[messages.length - 1]?.content === 'Here is the best next step:' ? <PipAIBookingCard /> : null}
            {handoffUrl ? <PipAIHandoffCard whatsappUrl={handoffUrl} /> : null}
            {thinking ? <PipAITypingIndicator /> : null}
          </div>
          <div className="border-t border-gray-100 bg-white p-3">
            <PipAIQuickActions onAction={onAction} />
            <form onSubmit={submit} className="mt-3 flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask Pip anything..."
                className="min-w-0 flex-1 rounded-2xl border border-gray-100 bg-gray-50 px-3.5 py-2.5 text-xs outline-none focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-100"
              />
              <button
                type="submit"
                disabled={thinking || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-white transition hover:bg-cyan-700 disabled:opacity-50"
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </>
      )}
    </motion.div>
  );
}
