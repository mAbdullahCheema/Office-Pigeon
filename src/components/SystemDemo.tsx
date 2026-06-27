/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Check, MessageSquare, Phone, Workflow, Smartphone, Bell } from 'lucide-react';

/**
 * SystemDemo — the home/Pakistan hero visual.
 *
 * Replaces the abstract Three.js hub (CONTENT-01, PERF-04). It literally shows
 * "the system working": a real customer message arrives → the AI replies and
 * books it → the lead is captured and the team is notified — across the four
 * Office Pigeon products (Website, Chatbot, Calling Agent, Automation).
 *
 * Pure CSS/SVG, no WebGL and no animation library. All motion is opacity/transform
 * only and is disabled under prefers-reduced-motion. Content is real text, so it
 * stays meaningful (and indexable once the site is server-rendered).
 */

const channels = [
  { icon: Smartphone, label: 'Website', active: false },
  { icon: MessageSquare, label: 'WhatsApp', active: true },
  { icon: Phone, label: 'Call', active: false },
  { icon: Workflow, label: 'Automation', active: false }
];

export default function SystemDemo() {
  return (
    <div className="relative w-full max-w-[460px] mx-auto select-none font-sans" aria-label="Live demo of the Office Pigeon system replying to a customer and capturing the lead">
      {/* Soft brand glow behind the panel */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-[44px] opacity-70"
        style={{ background: 'radial-gradient(60% 60% at 50% 30%, rgba(249,115,22,0.16), transparent 70%)' }}
      />

      {/* MAIN INBOX PANEL */}
      <div className="sd-reveal relative bg-white border border-black/5 rounded-[28px] shadow-[0_40px_90px_rgba(20,18,15,0.10)] overflow-hidden" style={{ animationDelay: '60ms' }}>
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

        {/* Channel tabs */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-black/5">
          {channels.map(({ icon: Icon, label, active }) => (
            <span
              key={label}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide border transition-colors ${
                active
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                  : 'bg-[#F0EEEA] text-gray-500 border-black/5'
              }`}
            >
              <Icon size={12} className="stroke-[2.5]" />
              <span className="hidden sm:inline">{label}</span>
            </span>
          ))}
        </div>

        {/* Conversation */}
        <div className="px-4 py-5 space-y-3 bg-white">
          {/* Incoming customer */}
          <div className="sd-reveal flex flex-col items-start" style={{ animationDelay: '300ms' }}>
            <span className="text-[9px] font-mono uppercase tracking-wider text-gray-400 mb-1 ml-1">Customer · WhatsApp</span>
            <p className="max-w-[80%] bg-[#F0EEEA] text-gray-800 text-[13px] font-semibold leading-snug px-3.5 py-2.5 rounded-2xl rounded-tl-md">
              Hi! Are you open Saturday? Can I book a deep clean?
            </p>
          </div>

          {/* AI typing → reply */}
          <div className="sd-reveal flex flex-col items-end" style={{ animationDelay: '650ms' }}>
            <span className="text-[9px] font-mono uppercase tracking-wider text-orange-500 mb-1 mr-1 font-bold">Pip AI · replies in seconds</span>
            <p className="max-w-[82%] bg-gradient-to-tr from-orange-500 to-rose-500 text-white text-[13px] font-semibold leading-snug px-3.5 py-2.5 rounded-2xl rounded-tr-md shadow-sm">
              Yes! Saturday 10am or 2pm is open. Want me to book it for you?
            </p>
          </div>

          {/* Customer short reply */}
          <div className="sd-reveal flex flex-col items-start" style={{ animationDelay: '950ms' }}>
            <p className="max-w-[70%] bg-[#F0EEEA] text-gray-800 text-[13px] font-semibold leading-snug px-3.5 py-2.5 rounded-2xl rounded-tl-md">
              2pm please 🙌
            </p>
          </div>

          {/* Typing indicator (subtle, always-on) */}
          <div className="flex items-center gap-1 pl-1" aria-hidden="true">
            <span className="sd-dot w-1.5 h-1.5 rounded-full bg-orange-400" style={{ animationDelay: '0ms' }} />
            <span className="sd-dot w-1.5 h-1.5 rounded-full bg-orange-400" style={{ animationDelay: '150ms' }} />
            <span className="sd-dot w-1.5 h-1.5 rounded-full bg-orange-400" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        {/* Result strip */}
        <div className="sd-reveal flex items-center gap-2.5 px-4 py-3.5 bg-[#0B0B0B] text-white" style={{ animationDelay: '1250ms' }}>
          <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <Check size={14} className="stroke-[3]" />
          </span>
          <p className="text-[11px] font-bold leading-tight">
            Booking confirmed · Lead saved to CRM · Team notified
          </p>
        </div>
      </div>

      {/* Floating automation proof cards */}
      <div className="sd-reveal sd-float absolute -right-3 sm:-right-5 top-[34%] bg-white border border-black/5 rounded-2xl shadow-[0_18px_44px_rgba(20,18,15,0.12)] px-3 py-2.5 flex items-center gap-2 max-w-[200px]" style={{ animationDelay: '1500ms' }}>
        <span className="w-7 h-7 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
          <Phone size={13} className="stroke-[2.5]" />
        </span>
        <p className="text-[10px] font-bold text-gray-700 leading-tight">Missed call → AI calls back in 30s</p>
      </div>

      <div className="sd-reveal sd-float absolute -left-3 sm:-left-6 bottom-[10%] bg-white border border-black/5 rounded-2xl shadow-[0_18px_44px_rgba(20,18,15,0.12)] px-3 py-2.5 flex items-center gap-2 max-w-[200px]" style={{ animationDelay: '1750ms', animationDuration: '6s' }}>
        <span className="w-7 h-7 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
          <Bell size={13} className="stroke-[2.5]" />
        </span>
        <p className="text-[10px] font-bold text-gray-700 leading-tight">New lead → Google Sheet + alert sent</p>
      </div>
    </div>
  );
}
