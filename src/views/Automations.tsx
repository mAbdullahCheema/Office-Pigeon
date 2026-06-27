/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Settings, Check, ArrowRight, Share2, GitCommit, FileSpreadsheet, ShieldCheck, Mail, Calendar } from 'lucide-react';
import { AUTOMATION_EXAMPLES } from '../config';
import { Package } from '../types';

interface AutomationsProps {
  onOpenPackageModal: (pkg: Package) => void;
}

export default function Automations({ onOpenPackageModal }: AutomationsProps) {
  const auditPackage: Package = {
    id: 'automation-audit',
    name: 'Workflow Automation Audit',
    price: 'Free Consultation Audit',
    timeline: '2–3 working days',
    revision: 'Unlimited reviews',
    bestFor: 'Any service firms wasting hours on copy-paste and manual WhatsApp reminders.',
    includes: [
      'Comprehensive tracing of your inquiry sources',
      'Database bottleneck analysis',
      'Custom automation project mock proposal with price quotes'
    ]
  };

  return (
    <div className="space-y-24 pb-20 mt-16 font-sans overflow-hidden">
      
      {/* HERO HERO SECTION */}
      <section className="bg-gradient-to-b from-amber-50/10 via-transparent to-transparent pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-amber-600 font-bold bg-amber-50 px-3.5 py-1.5 rounded-full">
            WORKFLOW AUTOMATIONS
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight max-w-3xl mx-auto">
            Stop repeating the same tasks every day
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            Office Pigeon connects your business tools so leads, reminders, updates, and follow-ups move automatically in the background. Setup starting from $100 + convenient support.
          </p>
          <div className="pt-3 flex items-center justify-center gap-4">
            <button
              onClick={() => onOpenPackageModal(auditPackage)}
              className="px-6 py-3.5 bg-gray-900 text-white font-sans text-xs font-bold rounded-2xl cursor-pointer hover:bg-gray-800 transition-colors shadow-md shadow-gray-200 focus:outline-none"
            >
              Book a Free Workflow Audit
            </button>
          </div>
        </div>
      </section>

      {/* DETAILED EXPLANATIVE BLOCKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-5">
            <span className="text-[9px] font-mono tracking-widest uppercase text-amber-600 font-bold">REDUCE FRICTION TENSION</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              If it feels repetitive, it is ready to be automated
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Many growing businesses waste time moving information from one place to another. A customer fills a form, someone copies it into a sheet, someone sends a message, someone creates a reminder, and someone follows up later. 
            </p>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-semibold">
              Office Pigeon turns those repeated steps into automatic workflows that execute flawlessly 24/7.
            </p>
          </div>

          <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <h4 className="font-bold text-sm text-gray-900 uppercase tracking-widest mb-6 font-mono text-cyan-600">Sample Automation Flows</h4>
            
            <div className="space-y-6">
              
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500"><GitCommit size={16} /></div>
                <div>
                  <h5 className="font-bold text-xs text-gray-950">Lead Capture Flow</h5>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">A customer fills out your website form. Their details are saved, added to a sheet, organized, and sent to the right place automatically.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500"><Calendar size={16} /></div>
                <div>
                  <h5 className="font-bold text-xs text-gray-950">Booking Reminder Flow</h5>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">A customer books an appointment. They receive confirmation, reminders, and follow-up messages without manual work.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500"><Mail size={16} /></div>
                <div>
                  <h5 className="font-bold text-xs text-gray-950">Missed Lead Follow-Up</h5>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">A lead comes in after hours. The system saves the lead, sends a friendly follow-up, notifies your business, and reminds the customer to book a call.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* DETAILED DRILLDOWN LISTING OF AUTOMATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-mono tracking-widest uppercase text-amber-600 font-bold">CAPABILITY SPECTRUM</span>
          <h3 className="text-2xl font-black text-gray-900">What we connect behind the scenes</h3>
          <p className="text-xs text-gray-400">Fully integrated with CRM matrices, Zapier triggers, and spreadsheets:</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AUTOMATION_EXAMPLES.map((item, idx) => (
            <div key={idx} className="bg-white border border-gray-100 p-6 rounded-3xl space-y-3 shadow-xs hover:border-amber-200 transition-colors">
              <span className="text-[9px] font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase">
                {item.title.split(' ')[0]} Connection
              </span>
              <h4 className="font-bold text-sm text-gray-950 pt-1">{item.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-normal">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CLARIFY CLAUSES */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50/50 border border-amber-100 p-8 rounded-3xl space-y-4">
          <h4 className="font-sans text-sm font-bold text-amber-800 flex items-center gap-1.5">
            🛡️ Fully Managed Service Oversight
          </h4>
          <p className="text-xs text-amber-700 leading-relaxed">
            All connecting links and code maps are **fully managed by Office Pigeon**, so you do not have to deal with the technical side or pay expensive software subscriptions to trace errors. Active monthly monitoring guarantees repair, support, and oversight metrics.
          </p>
          <p className="text-[11px] text-amber-600 leading-normal italic">
            * Monitoring and issue fixing are included during active monthly service. New workflow changes, new automations, or major edits are quoted separately.
          </p>
        </div>
      </section>

      {/* FINAL TRANSITION CARD */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <div className="border border-amber-200 bg-white p-10 rounded-3xl shadow-xs space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">What task should your business stop doing manually?</h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
            Book a free workflow audit and tell us what is slowing your business down.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onOpenPackageModal(auditPackage)}
              className="px-6 py-3.5 bg-gray-900 hover:bg-gray-800 transition-colors text-white font-sans text-xs font-bold rounded-2xl shadow-md cursor-pointer inline-flex items-center gap-1.5 focus:outline-none"
            >
              Book My Free Workflow Audit
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
