/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Bot,
  Check,
  CheckCheck,
  Clock,
  Compass,
  Globe2,
  MessageSquare,
  RefreshCw,
  Send
} from 'lucide-react';
import { CHATBOT_PACKAGES } from '../config';
import { Package } from '../types';

interface ChatbotsProps {
  onOpenPackageModal: (pkg: Package) => void;
}

type ChatPlacement = 'web' | 'whatsapp';
type DemoRole = 'bot' | 'user';

interface DemoMessage {
  role: DemoRole;
  text: string;
}

const starterMessages: Record<ChatPlacement, DemoMessage[]> = {
  web: [
    {
      role: 'bot',
      text:
        'Hi, I am Pip AI. I can help visitors choose a website, chatbot, AI Calling Agent, or automation setup. What would you like to test?'
    }
  ],
  whatsapp: [
    {
      role: 'bot',
      text:
        'Hi, this is Pip AI for Office Pigeon. I can answer service questions, collect lead details, and guide customers to the right next step.'
    }
  ]
};

const quickPrompts: Record<ChatPlacement, string[]> = {
  web: [
    'I need a website for my cleaning business',
    'How much is the Lead & Booking Bot?',
    'I already have a website but miss inquiries'
  ],
  whatsapp: [
    'What can your chatbot answer?',
    'Can it collect booking requests?',
    'Can it work in other languages?'
  ]
};

function buildDemoReply(text: string, placement: ChatPlacement) {
  const input = text.toLowerCase();

  if (/\b(price|pricing|cost|how much|lead & booking|lead booking)\b/.test(input)) {
    return 'The Lead & Booking Bot is $700 setup plus $150/month. It includes up to 20,000 messages/month and is best for collecting leads and booking requests through chat.';
  }

  if (/\b(cleaning|website|site|landing|online presence)\b/.test(input)) {
    return 'For a cleaning business, I would usually start with a professional website showing services, reviews, service areas, and a quote request flow. If you also get repeated questions, a chatbot can capture leads while you are busy.';
  }

  if (/\b(miss|missed|inquiries|messages|busy|after hours|24\/7)\b/.test(input)) {
    return 'That is a strong fit for a smart chatbot. It can answer common questions, collect the customer name, phone, service interest, and send the lead to your team so fewer inquiries slip away.';
  }

  if (/\b(booking|appointment|calendar|schedule)\b/.test(input)) {
    return 'Yes. A Lead & Booking Bot can collect booking requests, ask the right questions, and route details to your calendar or approval workflow depending on the setup.';
  }

  if (/\b(language|languages|spanish|urdu|arabic|hindi)\b/.test(input)) {
    return 'Office Pigeon agents can start in the language chosen during setup and can respond in other supported languages based on the customer language, where supported.';
  }

  if (/\b(whatsapp|instagram|facebook|channel)\b/.test(input)) {
    return 'Office Pigeon can build chatbot flows for a website widget and supported messaging channels such as WhatsApp, Instagram, or Facebook depending on the package and platform rules.';
  }

  if (/\b(human|contact|consultation|start|buy)\b/.test(input)) {
    return 'Absolutely. The best next step is a free consultation so Office Pigeon can understand your business and recommend the right chatbot setup without guessing.';
  }

  return placement === 'whatsapp'
    ? 'I can help with services, pricing, booking requests, FAQs, lead capture, and handoff to the Office Pigeon team. What type of business do you run?'
    : 'A smart chatbot can answer repeated questions, capture lead details, and guide visitors toward booking or WhatsApp. Are you mainly trying to get more leads, save time, or improve customer support?';
}

