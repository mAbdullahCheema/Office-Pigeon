/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Check, ArrowRight, Smartphone, Compass, Clock, RefreshCw, Send, CheckCheck } from 'lucide-react';
import { CHATBOT_PACKAGES } from '../config';
import { Package } from '../types';

interface ChatbotsProps {
  onOpenPackageModal: (pkg: Package) => void;
}

export default function Chatbots({ onOpenPackageModal }: ChatbotsProps) {
  const [activeTab, setActiveTab] = useState<'web' | 'whatsapp'>('web');
  const [waText, setWaText] = useState('');
  const [waLines, setWaLines] = useState<string[]>([
    'Hello! Do you have slots open tomorrow at 2 PM?',
    'Let me check our active calendars! Yes, our beauty treatment slots are available.',
    'Perfect, write me down under John Doe!'
  ]);

  const handlePushWaText = (e: FormEvent) => {
    e.preventDefault();
    if (!waText.trim()) return;
    setWaLines(prev => [...prev, waText]);
    const originalText = waText;
    setWaText('');
    
    // Simulate auto AI chatbot reply in WhatsApp
    setTimeout(() => {
      let aiReply = "Thank you! I've noted that. Our specialist will confirm shortly.";
      if (originalText.toLowerCase().includes('price') || originalText.toLowerCase().includes('cost')) {
        aiReply = "Our starter facial treatments run from $90. You can book directly!";
      } else if (originalText.toLowerCase().includes('hour') || originalText.toLowerCase().includes('when')) {
        aiReply = "Our med spa is open Monday - Friday, 9:00 AM - 6:00 PM.";
      }
      setWaLines(prev => [...prev, aiReply]);
    }, 700);
  };

  return (
    <div className="space-y-24 pb-20 mt-16 font-sans overflow-hidden">
      
      {/* HERO HERO SECTION */}
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
          <div className="pt-3 flex items-center justify-center gap-4">
            <button
              onClick={() => onOpenPackageModal(CHATBOT_PACKAGES[0])}
              className="px-6 py-3.5 bg-gray-900 text-white font-sans text-xs font-bold rounded-2xl cursor-pointer"
            >
              Start My Chatbot
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('chatbot-pricing');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 font-sans text-xs font-semibold rounded-2xl animate-pulse"
            >
              View Chatbot Packages
            </button>
          </div>
        </div>
      </section>

      {/* WHY CHATBOTS MATTER */}
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
            <div className="bg-white border border-gray-100 p-6 rounded-3xl space-y-2 shadow-xs">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><Clock size={16} /></span>
              <h4 className="font-bold text-sm text-gray-900 pt-1">Faster Replies</h4>
              <p className="text-[11px] text-gray-400 leading-normal">Give customers helpful answers instantly without making them wait for a manual text.</p>
            </div>

            <div className="bg-white border border-gray-100 p-6 rounded-3xl space-y-2 shadow-xs">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><MessageSquare size={16} /></span>
              <h4 className="font-bold text-sm text-gray-900 pt-1">Better Lead Capture</h4>
              <p className="text-[11px] text-gray-400 leading-normal">Collect customer names, validated emails, phone numbers, and service interests in standard flows.</p>
            </div>

            <div className="bg-white border border-gray-100 p-6 rounded-3xl space-y-2 shadow-xs">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><Compass size={16} /></span>
              <h4 className="font-bold text-sm text-gray-900 pt-1">More Organized</h4>
              <p className="text-[11px] text-gray-400 leading-normal">Send collected contacts straight into Google Sheets or CRMs instead of losing records in message logs.</p>
            </div>

            <div className="bg-white border border-gray-100 p-6 rounded-3xl space-y-2 shadow-xs">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><Clock size={16} /></span>
              <h4 className="font-bold text-sm text-gray-900 pt-1">Active Beyond Hours</h4>
              <p className="text-[11px] text-gray-400 leading-normal font-medium">Keep capturing bookings at midnight. Direct prospects to make deposits while you sleep.</p>
            </div>
          </div>

        </div>
      </section>

      {/* DETAILED MOCKUP EMBEDS */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-600 font-bold bg-white border border-gray-100 px-3.5 py-1.5 rounded-full">
              INTERACTIVE CHAT SIMULATOR
            </span>
            <h3 className="text-2xl font-black text-gray-900">See smart chatbots in action</h3>
            <p className="text-xs text-gray-400">Select placement to test real automated interactive replies:</p>
          </div>

          {/* TAB HEADERS */}
          <div className="flex items-center justify-center gap-2 max-w-sm mx-auto bg-gray-100 p-1 rounded-full">
            <button
              onClick={() => setActiveTab('web')}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                activeTab === 'web' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              🌐 Pip Website Widget
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                activeTab === 'whatsapp' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              💬 WhatsApp Layout
            </button>
          </div>

          {/* SIMULATOR CONTAINER */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm max-w-md mx-auto h-[400px] flex flex-col overflow-hidden">
            {activeTab === 'web' ? (
              /* WEBSITE WIDGET SIMULATOR */
              <div className="h-full flex flex-col justify-between">
                <div className="px-5 py-4 bg-cyan-600 text-white flex items-center justify-between">
                  <span className="font-bold text-sm">Pip Website Assistant</span>
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-gray-50/50">
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none text-xs text-gray-800 leading-normal max-w-[85%]">
                    Hi! I can suggest facial treatments or auto fixes according to your goals. Select an option!
                  </div>
                  <div className="flex flex-col gap-1.5 max-w-[85%]">
                    <button
                      onClick={() => alert("Simulated: Start onboarding modal")}
                      className="px-3 py-2 bg-white border border-cyan-100 text-[11px] font-semibold text-cyan-700 rounded-xl text-left"
                    >
                      👉 Configure Landing Page Website
                    </button>
                    <button
                      onClick={() => alert("Simulated: Launch help template")}
                      className="px-3 py-2 bg-white border border-cyan-100 text-[11px] font-semibold text-cyan-700 rounded-xl text-left"
                    >
                      👉 View Frequently Asked Questions
                    </button>
                  </div>
                </div>
                
                <div className="p-3 border-t border-gray-100 bg-white text-center text-[10px] text-gray-400 uppercase font-mono tracking-widest leading-none">
                  ⚡ Pip AI Website Widget Mockup
                </div>
              </div>
            ) : (
              /* WHATSAPP STYLE MESSAGING */
              <div className="h-full flex flex-col justify-between">
                <div className="px-5 py-3 bg-emerald-600 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm">Aesthetic Clinic Bot</span>
                    <span className="text-[9px] bg-emerald-500 px-1.5 py-0.5 rounded text-white uppercase font-mono font-bold">Business</span>
                  </div>
                  <span className="text-[10px] text-emerald-100">online</span>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-3.5 bg-stone-100 select-none">
                  {waLines.map((line, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] p-3 rounded-xl text-xs leading-normal relative ${
                          i % 2 === 0 ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none'
                        }`}
                      >
                        <p>{line}</p>
                        <div className="text-[9px] text-gray-400 text-right mt-1.5 font-mono flex items-center justify-end gap-0.5">
                          11:42 AM {i % 2 === 0 && <CheckCheck size={11} className="text-blue-500" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handlePushWaText} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type to clinic bot (e.g., hours, prices)..."
                    value={waText}
                    onChange={(e) => setWaText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs"
                  />
                  <button type="submit" className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors">
                    <Send size={12} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CHATBOT PACKAGES DETAILED SECTION */}
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
                  💡 {pkg.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CHATBOT ONBOARDING PROCESS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50 py-16 rounded-3xl border border-gray-100">
        <div className="text-center space-y-3 mb-12">
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-400">TRAINING METRICS</span>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">How we program your high-conversion assistant</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 p-5">
            <span className="text-[10px] font-bold text-emerald-600 font-mono bg-emerald-50 px-2.5 py-1 rounded-full">Phase 01</span>
            <h4 className="font-bold text-sm text-gray-900 pt-1">We Learn Your Business</h4>
            <p className="text-[11px] text-gray-400 leading-normal">You share your services, pricing arrays, working hours, and common customer support questions.</p>
          </div>

          <div className="space-y-3 p-5">
            <span className="text-[10px] font-bold text-emerald-600 font-mono bg-emerald-50 px-2.5 py-1 rounded-full">Phase 02</span>
            <h4 className="font-bold text-sm text-gray-900 pt-1">Build Conversation Flows</h4>
            <p className="text-[11px] text-gray-400 leading-normal">We design custom conversation tunnels that collect customer contacts, screen services, and book appointments.</p>
          </div>

          <div className="space-y-3 p-5">
            <span className="text-[10px] font-bold text-emerald-600 font-mono bg-emerald-50 px-2.5 py-1 rounded-full">Phase 03</span>
            <h4 className="font-bold text-sm text-gray-900 pt-1">Connect Channels</h4>
            <p className="text-[11px] text-gray-400 leading-normal">Depending on package selections, we embed the chatbot securely into your website, WhatsApp numbers, or IG profiles.</p>
          </div>

          <div className="space-y-3 p-5">
            <span className="text-[10px] font-bold text-emerald-600 font-mono bg-emerald-50 px-2.5 py-1 rounded-full">Phase 04</span>
            <h4 className="font-bold text-sm text-gray-900 pt-1">Monitor & Improve</h4>
            <p className="text-[11px] text-gray-400 leading-normal font-medium">During active monthly subscriptions, error repairs and tone adjustments are fully managed as standard upkeep.</p>
          </div>
        </div>
      </section>

      {/* FINAL INTERPLAY */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <div className="border border-emerald-100 bg-white p-10 rounded-3xl shadow-xs space-y-4">
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
