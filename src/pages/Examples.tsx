/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, ArrowRight, ExternalLink, MessageCircle, HelpCircle, Check, BookOpen, Clock } from 'lucide-react';
import { EXAMPLE_BUILDS } from '../config';
import { PageId } from '../types';

interface ExamplesProps {
  onPageChange: (page: PageId) => void;
  onOpenConsultationModal: () => void;
}

export default function Examples({ onPageChange, onOpenConsultationModal }: ExamplesProps) {
  const [activeSegment, setActiveSegment] = useState<'all' | 'website' | 'chatbot' | 'automation'>('all');

  const filteredBuilds = EXAMPLE_BUILDS.filter(b => {
    if (activeSegment === 'all') return true;
    return b.type === activeSegment;
  });

  return (
    <div className="space-y-24 pb-20 mt-16 font-sans overflow-hidden">
      
      {/* HERO SECTION CONTAINER */}
      <section className="bg-gradient-to-b from-cyan-50/10 via-transparent to-transparent pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-600 font-bold bg-cyan-50 px-3.5 py-1.5 rounded-full">
            REALIZATIONS SHOWCASE
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight max-w-3xl mx-auto">
            See what smarter business systems can look like
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            Explore example websites, chatbot demos, and automation flows designed to show how Office Pigeon can help businesses look better, reply faster, and work smarter.
          </p>
        </div>
      </section>

      {/* FILTER SEGMENTS AND RENDERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex items-center justify-center flex-wrap gap-2 max-w-md mx-auto bg-gray-100 p-1.5 rounded-2xl">
          {(['all', 'website', 'chatbot', 'automation'] as const).map(segment => (
            <button
              key={segment}
              onClick={() => setActiveSegment(segment)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize focus:outline-none transition-all cursor-pointer ${
                activeSegment === segment ? 'bg-white text-cyan-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {segment === 'all' ? 'All Examples' : `${segment}s`}
            </button>
          ))}
        </div>

        {/* EXAMPLES MOCK MATRIX */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* RENDER EXAMPLES */}
          {filteredBuilds.map((build, index) => (
            <div key={build.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between group hover:border-cyan-200 transition-all hover:shadow-md">
              <div className="space-y-4">
                <span className="text-[9px] font-mono tracking-widest bg-cyan-50 text-cyan-600 px-3 py-1 rounded-full uppercase font-bold">
                  {build.badge}
                </span>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400">{build.industry}</span>
                  <h4 className="font-bold text-lg text-gray-950 group-hover:text-cyan-600 transition-colors leading-tight">{build.title}</h4>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-normal">{build.caption}</p>

                <div className="h-px bg-gray-100 my-4" />

                <ul className="space-y-2">
                  {build.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[11px] text-gray-500">
                      <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ACTION COMPONENT */}
              <div className="mt-8">
                <button
                  onClick={() => alert(`Simulated demonstration link active: Example Link ${index + 1}`)}
                  className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-xs font-bold text-gray-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  Example Link {index + 1}
                  <ExternalLink size={12} className="stroke-[2.5] text-gray-400" />
                </button>
              </div>
            </div>
          ))}

          {/* CHATBOT REUSABLE LIVE MOCK CARD */}
          {(activeSegment === 'all' || activeSegment === 'chatbot') && (
            <div className="bg-white border border-dashed border-cyan-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between animate-pulse">
              <div className="space-y-4">
                <span className="text-[9px] font-mono tracking-widest bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full uppercase font-bold">Interactive Bot Mock</span>
                <h4 className="font-bold text-lg text-gray-950 leading-tight">Aesthetic Spa Bot Engine</h4>
                <p className="text-xs text-gray-400 leading-normal">Interactive WhatsApp-style conversational sandbox with automated FAQ answering modules.</p>
                <div className="bg-stone-50 p-3 rounded-2xl border border-gray-100 text-[10px] text-gray-400 font-mono">
                  [Status: Simulated sandbox ready in Chatbots detail page]
                </div>
              </div>
              <button
                onClick={() => onPageChange('chatbots')}
                className="mt-8 w-full py-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Test Live Bot Demo
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* AUTOMATION LIVE REUSABLE MOCK CARD */}
          {(activeSegment === 'all' || activeSegment === 'automation') && (
            <div className="bg-white border border-dashed border-cyan-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between animate-pulse">
              <div className="space-y-4">
                <span className="text-[9px] font-mono tracking-widest bg-amber-50 text-amber-600 px-3 py-1 rounded-full uppercase font-bold">Process Automation Flow</span>
                <h4 className="font-bold text-lg text-gray-950 leading-tight">Inquire → Sheet → CRM Relay</h4>
                <p className="text-xs text-gray-400 leading-normal">Connected integration nodes capturing web entries, sorting columns, and triggering sms holds automated.</p>
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 text-[10px] text-gray-400 font-mono">
                  [Status: Workflow outline visual modeled in Automations tab]
                </div>
              </div>
              <button
                onClick={() => onPageChange('automations')}
                className="mt-8 w-full py-3 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                View Workflow Diagram
                <ArrowRight size={14} />
              </button>
            </div>
          )}

        </div>
      </section>

      {/* CASE STUDIES COMING SOON AREA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-gray-50 py-16 rounded-3xl border border-gray-100">
        <div className="max-w-2xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-widest text-cyan-600 font-bold bg-white px-3.5 py-1.5 rounded-full border border-gray-100 uppercase animate-pulse">
            <BookOpen size={11} /> CASE STUDIES COMING SOON
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-gray-950">Real operational outcomes are being prepared</h3>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-lg mx-auto">
            Real business case studies will be added as Office Pigeon projects go live. Each case study will show the problem, solution, and result in a clear, simple way.
          </p>
        </div>
      </section>

      {/* CONVERSION BOTTOM */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <div className="border border-cyan-100 bg-white p-10 rounded-3xl shadow-xs space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">Want a custom business solution designed?</h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
            Let's evaluate your operational metrics during a custom coordinator consultation.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenConsultationModal}
              className="px-6 py-3.5 bg-gray-900 text-white font-sans text-xs font-bold rounded-2xl shadow-md cursor-pointer inline-flex items-center gap-1.5 hover:bg-gray-800"
            >
              Get Free Consultation
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