export default function Chatbots({ onOpenPackageModal }: ChatbotsProps) {
  const [activeTab, setActiveTab] = useState<ChatPlacement>('web');
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [messagesByTab, setMessagesByTab] = useState<Record<ChatPlacement, DemoMessage[]>>(starterMessages);
  const [conversationIds, setConversationIds] = useState<Partial<Record<ChatPlacement, string>>>({});

  const messages = messagesByTab[activeTab];

  const pushPresetMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;

    const placement = activeTab;
    setMessagesByTab((prev) => ({
      ...prev,
      [placement]: [...prev[placement], { role: 'user', text: trimmed }]
    }));
    setInput('');
    setThinking(true);

    window.setTimeout(() => {
      setMessagesByTab((prev) => ({
        ...prev,
        [placement]: [...prev[placement], { role: 'bot', text: buildDemoReply(trimmed, placement) }]
      }));
      setThinking(false);
    }, 520);
  };

  const sendPipMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;

    const placement = activeTab;
    const history = messagesByTab[placement].map((message) => ({
      role: message.role === 'bot' ? 'assistant' : 'user',
      content: message.text
    }));

    setMessagesByTab((prev) => ({
      ...prev,
      [placement]: [...prev[placement], { role: 'user', text: trimmed }]
    }));
    setInput('');
    setThinking(true);

    try {
      const response = await fetch('/api/pip/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationIds[placement],
          message: trimmed,
          history,
          sourcePage: `/chatbots-${placement}-simulator`
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Pip AI request failed.');

      if (data.conversationId) {
        setConversationIds((prev) => ({ ...prev, [placement]: data.conversationId }));
      }

      setMessagesByTab((prev) => ({
        ...prev,
        [placement]: [
          ...prev[placement],
          {
            role: 'bot',
            text:
              typeof data.answer === 'string' && data.answer.trim()
                ? data.answer.trim()
                : 'I can help with Office Pigeon services, pricing, packages, booking, chatbots, calling agents, or automations. What would you like to test?'
          }
        ]
      }));
    } catch {
      setMessagesByTab((prev) => ({
        ...prev,
        [placement]: [
          ...prev[placement],
          {
            role: 'bot',
            text:
              'I could not reach Pip AI for that custom message right now. You can still try a preset prompt, open Ask Pip AI, or book a free consultation.'
          }
        ]
      }));
    } finally {
      setThinking(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendPipMessage(input);
  };

  const resetDemo = () => {
    setInput('');
    setThinking(false);
    setMessagesByTab((prev) => ({ ...prev, [activeTab]: starterMessages[activeTab] }));
    setConversationIds((prev) => {
      const next = { ...prev };
      delete next[activeTab];
      return next;
    });
  };

  return (
    <div className="space-y-24 pb-20 mt-16 font-sans overflow-hidden">
      <section className="bg-gradient-to-b from-emerald-50/10 via-transparent to-transparent pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-600 font-bold bg-emerald-50 px-3.5 py-1.5 rounded-full">
            SMART CHATBOT SOLUTIONS
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight max-w-3xl mx-auto">
            Let your business reply faster, even when you are busy
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            Customers do not always wait for manual replies. Office Pigeon builds smart chatbots that answer questions, collect leads, guide customers, and help your business stay available longer.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onOpenPackageModal(CHATBOT_PACKAGES[0])}
              className="w-full sm:w-auto px-6 py-3.5 bg-gray-900 text-white font-sans text-xs font-bold rounded-2xl cursor-pointer"
            >
              Start My Chatbot
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('chatbot-pricing');
                if (el) window.scrollTo({ top: el.offsetTop });
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-white border border-gray-200 text-gray-700 font-sans text-xs font-semibold rounded-2xl"
            >
              View Chatbot Packages
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-5">
            <span className="text-[9px] font-mono tracking-widest uppercase text-emerald-600 font-bold">CONVERSION LEAKAGE</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              Every slow reply can become a missed opportunity
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Customers often ask the same questions again and again. They want to know your services, pricing, location, hours, availability, and next steps. A smart chatbot helps answer those questions quickly and keeps the conversation moving.
            </p>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Letting AI capture inquiries outside work hours keeps prospective clients warm and queues up qualified bookings.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            {[
              ['Faster Replies', 'Give customers helpful answers instantly without making them wait for a manual text.', Clock],
              ['Better Lead Capture', 'Collect customer names, emails, phone numbers, and service interests in standard flows.', MessageSquare],
              ['More Organized', 'Send collected contacts into Google Sheets or CRMs instead of losing records in message logs.', Compass],
              ['Active Beyond Hours', 'Keep capturing booking requests at night, on weekends, and while your team is busy.', Bot]
            ].map(([title, text, Icon]) => (
              <div key={title as string} className="bg-white border border-gray-100 p-6 rounded-3xl space-y-2 shadow-xs">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <Icon size={16} />
                </span>
                <h4 className="font-bold text-sm text-gray-900 pt-1">{title as string}</h4>
                <p className="text-[11px] text-gray-400 leading-normal">{text as string}</p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-12 bg-emerald-50/50 border border-emerald-100 p-5 rounded-3xl">
            <p className="text-xs text-emerald-800 leading-relaxed font-medium">
              Office Pigeon agents can start in the language chosen during setup and can respond in other supported languages based on the customer's language. English is the primary setup language, with multilingual customer conversations available where supported.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-600 font-bold bg-white border border-gray-100 px-3.5 py-1.5 rounded-full">
              INTERACTIVE CHAT SIMULATOR
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900">See smart chatbots in action</h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">
              Try the same Pip AI-style assistant in a website widget layout or a WhatsApp-style customer chat.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 max-w-md mx-auto bg-gray-100 p-1 rounded-full">
            {[
              ['web', 'Pip Website Widget', Globe2],
              ['whatsapp', 'WhatsApp Layout', MessageSquare]
            ].map(([id, label, Icon]) => (
              <button
                key={id as string}
                onClick={() => setActiveTab(id as ChatPlacement)}
                className={`flex-1 py-2.5 px-3 text-[11px] sm:text-xs font-bold rounded-full transition-all inline-flex items-center justify-center gap-1.5 ${
                  activeTab === id ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Icon size={13} />
                <span>{label as string}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6 items-stretch">
            <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <RefreshCw size={15} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Test prompts</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {quickPrompts[activeTab].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => pushPresetMessage(prompt)}
                    className="text-left rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-xs font-bold text-gray-700 transition hover:border-emerald-200 hover:bg-emerald-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <button
                onClick={resetDemo}
                className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-xs font-black text-gray-500 transition hover:bg-gray-50"
              >
                Reset this demo
              </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm min-h-[520px] flex flex-col overflow-hidden">
              {activeTab === 'web' ? (
                <div className="h-full flex flex-col">
                  <div className="px-5 py-4 bg-cyan-600 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                        <Bot size={16} />
                      </span>
                      <div>
                        <span className="font-bold text-sm block">Pip Website Assistant</span>
                        <span className="text-[10px] text-cyan-100 font-mono uppercase">Office Pigeon demo</span>
                      </div>
                    </div>
                    <span className="w-2.5 h-2.5 bg-emerald-300 rounded-full animate-pulse" />
                  </div>

                  <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-gray-50/60">
                    {messages.map((message, index) => (
                      <motion.div
                        key={`${message.role}-${index}-${message.text}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[88%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                            message.role === 'user'
                              ? 'bg-cyan-600 text-white rounded-tr-sm'
                              : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                          }`}
                        >
                          {message.text}
                        </div>
                      </motion.div>
                    ))}
                    {thinking && (
                      <div className="w-fit rounded-2xl rounded-tl-sm border border-gray-100 bg-white px-3 py-2 text-xs text-gray-400">
                        Pip is typing...
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ask about services, pricing, leads..."
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      className="min-w-0 flex-1 px-3.5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs outline-none focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-100"
                    />
                    <button type="submit" className="h-11 w-11 shrink-0 bg-cyan-600 text-white rounded-2xl hover:bg-cyan-700 transition-colors flex items-center justify-center">
                      <Send size={15} />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="px-5 py-3 bg-emerald-600 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-9 h-9 rounded-full bg-white text-emerald-600 flex items-center justify-center shrink-0">
                        <Bot size={16} />
                      </span>
                      <div className="min-w-0">
                        <span className="font-black text-sm block truncate">Pip AI for WhatsApp</span>
                        <span className="text-[10px] text-emerald-100 font-mono uppercase">Business assistant</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-100">online</span>
                  </div>

                  <div className="p-4 flex-1 overflow-y-auto space-y-3.5 bg-stone-100">
                    {messages.map((message, index) => (
                      <motion.div
                        key={`${message.role}-${index}-${message.text}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[84%] p-3 rounded-xl text-xs sm:text-sm leading-relaxed relative ${
                            message.role === 'user'
                              ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-sm'
                              : 'bg-white text-gray-900 rounded-tl-sm shadow-sm'
                          }`}
                        >
                          <p>{message.text}</p>
                          <div className="text-[9px] text-gray-400 text-right mt-1.5 font-mono flex items-center justify-end gap-0.5">
                            11:42 AM {message.role === 'user' && <CheckCheck size={11} className="text-blue-500" />}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {thinking && (
                      <div className="w-fit bg-white rounded-xl rounded-tl-sm px-3 py-2 text-xs text-gray-400 shadow-sm">
                        Pip is typing...
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type like a customer..."
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      className="min-w-0 flex-1 px-3.5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />
                    <button type="submit" className="h-11 w-11 shrink-0 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors flex items-center justify-center">
                      <Send size={15} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="chatbot-pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-600 font-bold">PRICING PACKAGES</span>
          <h2 className="text-3xl font-black text-gray-900">Secure automated replies with clear monthly tiers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CHATBOT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white border rounded-3xl p-7 flex flex-col justify-between relative shadow-xs transition-transform hover:translate-y-[-4px] ${
                pkg.badge ? 'border-emerald-200 ring-4 ring-emerald-50/50' : 'border-gray-100'
              }`}
            >
              {pkg.badge && (
                <span className="absolute top-0 right-6 -translate-y-1/2 bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  {pkg.badge}
                </span>
              )}
              <div>
                <h4 className="font-bold text-lg text-gray-900">{pkg.name}</h4>
                <p className="text-[10px] text-emerald-600 uppercase tracking-widest font-mono font-bold mt-1">Timeline: {pkg.timeline}</p>

                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-black text-gray-900">{pkg.price.split(' ')[0]}</span>
                  <span className="text-xs text-gray-400 font-medium ml-1">
                    {pkg.price.includes('setup') ? pkg.price.substring(pkg.price.indexOf('setup')) : ''}
                  </span>
                </div>

                <p className="text-[11px] text-gray-500 mt-2 font-medium">{pkg.bestFor}</p>

                <div className="h-px bg-gray-100 my-5" />

                <ul className="space-y-3">
                  {pkg.includes.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                      <Check size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 space-y-2">
                <button
                  onClick={() => onOpenPackageModal(pkg)}
                  className={`w-full py-4 text-xs font-bold rounded-2xl text-center cursor-pointer transition-all ${
                    pkg.badge ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Configure {pkg.name}
                </button>
                <p className="text-[10px] text-gray-400 text-center leading-normal italic">
                  {pkg.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50 py-16 rounded-3xl border border-gray-100">
        <div className="text-center space-y-3 mb-12">
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-400">TRAINING METRICS</span>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">How we program your high-conversion assistant</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            ['Phase 01', 'We Learn Your Business', 'You share your services, pricing, working hours, and common customer questions.'],
            ['Phase 02', 'Build Conversation Flows', 'We design conversation paths that collect contacts, screen services, and guide bookings.'],
            ['Phase 03', 'Connect Channels', 'Depending on package selections, we embed the chatbot into your website, WhatsApp, or social channels.'],
            ['Phase 04', 'Monitor & Improve', 'Active monthly subscriptions include error repairs, upkeep, and tone adjustments.']
          ].map(([phase, title, text]) => (
            <div key={phase} className="space-y-3 p-5">
              <span className="text-[10px] font-bold text-emerald-600 font-mono bg-emerald-50 px-2.5 py-1 rounded-full">{phase}</span>
              <h4 className="font-bold text-sm text-gray-900 pt-1">{title}</h4>
              <p className="text-[11px] text-gray-400 leading-normal">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <div className="border border-emerald-100 bg-white p-8 sm:p-10 rounded-3xl shadow-xs space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">Ready to stop missing customer messages?</h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
            Start with a smart chatbot that helps customers get answers and helps your business collect better leads.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onOpenPackageModal(CHATBOT_PACKAGES[0])}
              className="px-6 py-3.5 bg-gray-900 text-white font-sans text-xs font-bold rounded-2xl shadow-md cursor-pointer inline-flex items-center gap-1.5 hover:bg-gray-800 focus:outline-none"
            >
              Deploy Smart Chatbot
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
