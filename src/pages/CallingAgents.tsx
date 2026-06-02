/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ArrowRight, Calendar, Check, FileText, Globe2, MessageSquare, Mic, PhoneCall, RefreshCw, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react';
import { CALLING_AGENT_PACKAGES } from '../config';
import { Package } from '../types';

interface CallingAgentsProps {
  onOpenPackageModal: (pkg: Package) => void;
}

const featureBlocks = [
  {
    title: 'Inbound Call Answering',
    text: 'Your AI agent can answer customer calls, explain services, collect details, and reduce missed inquiries.',
    icon: PhoneCall
  },
  {
    title: 'Approved Outbound Follow-Ups',
    text: 'Use AI calls for missed-call callbacks, appointment reminders, booking confirmations, lead follow-ups, review requests, and payment reminders where appropriate.',
    icon: RefreshCw
  },
  {
    title: 'WhatsApp Support',
    text: 'Support WhatsApp conversations where platform rules, verification, and regional availability allow it.',
    icon: MessageSquare
  },
  {
    title: 'Booking Requests and Calendar Workflows',
    text: 'Collect appointment requests, check required details, and connect to calendar or approval workflows depending on the package.',
    icon: Calendar
  },
  {
    title: 'Multilingual Customer Conversations',
    text: 'Start in your chosen setup language and respond in other supported languages based on the customer language.',
    icon: Globe2
  },
  {
    title: 'Lead Alerts and Logs',
    text: 'Send lead details to your team through supported channels such as email, WhatsApp, Google Sheets, CRM, or calendar workflows depending on package and setup.',
    icon: FileText
  },
  {
    title: 'Office Pigeon Managed Infrastructure',
    text: 'Office Pigeon manages the AI calling setup under fair usage limits so clients do not have to handle complex provider configuration themselves.',
    icon: ShieldCheck
  },
  {
    title: 'Clear Monthly Usage',
    text: 'Each package includes a monthly call-minute allowance with a fixed extra-minute rate.',
    icon: SlidersHorizontal
  }
];

const approvedOutbound = [
  'Missed-call callbacks',
  'Lead follow-up after website forms',
  'Appointment reminders',
  'Booking confirmations',
  'Review request calls',
  'Payment reminder calls where appropriate'
];

const addOns = [
  'Extra call minutes',
  'Extra phone numbers',
  'WhatsApp setup',
  'Existing number connection',
  'Live call transfer',
  'CRM integration',
  'Advanced calendar or booking integration',
  'Advanced analytics and reporting',
  'Custom outbound workflows',
  'Additional language setup',
  'Custom voice setup',
  'High-volume usage plans'
];

const liveVoiceProfiles = [
  ['English', 'Adam', 'Engaging, Friendly and Bright'],
  ['Spanish', 'Juan', 'Friendly & Effortless'],
  ['Hindi / Hinglish', 'Bunty', 'Funny Best Friend'],
  ['Urdu', 'Irina', 'Energetic E-commerce Girl'],
  ['Arabic', 'Abdullah', 'Professional and Energetic']
];

const liveAgentPrompts = [
  'Ask how AI Calling Agents handle missed calls.',
  'Ask how much Lead & Booking Caller costs.',
  'Ask whether you can use your own number.',
  'Ask if the agent can answer in multiple languages.'
];

function findInteractiveControl(root: Document | ShadowRoot | Element): HTMLElement | null {
  const controls = Array.from(root.querySelectorAll<HTMLElement>('button, [role="button"], a'));
  const matchingControl = controls.find((control) => {
    const label = `${control.getAttribute('aria-label') || ''} ${control.textContent || ''}`.toLowerCase();
    return /start|voice|chat|call|talk|open/.test(label);
  });

  if (matchingControl) return matchingControl;

  const elements = Array.from(root.querySelectorAll<HTMLElement>('*'));
  for (const element of elements) {
    if (element.shadowRoot) {
      const nested = findInteractiveControl(element.shadowRoot);
      if (nested) return nested;
    }
  }

  return null;
}

