/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { ShieldAlert, FileText, Scale, ShieldCheck } from 'lucide-react';
import { PageId } from '../types';

interface LegalProps {
  initialTab?: Extract<PageId, 'privacy' | 'terms' | 'refund' | 'fair-usage'>;
  onTabChange?: (page: Extract<PageId, 'privacy' | 'terms' | 'refund' | 'fair-usage'>) => void;
}

export default function Legal({ initialTab = 'privacy', onTabChange }: LegalProps) {
  const [activeTab, setActiveTab] = useState<Extract<PageId, 'privacy' | 'terms' | 'refund' | 'fair-usage'>>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (tab: Extract<PageId, 'privacy' | 'terms' | 'refund' | 'fair-usage'>) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20 mt-24 font-sans select-none">
      
      {/* HEADER STATEMENT */}
      <div className="text-center space-y-4">
        <span className="text-[10px] font-mono tracking-widest uppercase text-gray-400 font-bold bg-gray-50 px-3.5 py-1.5 rounded-full">
          COMPLIANCE DIRECTIVE
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">Brand Policies & SLA Statements</h1>
        <p className="text-xs text-amber-600 font-medium max-w-sm mx-auto bg-amber-50 border border-amber-100 p-2.5 rounded-xl leading-relaxed">
          ⚠️ Disclaimer: These policies are practical starter website policies and are not legal advice.
        </p>
      </div>

      {/* TABS CONTROLLERS */}
      <div className="flex items-center justify-center flex-wrap gap-2 bg-gray-100 p-1 rounded-2xl">
        <button
          onClick={() => handleTabChange('privacy')}
          className={`flex-1 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'privacy' ? 'bg-white text-cyan-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          🔒 Privacy
        </button>
        <button
          onClick={() => handleTabChange('terms')}
          className={`flex-1 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'terms' ? 'bg-white text-cyan-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          📜 Terms of Service
        </button>
        <button
          onClick={() => handleTabChange('refund')}
          className={`flex-1 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'refund' ? 'bg-white text-cyan-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          💸 Refund
        </button>
        <button
          onClick={() => handleTabChange('fair-usage')}
          className={`flex-1 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'fair-usage' ? 'bg-white text-cyan-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          ⚖️ Fair Use
        </button>
      </div>

      {/* CORE POLICY BOXES */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 text-xs text-gray-500 leading-relaxed font-normal">
        
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <ShieldCheck size={20} className="text-cyan-500" /> Privacy Policy Statement
            </h3>
            <p className="font-semibold text-gray-700">Information We Collect</p>
            <p>
              Office Pigeon collects information details you share through contact forms, onboarding wizards, and calendar widgets including your name, business name, verified email, telephone or WhatsApp coordinates, budget limits, current website properties, timeline needs, and related descriptions.
            </p>
            <p>
              We compile conversation inputs inside the Pip AI assistant module to train custom models and optimize answer delivery. No private data is ever sold, transferred, or rented to third-party list registries. Only standard required diagnostic metadata is accessed.
            </p>
            <p className="font-semibold text-gray-700">Security Guarding</p>
            <p>
              We deploy SSL transit certificates to encrypt submitted client files. While we leverage industry standard encryptions, clients acknowledge that net transfers hold trace exposure.
            </p>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <FileText size={20} className="text-cyan-500" /> Terms of Service Agreements
            </h3>
            <p className="font-semibold text-gray-700">Payment Milestone Terms</p>
            <p>
              Unless alternate clauses are structured, projects undergo a rigid **50% upfront payment** to reserve engineering slots, draft domain registries, and start wireframes. The remaining **50% final balance** is due upon final delivery approval after we present the operational sandbox presentation.
            </p>
            <p className="font-semibold text-gray-700">Support Metrics</p>
            <p>
              We provide included troubleshooting repairs and bug-fixes during active, paid monthly support terms. Major features expansions, adding products, modifying layouts, or integrating new third-party software are outside active SLAs and priced dynamically.
            </p>
            <p className="font-semibold text-gray-700">AI Capabilities Boundaries & Limitation of Liability</p>
            <p className="italic text-amber-700 bg-amber-50/50 border border-amber-100 p-3 rounded-xl leading-relaxed">
              * Artificial intelligence integrations may occasionally produce incorrect, incomplete, or unexpected responses. Important business decisions, sensitive customer files, medical setups, or financial actions should undergo direct human verification before deployment.
            </p>
            <p>
              Office Pigeon does not guarantee specific ranking benchmarks, conversion traffic, revenue metrics, or client volumes. Total liability is limited strictly to funds captured for that specific product line.
            </p>
            <p className="font-semibold text-gray-700">AI Calling Agents</p>
            <p>
              AI Calling Agents may collect call summaries, transcripts, lead details, and conversation data for service quality, follow-up, and business operations where supported. Availability of call handling, outbound calling, WhatsApp features, transcripts, and integrations may depend on local laws, customer consent requirements, provider approval, regional availability, and third-party platform rules. Office Pigeon does not guarantee sales, revenue, lead volume, platform approval, or legal compliance for a client specific industry or location. Businesses are responsible for using AI Calling Agents in a compliant and appropriate way.
            </p>
          </div>
        )}

        {activeTab === 'refund' && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <Scale size={20} className="text-cyan-300" /> Refund Policy
            </h3>
            <p className="font-semibold text-gray-700">All Purchases Final</p>
            <p>
              Because of custom designs, domain registrations, prompt engineering, and human hours committed upon project launch, **all purchases are final, non-refundable, and non-recallable** unless mandated by native national consumer protection statutes.
            </p>
            <p>
              If a client requests termination mid-way through a project scope, the initial 50% upfront payment remains fully captured by Office Pigeon to cover setup costs and hours committed.
            </p>
          </div>
        )}

        {activeTab === 'fair-usage' && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <ShieldAlert size={20} className="text-amber-500" /> AI Fair Usage Policy (FUP)
            </h3>
            <p className="font-semibold text-gray-700">Monthly Allotted Limits</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 font-medium">
              <li>Smart FAQ Bot: 10,000 processed messages/month</li>
              <li>Lead & Booking Bot: 20,000 processed messages/month</li>
              <li>AI Business Assistant: 40,000 processed messages/month</li>
            </ul>
            <p className="mt-2 text-gray-500">
              Extra usage quantities are bought in standard blocs of $20 per 1,000 additional processed answers.
            </p>
            <p className="font-semibold text-gray-700 pt-2">AI Calling Agent Limits</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 font-medium">
              <li>Smart Call Starter: 300 call minutes/month</li>
              <li>Lead & Booking Caller: 900 call minutes/month</li>
              <li>AI Voice Operations Agent: 2,500 call minutes/month</li>
            </ul>
            <p className="mt-2 text-gray-500">
              Extra AI Calling Agent minutes are billed at a fixed rate of $0.35/min across all packages. Unusual international routing, premium-rate numbers, high-volume WhatsApp messaging, special provider requirements, or custom carrier setups may require separate review or additional charges.
            </p>
            <p className="font-semibold text-gray-700 pt-2">Acceptable Use Limits</p>
            <p>
              Office Pigeon reserves absolute rights to terminate support or decline service scopes involving hazardous medical claims, adult platforms, betting assets, trading/investment hype schemes, political campaigns, or other layouts violating local statutes or partner platforms regulations.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
