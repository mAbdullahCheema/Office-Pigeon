/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import type { JSX } from 'react';
import {
  Check, MessageSquare, Phone, Workflow, Globe, Bell,
  Calendar, FileSpreadsheet, PhoneCall, Send
} from 'lucide-react';

/**
 * SystemDemo — the home/Pakistan hero visual.
 *
 * Replaces the abstract Three.js hub (CONTENT-01, PERF-04). It literally shows
 * "the system working" across the four Office Pigeon products. The channel tabs
 * (Website / WhatsApp / Call / Automation) are interactive — clicking each swaps
 * the panel to a distinct, relevant scenario with its own shapes and visuals.
 *
 * Pure CSS/SVG, no WebGL and no animation library. All motion is opacity/transform
 * only and is disabled under prefers-reduced-motion. Content is real text, so it
 * stays meaningful (and indexable once the site is server-rendered).
 */

type ChannelId = 'whatsapp' | 'website' | 'call' | 'automation';

const channels: { id: ChannelId; icon: typeof Globe; label: string }[] = [
  { id: 'website', icon: Globe, label: 'Website' },
  { id: 'whatsapp', icon: MessageSquare, label: 'WhatsApp' },
  { id: 'call', icon: Phone, label: 'Call' },
  { id: 'automation', icon: Workflow, label: 'Automation' }
];

const captions: Record<ChannelId, string> = {
  whatsapp: 'Replies in seconds on WhatsApp — even after hours.',
  website: 'Your website turns visitors into booked leads, 24/7.',
  call: 'An AI agent answers every call, takes the booking, logs it.',
  automation: 'Behind the scenes, the busywork runs itself.'
};

/* ── Result strip shared across scenarios ── */
function ResultStrip({ text }: { text: string }) {
  return (
    <div className="sd-reveal flex items-center gap-2.5 mt-3" style={{ animationDelay: '900ms' }}>
      <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
        <Check size={14} className="stroke-[3] text-white" />
      </span>
      <p className="text-[11px] font-bold leading-tight text-gray-900">{text}</p>
    </div>
  );
}

/* ── WhatsApp: live chat → booking ── */
function WhatsAppScenario() {
  return (
    <div className="space-y-3">
      <div className="sd-reveal flex flex-col items-start" style={{ animationDelay: '120ms' }}>
        <span className="text-[9px] font-mono uppercase tracking-wider text-gray-400 mb-1 ml-1">Customer · WhatsApp</span>
        <p className="max-w-[82%] bg-[#F0EEEA] text-gray-800 text-[13px] font-semibold leading-snug px-3.5 py-2.5 rounded-2xl rounded-tl-md">
          Hi! Are you open Saturday? Can I book a deep clean?
        </p>
      </div>
      <div className="sd-reveal flex flex-col items-end" style={{ animationDelay: '420ms' }}>
        <span className="text-[9px] font-mono uppercase tracking-wider text-orange-500 mb-1 mr-1 font-bold">Pip AI · replies in seconds</span>
        <p className="max-w-[84%] bg-gradient-to-tr from-orange-500 to-rose-500 text-white text-[13px] font-semibold leading-snug px-3.5 py-2.5 rounded-2xl rounded-tr-md shadow-sm">
          Yes! Saturday 10am or 2pm is open. Want me to book it for you?
        </p>
      </div>
      <div className="sd-reveal flex flex-col items-start" style={{ animationDelay: '680ms' }}>
        <p className="max-w-[70%] bg-[#F0EEEA] text-gray-800 text-[13px] font-semibold leading-snug px-3.5 py-2.5 rounded-2xl rounded-tl-md">
          2pm please 🙌
        </p>
      </div>
      <ResultStrip text="Booking confirmed · Lead saved to CRM · Team notified" />
    </div>
  );
}