export default function CallingAgents({ onOpenPackageModal }: CallingAgentsProps) {
  const [voiceNotice, setVoiceNotice] = useState('Use the button below to open the live Pip AI Caller widget.');

  const launchLiveAgent = () => {
    if (typeof document === 'undefined') return;

    const widget = document.querySelector<HTMLElement>('elevenlabs-convai');
    if (!widget) {
      setVoiceNotice('The live voice widget is still loading. Please try again in a moment.');
      return;
    }

    widget.setAttribute('default-expanded', 'true');
    widget.setAttribute('allow-events', 'true');

    const control = findInteractiveControl(widget.shadowRoot || widget);
    if (control) {
      control.click();
      setVoiceNotice('Live Pip AI Caller opened. If your browser asks for microphone access, allow it to start the conversation.');
      return;
    }

    widget.click();
    widget.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    setVoiceNotice('Use the voice widget on the page to start the live Pip AI Caller conversation.');
  };

  return (
    <div className="space-y-24 pb-20 mt-16 font-sans overflow-hidden">
      <section className="bg-gradient-to-b from-orange-50/20 via-transparent to-transparent pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-orange-600 font-bold bg-orange-50 px-3.5 py-1.5 rounded-full">
            AI CALLING AGENTS
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight max-w-4xl mx-auto">
            Answer calls, capture leads, and book customers automatically with a 24/7 AI Calling Agent.
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Office Pigeon builds AI phone and WhatsApp agents that answer customer questions, collect lead details, handle booking requests, send follow-ups, and notify your team, all under clear monthly usage limits.
          </p>
          <p className="text-xs sm:text-sm text-orange-700 max-w-xl mx-auto leading-relaxed font-semibold bg-orange-50 border border-orange-100 rounded-2xl px-5 py-3">
            Never miss another serious customer inquiry because your business was busy, closed, or slow to respond.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onOpenPackageModal(CALLING_AGENT_PACKAGES[1])}
              className="w-full sm:w-auto px-6 py-3.5 bg-gray-900 hover:bg-orange-500 text-white font-sans text-xs font-bold rounded-2xl cursor-pointer transition-colors shadow-md shadow-gray-200 focus:outline-none"
            >
              Configure Calling Agent
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('calling-pricing');
                if (el) window.scrollTo({ top: el.offsetTop });
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-white border border-gray-200 text-gray-700 font-sans text-xs font-semibold rounded-2xl hover:bg-gray-50 transition-colors"
            >
              View Calling Packages
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 space-y-5">
            <span className="text-[9px] font-mono tracking-widest uppercase text-orange-600 font-bold">CALL RESPONSE LAYER</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              A managed voice assistant for the calls your team cannot always catch
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              AI Calling Agents support both inbound and approved outbound use cases. Cold calling campaigns are not included in standard packages and may require separate review.
            </p>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Office Pigeon agents can start in the language chosen during setup and can respond in other supported languages based on the customer language. English is the primary setup language, with multilingual customer conversations available where supported.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {featureBlocks.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="bg-white border border-gray-100 p-6 rounded-3xl space-y-2 shadow-xs hover:translate-y-[-2px] transition-transform">
                  <span className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                    <Icon size={16} />
                  </span>
                  <h3 className="font-bold text-sm text-gray-900 pt-1">{feature.title}</h3>
                  <p className="text-[11px] text-gray-400 leading-normal">{feature.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-orange-50/40 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-orange-600 font-bold bg-white border border-orange-100 px-3.5 py-1.5 rounded-full">
              LIVE ELEVENLABS AGENT
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Try Pip AI Caller with the real live voice agent</h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
              This section launches the same public Pip AI Caller widget on the website, using the natural voices configured inside the agent.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-6 items-stretch">
            <div className="relative overflow-hidden rounded-3xl bg-gray-950 text-white p-6 sm:p-8 shadow-xl min-h-[520px] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(249,115,22,0.26),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(244,63,94,0.18),transparent_32%)]" />
              <div className="relative space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-lg">
                    <Mic size={22} />
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-bold text-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                    live widget
                  </span>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-orange-200">Pip AI Caller</span>
                  <h3 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
                    Start a real voice chat with the Office Pigeon agent.
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Click below to open the live voice widget, allow microphone access, and ask about pricing, missed calls, booking requests, languages, or using your own number.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {liveAgentPrompts.map((prompt) => (
                    <div key={prompt} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[11px] leading-relaxed text-gray-200">
                      {prompt}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mt-8 space-y-3">
                <button
                  onClick={launchLiveAgent}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-xs font-black uppercase tracking-wide text-gray-950 shadow-lg transition hover:bg-orange-100 sm:w-auto"
                >
                  <PhoneCall size={15} />
                  Start live voice chat
                </button>
                <p className="text-[11px] text-gray-400 leading-relaxed">{voiceNotice}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-5 sm:p-6 shadow-sm min-h-[520px] flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-orange-600">
                  <Sparkles size={15} />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Natural voice setup</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900">Configured to feel like a real multilingual caller experience</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  These voice personalities are handled inside the live agent configuration, not through browser text-to-speech. The website only launches the public agent widget.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {liveVoiceProfiles.map(([language, voice, tone]) => (
                  <div key={language} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-orange-600 font-bold">{language}</span>
                    <h4 className="mt-2 text-sm font-black text-gray-900">{voice}</h4>
                    <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">{tone}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4">
                <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-orange-600">What visitors can test</span>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['Service questions', 'Pricing and packages', 'Booking requests', 'Language switching', 'Own number policy', 'WhatsApp workflows'].map((item) => (
                    <span key={item} className="inline-flex items-center gap-2 text-xs font-semibold text-orange-900">
                      <Check size={13} className="text-orange-500 shrink-0" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onOpenPackageModal(CALLING_AGENT_PACKAGES[1])}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-xs font-black text-gray-700 transition hover:bg-gray-50"
              >
                Configure a similar agent
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="calling-pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] font-mono tracking-widest uppercase text-orange-600 font-bold">AI CALLING PRICING</span>
          <h2 className="text-3xl font-black text-gray-900">Clear monthly call-minute packages</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Each plan includes a monthly fair usage allowance of AI call minutes. Extra minutes are billed at a fixed rate of $0.35/min across all packages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CALLING_AGENT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white border rounded-3xl p-7 flex flex-col justify-between relative shadow-xs transition-transform hover:translate-y-[-4px] ${
                pkg.badge ? 'border-orange-200 ring-4 ring-orange-50/50' : 'border-gray-100'
              }`}
            >
              {pkg.badge && (
                <span className="absolute top-0 right-6 -translate-y-1/2 bg-orange-600 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  {pkg.badge}
                </span>
              )}
              <div>
                <h4 className="font-bold text-lg text-gray-900">{pkg.name}</h4>
                <p className="text-[10px] text-orange-600 uppercase tracking-widest font-mono font-bold mt-1">{pkg.timeline}</p>
                <div className="mt-4 flex flex-wrap items-baseline gap-x-1">
                  <span className="text-3xl font-black text-gray-900">{pkg.price.split(' setup')[0]}</span>
                  <span className="text-xs text-gray-400 font-medium">setup + {pkg.price.split('+ ')[1]}</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-2 font-medium">{pkg.bestFor}</p>
                <div className="h-px bg-gray-100 my-5" />
                <ul className="space-y-3">
                  {pkg.includes.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                      <Check size={14} className="text-orange-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-gray-400 mt-5 leading-normal italic">{pkg.note}</p>
              </div>
              <button
                onClick={() => onOpenPackageModal(pkg)}
                className={`mt-8 w-full py-4 text-xs font-bold rounded-2xl text-center cursor-pointer transition-all ${
                  pkg.badge ? 'bg-orange-600 text-white shadow-lg shadow-orange-100 hover:bg-orange-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Configure {pkg.name}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-3xl text-xs text-orange-800 leading-relaxed space-y-2">
          <p>
            Usage includes AI-handled phone conversations and may vary depending on call length, customer behavior, provider rules, and supported channels.
          </p>
          <p>
            Standard plans include Office Pigeon-managed AI calling infrastructure up to the included fair usage limits. Unusual international routing, premium-rate numbers, high-volume WhatsApp messaging, special provider requirements, or custom carrier setups may require separate review or additional charges.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xs space-y-5">
            <span className="text-[10px] font-mono tracking-widest uppercase text-orange-600 font-bold">Approved outbound</span>
            <h2 className="text-2xl font-black text-gray-900">Follow-ups without advertising cold calling as standard</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {approvedOutbound.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-gray-500">
                  <Check size={14} className="text-orange-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xs space-y-5">
            <span className="text-[10px] font-mono tracking-widest uppercase text-orange-600 font-bold">Numbers and WhatsApp</span>
            <p className="text-xs text-gray-500 leading-relaxed">
              Office Pigeon can provide and manage a new Twilio-powered number for your AI Calling Agent. Clients may also request setup with their own existing number, but this can require extra steps from their phone provider, Twilio, WhatsApp, or verification systems.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              WhatsApp support is available where supported by provider rules, business verification, and regional availability. WhatsApp setup may require business verification and approval from third-party platforms. Messaging costs are included up to fair usage where applicable, and extra usage may be billed separately.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-mono tracking-widest uppercase text-orange-600 font-bold">CUSTOM UPGRADES</span>
          <h2 className="text-3xl font-black text-gray-900">Available add-ons</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {addOns.map((item) => (
            <div key={item} className="bg-white border border-gray-100 rounded-2xl p-4 text-xs text-gray-500 font-semibold shadow-xs">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-950 rounded-3xl p-8 sm:p-10 text-white space-y-4 shadow-xl">
          <span className="text-[10px] font-mono tracking-widest uppercase text-orange-300 font-bold">Compliance note</span>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            AI Calling Agents may collect call summaries, transcripts, lead details, and conversation data for service quality, follow-up, and business operations where supported. Availability of call handling, outbound calling, WhatsApp features, transcripts, and integrations may depend on local laws, customer consent requirements, provider approval, regional availability, and third-party platform rules. Office Pigeon does not guarantee sales, revenue, lead volume, platform approval, or legal compliance for a client specific industry or location. Businesses are responsible for using AI Calling Agents in a compliant and appropriate way.
          </p>
          <button
            onClick={() => onOpenPackageModal(CALLING_AGENT_PACKAGES[1])}
            className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-sans text-xs font-bold rounded-2xl cursor-pointer inline-flex items-center gap-1.5 transition-colors"
          >
            Discuss AI Calling Setup
            <ArrowRight size={14} />
          </button>
        </div>
      </section>
    </div>
  );
}