/* ── Website: contact form → lead captured ── */
function WebsiteScenario() {
  return (
    <div className="space-y-3">
      <div className="sd-reveal rounded-2xl border border-black/10 overflow-hidden" style={{ animationDelay: '120ms' }}>
        {/* fake browser bar */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-[#F0EEEA] border-b border-black/5">
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="ml-2 text-[10px] font-mono text-gray-500 truncate">yourbusiness.com</span>
        </div>
        {/* mini form */}
        <div className="p-3 space-y-2 bg-white">
          <p className="text-[11px] font-black uppercase tracking-wide text-gray-900">Get your free quote</p>
          <div className="text-[12px] font-semibold text-gray-700 bg-[#FAF9F6] border border-black/10 rounded-lg px-3 py-2">Sarah K.</div>
          <div className="text-[12px] font-semibold text-gray-700 bg-[#FAF9F6] border border-black/10 rounded-lg px-3 py-2">Service: Deep clean · Sat 2pm</div>
          <div className="flex items-center justify-center gap-1.5 bg-black text-white text-[11px] font-bold uppercase tracking-wide rounded-lg px-3 py-2.5">
            Send request <Send size={12} className="stroke-[2.5]" />
          </div>
        </div>
      </div>
      <ResultStrip text="Lead captured → routed to your inbox + WhatsApp" />
    </div>
  );
}

/* ── Call: AI answers, transcript, summary ── */
function CallScenario() {
  return (
    <div className="space-y-3">
      <div className="sd-reveal flex items-center gap-3 rounded-2xl bg-[#0B0B0B] text-white px-3.5 py-3" style={{ animationDelay: '120ms' }}>
        <span className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
          <PhoneCall size={16} className="stroke-[2.5]" />
        </span>
        <div className="leading-tight">
          <p className="text-[12px] font-black">Incoming call · AI answering</p>
          <p className="text-[10px] font-mono text-white/60">+1 ••• ••• 4218</p>
        </div>
        {/* waveform */}
        <div className="ml-auto flex items-end gap-0.5 h-5" aria-hidden="true">
          {[6, 12, 18, 10, 16, 8, 14].map((h, i) => (
            <span key={i} className="sd-pulse w-1 rounded-full bg-emerald-400" style={{ height: h, animationDelay: `${i * 120}ms` }} />
          ))}
        </div>
      </div>
      <div className="sd-reveal space-y-1.5" style={{ animationDelay: '420ms' }}>
        <p className="text-[12px] font-semibold text-gray-700"><span className="text-gray-400 font-mono text-[10px] uppercase mr-1">Caller</span> Do you do same-day service?</p>
        <p className="text-[12px] font-semibold text-orange-600"><span className="text-orange-400 font-mono text-[10px] uppercase mr-1">AI</span> We do — I can book you for 4pm today. Shall I?</p>
      </div>
      <ResultStrip text="Call answered · Booking request sent · Summary saved" />
    </div>
  );
}

/* ── Automation: flow of steps ── */
function AutomationScenario() {
  const steps = [
    { icon: Bell, label: 'New lead arrives' },
    { icon: FileSpreadsheet, label: 'Saved to Google Sheet' },
    { icon: MessageSquare, label: 'WhatsApp alert to team' },
    { icon: Calendar, label: 'Calendar hold created' }
  ];
  return (
    <div className="space-y-2.5">
      {steps.map(({ icon: Icon, label }, i) => (
        <div key={label} className="sd-reveal flex items-center gap-3" style={{ animationDelay: `${120 + i * 200}ms` }}>
          <span className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 border border-orange-100">
            <Icon size={14} className="stroke-[2.5]" />
          </span>
          <p className="text-[12px] font-bold text-gray-800">{label}</p>
          {i < steps.length - 1 && <span className="ml-auto text-[10px] font-mono text-emerald-500 font-bold">✓</span>}
        </div>
      ))}
      <ResultStrip text="4 steps ran automatically in 1.2s — no manual work" />
    </div>
  );
}

const scenarios: Record<ChannelId, () => JSX.Element> = {
  whatsapp: WhatsAppScenario,
  website: WebsiteScenario,
  call: CallScenario,
  automation: AutomationScenario
};

export default function SystemDemo() {
  const [active, setActive] = useState<ChannelId>('whatsapp');
  const Scenario = scenarios[active];

  return (
    <div className="relative w-full max-w-[460px] mx-auto select-none font-sans">
      {/* Soft brand glow behind the panel */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-[44px] opacity-70"
        style={{ background: 'radial-gradient(60% 60% at 50% 30%, rgba(249,115,22,0.16), transparent 70%)' }}
      />

      <div className="relative bg-white border border-black/5 rounded-[28px] shadow-[0_40px_90px_rgba(20,18,15,0.10)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-black/5 bg-[#FAF9F6]">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center p-1.5 shadow-sm">
              <img src="/logos/office-pigeon-icon.svg" alt="" className="w-full h-full" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-[13px] font-black text-gray-900">Office Pigeon</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">AI Front Desk</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-600">
            <span className="sd-pulse w-2 h-2 rounded-full bg-emerald-500" />
            Live
          </span>
        </div>

        {/* Interactive channel tabs */}
        <div className="flex items-center gap-1.5 px-3 py-3 border-b border-black/5" role="tablist" aria-label="Office Pigeon channels">
          {channels.map(({ id, icon: Icon, label }) => {
            const isActive = id === active;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
                  isActive
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm scale-[1.03]'
                    : 'bg-[#F0EEEA] text-gray-500 border-black/5 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                <Icon size={12} className="stroke-[2.5]" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Scenario body — fixed min-height to avoid layout shift when switching */}
        <div key={active} className="px-4 py-5 bg-white min-h-[268px] flex flex-col justify-center">
          <Scenario />
        </div>

        {/* Contextual caption */}
        <div className="px-4 py-3 bg-[#0B0B0B] text-white">
          <p className="text-[11px] font-bold leading-tight">{captions[active]}</p>
        </div>
      </div>

      {/* Floating proof card (channel-agnostic) */}
      <div className="sd-reveal sd-float absolute -right-3 sm:-right-5 top-[30%] bg-white border border-black/5 rounded-2xl shadow-[0_18px_44px_rgba(20,18,15,0.12)] px-3 py-2.5 flex items-center gap-2 max-w-[190px]" style={{ animationDelay: '1200ms' }}>
        <span className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Check size={13} className="stroke-[2.5]" />
        </span>
        <p className="text-[10px] font-bold text-gray-700 leading-tight">Never miss a customer again</p>
      </div>
    </div>
  );
}
