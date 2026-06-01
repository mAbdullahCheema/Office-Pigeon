/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, HelpCircle, Check, Play, UserCheck, Smartphone, Settings, Zap, ArrowUpRight, MessageSquare, Flame, Sparkles, Volume2 } from 'lucide-react';
import { PageId, Package } from '../types';
import { BRAND, WEBSITE_PACKAGES, CHATBOT_PACKAGES, CALLING_AGENT_PACKAGES, AUTOMATION_EXAMPLES } from '../config';
import ThreeHub from '../components/ThreeHub';

function TypewriterWord() {
  const word = "TRUST YOU";
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: any;

    const handleType = () => {
      if (!isDeleting) {
        if (displayedText.length < word.length) {
          setDisplayedText(word.substring(0, displayedText.length + 1));
          timer = setTimeout(handleType, 150);
        } else {
          timer = setTimeout(() => {
            setIsDeleting(true);
          }, 2000);
        }
      } else {
        if (displayedText.length > 0) {
          setDisplayedText(word.substring(0, displayedText.length - 1));
          timer = setTimeout(handleType, 80);
        } else {
          setIsDeleting(false);
          timer = setTimeout(handleType, 500);
        }
      }
    };

    timer = setTimeout(handleType, isDeleting ? 80 : 150);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting]);

  return (
    <span className="relative inline-block whitespace-nowrap">
      {/* Static size reservation layout block */}
      <span className="invisible select-none pointer-events-none font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500">
        {word}
      </span>
      {/* Absolute interactive layer for text updates */}
      <span className="absolute inset-y-0 left-0 flex items-center">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 font-black">
          {displayedText}
        </span>
      </span>
    </span>
  );
}

interface HomeProps {
  onPageChange: (page: PageId) => void;
  onOpenPackageModal: (pkg: Package) => void;
  onOpenConsultationModal: () => void;
}

export default function Home({ onPageChange, onOpenPackageModal, onOpenConsultationModal }: HomeProps) {
  
  // Transition fade configurations
  const variantMap = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } }
  };

  return (
    <div className="space-y-28 pb-20 mt-16 font-sans select-none overflow-hidden relative">
      
      {/* Background Text Layer Stamp behind core elements */}
      <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none z-0 opacity-40">
        <h1 className="text-[120px] sm:text-[180px] lg:text-[230px] leading-[0.8] font-black tracking-tighter text-[#EFECE7] uppercase">
          AUTOMATE
        </h1>
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20 pb-12 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative">
          
          {/* LEFT CONTENT BLOCK */}
          <div className="lg:col-span-7 space-y-7 z-20 relative">
            <div className="inline-flex items-center gap-2.5 bg-orange-500/10 border border-orange-500/25 px-5 py-3 rounded-full text-xs sm:text-sm font-sans font-black uppercase tracking-wider text-orange-600 shadow-sm shadow-orange-500/5 hover:scale-[1.01] transition-transform duration-300">
              <Sparkles size={14} className="text-orange-500 animate-pulse stroke-[2.5]" />
              AI-POWERED WEBSITES, CHATBOTS, CALLING AGENTS & WORKFLOWS
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[68px] font-black text-gray-900 leading-[1.05] tracking-tighter uppercase mb-4">
              HELP MORE CUSTOMERS FIND YOU, <TypewriterWord />, AND CONTACT YOU
            </h1>
            
            <p className="text-sm sm:text-base text-gray-500 max-w-xl leading-relaxed font-sans font-medium">
              We build premium websites, smart chatbots, AI Calling Agents, and connected workflows that make your business look professional, respond faster, and turn more visitors or callers into real leads without you handling the tech.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-3">
              <button
                onClick={onOpenConsultationModal}
                className="w-full sm:w-auto px-8 py-4.5 bg-black hover:bg-orange-500 text-white text-xs font-mono font-bold uppercase tracking-widest rounded-full transition-all hover:scale-103 shadow-lg shadow-black/10 flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none"
              >
                GET FREE AI CONSULTATION
                <ArrowRight size={13} className="stroke-[2.5]" />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('services-overview');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4.5 bg-[#FAF9F6] hover:bg-[#F0EEEA] text-gray-900 text-xs font-mono font-bold uppercase tracking-widest rounded-full border border-black/10 transition-all text-center cursor-pointer focus:outline-none"
              >
                SEE HOW IT WORKS
              </button>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-gray-400 font-mono tracking-wider uppercase scale-95 origin-left">
              <span className="flex items-center gap-1.5 text-orange-500 font-bold">
                ✓ Fully managed setup
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>No tech confusion</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="text-gray-500 font-bold">Built to help you win more customers</span>
            </div>
          </div>

          {/* RIGHT 3D MODEL VIEWPORT */}
          <div className="lg:col-span-5 relative w-full flex items-center justify-center lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:-right-[8%] xl:-right-[14%] lg:w-[48vw] lg:h-[700px] lg:max-w-[900px] z-10 pointer-events-none">
            <div className="w-full h-full pointer-events-auto flex items-center justify-center">
              <ThreeHub />
            </div>
          </div>

        </div>
      </section>

      {/* 2. PROBLEM SECTION */}
      <section className="bg-gradient-to-b from-transparent via-orange-50/5 to-transparent py-4 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-4">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-orange-600 font-bold bg-[#F0EEEA] border border-black/5 rounded-full px-4 py-1.5 inline-block">
              THE STATUS QUO BARRIER
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-[1.0]">
              Your business should not run on manual chaos
            </h2>
            <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
              Missed messages, slow replies, outdated websites, scattered leads, and repeated manual tasks can quietly hold a business back. Office Pigeon helps turn those messy daily processes into smarter digital systems.
            </p>
          </div>

          {/* PROBLEM BENTO GRID cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14 text-left">
            <div className="bg-white/85 p-8 border border-black/5 rounded-[32px] shadow-[0_40px_80px_rgba(0,0,0,0.03)] space-y-5 hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-mono font-bold text-sm shadow-md">
                01
              </div>
              <h4 className="font-serif italic text-2xl text-gray-900">Weak Online Presence</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Customers often check your business online before they contact you. A missing or outdated website can make your business look less serious than it really is.
              </p>
            </div>

            <div className="bg-white/85 p-8 border border-black/5 rounded-[32px] shadow-[0_40px_80px_rgba(0,0,0,0.03)] space-y-5 hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-mono font-bold text-sm shadow-md">
                02
              </div>
              <h4 className="font-serif italic text-2xl text-gray-900">Slow Customer Replies</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                When customers ask questions and wait too long, many simply move on. Smart chatbots help your business respond faster, even outside working hours.
              </p>
            </div>

            <div className="bg-white/85 p-8 border border-black/5 rounded-[32px] shadow-[0_40px_80px_rgba(0,0,0,0.03)] space-y-5 hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-mono font-bold text-sm shadow-md">
                03
              </div>
              <h4 className="font-serif italic text-2xl text-gray-900">Repetitive Manual Work</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Copying leads, sending reminders, updating sheets, and following up manually wastes hours. Automations help those tasks happen in the background.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICES OVERVIEW */}
      <section id="services-overview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-orange-600 font-bold bg-[#F0EEEA] px-4 py-1.5 border border-black/5 rounded-full inline-block">
            OUR CAPABILITIES
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase text-gray-900 leading-[1.0]">
            Four ways Office Pigeon helps your business grow smarter
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 font-medium font-sans">
            Start with a beautiful website, add smart chat or calling agents, then automate the repetitive work behind the scenes.
          </p>
        </div>

        {/* INTERACTIVE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* SERVICE CLIENT 1 */}
          <div className="bg-white border border-black/5 p-8 rounded-[40px] shadow-[0_45px_90px_rgba(0,0,0,0.035)] hover:-rotate-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center shadow-xs">
                <Smartphone size={20} />
              </div>
              <h3 className="font-serif italic text-3xl text-gray-900 leading-tight">Beautiful Web Development</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-sans">
                Build online credibility with a clean, modern, mobile-friendly website that makes your business look professional and easy to contact.
              </p>
            </div>
            <button
              onClick={() => onPageChange('websites')}
              className="mt-8 text-xs font-mono font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5 bg-orange-50 hover:bg-orange-500 hover:text-white w-full justify-center py-4 rounded-full transition-all cursor-pointer"
            >
              Explore Websites <ArrowRight size={13} />
            </button>
          </div>

          {/* SERVICE CLIENT 2 */}
          <div className="bg-white border border-black/5 p-8 rounded-[40px] shadow-[0_45px_90px_rgba(0,0,0,0.035)] hover:rotate-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shadow-xs">
                <MessageSquare size={20} />
              </div>
              <h3 className="font-serif italic text-3xl text-gray-900 leading-tight">Smart Chatbots</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-sans">
                Let customers get answers, share details, and book appointments through a smart assistant trained on your business information.
              </p>
            </div>
            <button
              onClick={() => onPageChange('chatbots')}
              className="mt-8 text-xs font-mono font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5 bg-rose-50 hover:bg-rose-500 hover:text-white w-full justify-center py-4 rounded-full transition-all cursor-pointer"
            >
              Explore Chatbots <ArrowRight size={13} />
            </button>
          </div>

          {/* SERVICE CLIENT 3 */}
          <div className="bg-white border border-black/5 p-8 rounded-[40px] shadow-[0_45px_90px_rgba(0,0,0,0.035)] hover:-rotate-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-xs">
                <Settings size={20} />
              </div>
              <h3 className="font-serif italic text-3xl text-gray-900 leading-tight">Workflow Automations</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-sans">
                Connect your tools so leads, reminders, updates, and follow-ups move automatically without constant manual effort.
              </p>
            </div>
            <button
              onClick={() => onPageChange('automations')}
              className="mt-8 text-xs font-mono font-bold uppercase tracking-wider text-amber-600  flex items-center gap-1.5 bg-amber-50 hover:bg-amber-500 hover:text-white w-full justify-center py-4 rounded-full transition-all cursor-pointer"
            >
              Explore Automations <ArrowRight size={13} />
            </button>
          </div>

          {/* SERVICE CLIENT 4 */}
          <div className="bg-white border border-black/5 p-8 rounded-[40px] shadow-[0_45px_90px_rgba(0,0,0,0.035)] hover:rotate-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center shadow-xs">
                <Volume2 size={20} />
              </div>
              <h3 className="font-serif italic text-3xl text-gray-900 leading-tight">AI Calling Agents</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-sans">
                Answer calls, capture lead details, support booking requests, and follow up through managed AI phone and WhatsApp workflows.
              </p>
            </div>
            <button
              onClick={() => onPageChange('calling-agents')}
              className="mt-8 text-xs font-mono font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5 bg-orange-50 hover:bg-orange-500 hover:text-white w-full justify-center py-4 rounded-full transition-all cursor-pointer"
            >
              Explore Calling Agents <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* 4. WEBSITE PACKAGES */}
      <section className="bg-[#F0EEEA]/40 border-y border-black/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-orange-600 font-bold bg-white border border-black/10 px-4 py-1.5 rounded-full inline-block">
              WEBSITES & LANDING PAGES
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase text-gray-900 leading-[1.0]">
              Beautiful websites built to make your business look serious
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 font-medium font-sans">
              Whether you need a simple landing page or a more powerful business system, Office Pigeon gives your business a clean digital home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WEBSITE_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white border p-8 rounded-[40px] shadow-[0_45px_90px_rgba(0,0,0,0.03)] flex flex-col justify-between relative transition-all duration-300 hover:scale-102 hover:shadow-lg ${
                  pkg.badge ? 'border-orange-500 ring-4 ring-orange-100/30' : 'border-black/5'
                }`}
              >
                {pkg.badge && (
                  <span className="absolute top-0 right-7 -translate-y-1/2 bg-orange-500 text-white text-[9px] font-mono font-bold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md">
                    {pkg.badge}
                  </span>
                )}
                <div>
                  <h4 className="font-serif italic text-3xl text-gray-900 leading-tight mb-2">{pkg.name}</h4>
                  <div className="mt-4 mb-2 flex items-baseline">
                    <span className="text-5xl font-black italic tracking-tighter text-gray-900">{pkg.price}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 font-semibold font-sans leading-relaxed">{pkg.bestFor}</p>
                  
                  <div className="h-px bg-black/5 my-6" />
                  
                  <ul className="space-y-3.5">
                    {pkg.includes.slice(0, 5).map((inc, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-gray-500 leading-normal font-sans">
                        <Check size={14} className="text-orange-500 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 space-y-2.5">
                  <button
                    onClick={() => onOpenPackageModal(pkg)}
                    className={`w-full py-4 text-xs font-mono font-bold uppercase tracking-wider rounded-full text-center transition-all cursor-pointer focus:outline-none ${
                      pkg.badge
                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-100'
                        : 'bg-[#F0EEEA] hover:bg-black/5 text-gray-800'
                    }`}
                  >
                    Select {pkg.name}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center font-mono uppercase tracking-wider">Timeline: {pkg.timeline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SMART CHATBOTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-rose-500 font-bold bg-rose-50 px-4 py-1.5 border border-black/5 rounded-full inline-block">
            SMART ASSISTANTS
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase text-gray-900 leading-[1.0]">
            Let your business reply faster, capture leads & stay available longer
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 font-medium font-sans">
            Smart chatbots help customers get answers, share details, and take action without waiting for manual replies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CHATBOT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white border p-8 rounded-[40px] shadow-[0_45px_90px_rgba(0,0,0,0.03)] flex flex-col justify-between relative transition-all duration-300 hover:scale-102 hover:shadow-lg ${
                pkg.badge ? 'border-rose-500 ring-4 ring-rose-100/30' : 'border-black/5'
              }`}
            >
              {pkg.badge && (
                <span className="absolute top-0 right-7 -translate-y-1/2 bg-rose-500 text-white text-[9px] font-mono font-bold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md">
                  {pkg.badge}
                </span>
              )}
              <div>
                <h4 className="font-serif italic text-3xl text-gray-900 leading-tight mb-2">{pkg.name}</h4>
                <div className="mt-4 mb-2 flex items-baseline">
                  <span className="text-5xl font-black italic tracking-tighter text-gray-900">{pkg.price.split(' ')[0]}</span>
                  <span className="text-xs text-gray-400 font-mono uppercase tracking-wider ml-1">
                    {pkg.price.includes('setup') ? pkg.price.substring(pkg.price.indexOf('setup')) : ''}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-2 font-semibold font-sans leading-relaxed">{pkg.bestFor}</p>

                <div className="h-px bg-black/5 my-6" />

                <ul className="space-y-3.5">
                  {pkg.includes.slice(0, 5).map((inc, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-gray-500 leading-normal font-sans">
                      <Check size={14} className="text-rose-500 shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 space-y-2.5">
                <button
                  onClick={() => onOpenPackageModal(pkg)}
                  className={`w-full py-4 text-xs font-mono font-bold uppercase tracking-wider rounded-full text-center transition-all cursor-pointer focus:outline-none ${
                    pkg.badge
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-100'
                      : 'bg-[#F0EEEA] hover:bg-black/5 text-gray-800'
                  }`}
                >
                  Configure {pkg.name}
                </button>
                <p className="text-[10px] text-gray-400 text-center font-mono uppercase tracking-wider italic">{pkg.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* 6. WORKFLOW AUTOMATION SUBSECTION */}
      <section className="bg-[#F0EEEA]/30 border-y border-black/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-amber-600 font-bold bg-amber-50 px-4 py-1.5 border border-amber-100 rounded-full inline-block">
                CONNECTED WORKFLOWS
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-[1.0]">
                Stop repeating the same tasks every day
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-sans font-medium">
                Connect your tools so leads, reminders, updates, and follow-ups move automatically in the background. Fully managed by Office Pigeon, so you do not have to deal with the technical side.
              </p>
              <div className="bg-amber-50/50 border border-amber-100/50 p-6 rounded-[24px]">
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800">Affordable Starting Point</p>
                <p className="text-[11px] text-amber-700 mt-1.5 font-sans leading-relaxed">Starting from $100 setup + convenient monthly active monitoring options.</p>
              </div>
              <button
                onClick={() => {
                  const payload: Package = {
                    id: 'automation-audit',
                    name: 'Workflow Automation Audit',
                    price: 'Custom Audit',
                    timeline: '2-4 working days',
                    revision: '1 revision included',
                    bestFor: 'Evaluate existing operational friction points.',
                    includes: ['Review maps, spreadsheets, email triggers']
                  };
                  onOpenPackageModal(payload);
                }}
                className="px-8 py-4.5 bg-black hover:bg-orange-500 text-white rounded-full font-sans text-xs font-black uppercase tracking-widest shadow-lg shadow-black/5 transition-all cursor-pointer block text-center focus:outline-none"
              >
                Book a Free Workflow Audit
              </button>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {AUTOMATION_EXAMPLES.slice(0, 4).map((item, idx) => (
                <div key={idx} className="bg-white p-6 border border-black/5 rounded-[24px] shadow-xs space-y-3 hover:translate-y-[-2px] transition-transform">
                  <span className="text-[9px] font-bold text-amber-600 font-mono bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider">{`Flow 0${idx + 1}`}</span>
                  <h4 className="font-serif italic text-xl text-gray-900 pt-1 leading-tight">{item.title}</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-sans font-medium">{item.description}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 7. AI CALLING AGENTS LIVE SERVICE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center select-none relative">
        <div className="relative border border-amber-200 bg-[#FAF9F6] p-8 sm:p-10 rounded-[40px] shadow-lg shadow-amber-500/5 space-y-8">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-mono tracking-widest uppercase text-amber-600 bg-amber-50 border border-amber-100 px-4 py-1.5 rounded-full font-bold">
            <Volume2 size={11} /> AI Calling Agents
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif italic text-gray-900 leading-tight">Answer calls, capture leads, and book customers automatically</h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed font-sans font-medium">
            Office Pigeon builds AI phone and WhatsApp agents that answer customer questions, collect lead details, handle booking requests, send follow-ups, and notify your team under clear monthly usage limits.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                onOpenPackageModal(CALLING_AGENT_PACKAGES[1]);
              }}
              className="px-8 py-4 bg-orange-500 text-white font-mono text-[10px] uppercase font-bold tracking-widest rounded-full hover:bg-orange-600 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-lg shadow-orange-100 focus:outline-none"
            >
              Configure Calling Agent <ArrowRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-4">
            {CALLING_AGENT_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white border p-6 rounded-[28px] shadow-xs flex flex-col justify-between relative transition-all hover:translate-y-[-3px] ${
                  pkg.badge ? 'border-orange-200 ring-4 ring-orange-50/50' : 'border-black/5'
                }`}
              >
                {pkg.badge && (
                  <span className="absolute top-0 right-5 -translate-y-1/2 bg-orange-600 text-white text-[8px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    {pkg.badge}
                  </span>
                )}
                <div>
                  <h4 className="font-serif italic text-2xl text-gray-900 leading-tight">{pkg.name}</h4>
                  <p className="mt-3 text-xl font-black text-gray-900">{pkg.price}</p>
                  <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">{pkg.bestFor}</p>
                  <ul className="mt-5 space-y-2.5">
                    {pkg.includes.slice(-2).map((inc) => (
                      <li key={inc} className="flex items-start gap-2 text-[11px] text-gray-500">
                        <Check size={13} className="text-orange-500 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => onOpenPackageModal(pkg)}
                  className={`mt-6 w-full py-3.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                    pkg.badge ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-[#F0EEEA] hover:bg-black/5 text-gray-800'
                  }`}
                >
                  Configure {pkg.name}
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => onPageChange('calling-agents')}
            className="px-8 py-4 bg-black hover:bg-orange-500 text-white font-mono text-[10px] uppercase font-bold tracking-widest rounded-full transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-lg shadow-black/10 focus:outline-none"
          >
            Explore AI Calling Agents <ArrowRight size={13} />
          </button>
        </div>
      </section>

      {/* 8. SITEMAP TIMELINE STEPS */}
      <section className="bg-[#FAF9F6] py-20 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-orange-600 bg-[#F0EEEA] px-4 py-1.5 border border-black/5 rounded-full inline-block font-bold">STEPS TO AUTOMATION</span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase text-gray-900 leading-[1.0]">A simple process from idea to working system</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-0.5 border-t border-dashed border-black/10 z-0" />
            
            <div className="space-y-4 relative z-10 text-center md:text-left">
              <div className="mx-auto md:mx-0 w-11 h-11 bg-black text-white rounded-full flex items-center justify-center font-mono font-bold text-sm shadow-md">
                1
              </div>
              <h4 className="font-serif italic text-xl text-gray-900 leading-tight">Tell Us What You Need</h4>
              <p className="text-[11px] text-gray-400 leading-normal font-sans font-medium">
                Share your business, your current problems, and what you want to improve.
              </p>
            </div>

            <div className="space-y-4 relative z-10 text-center md:text-left">
              <div className="mx-auto md:mx-0 w-11 h-11 bg-black text-white rounded-full flex items-center justify-center font-mono font-bold text-sm shadow-md">
                2
              </div>
              <h4 className="font-serif italic text-xl text-gray-900 leading-tight">We Plan the Solution</h4>
              <p className="text-[11px] text-gray-400 leading-normal font-sans font-medium">
                We recommend the right website, chatbot, calling agent, automation, or combination based on your goals.
              </p>
            </div>

            <div className="space-y-4 relative z-10 text-center md:text-left">
              <div className="mx-auto md:mx-0 w-11 h-11 bg-black text-white rounded-full flex items-center justify-center font-mono font-bold text-sm shadow-md">
                3
              </div>
              <h4 className="font-serif italic text-xl text-gray-900 leading-tight">We Build & Show You</h4>
              <p className="text-[11px] text-gray-400 leading-normal font-sans font-medium">
                You see the working system before final delivery, so everything is clear.
              </p>
            </div>

            <div className="space-y-4 relative z-10 text-center md:text-left">
              <div className="mx-auto md:mx-0 w-11 h-11 bg-black text-white rounded-full flex items-center justify-center font-mono font-bold text-sm shadow-md">
                4
              </div>
              <h4 className="font-serif italic text-xl text-gray-900 leading-tight">Your Business Runs</h4>
              <p className="text-[11px] text-gray-400 leading-normal font-sans font-medium">
                Your new website, chatbot, calling agent, or automation starts helping your business save time and opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. TRUST BENTO WHY OFFICE PIGEON */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-orange-600 bg-[#F0EEEA] px-4 py-1.5 border border-black/5 rounded-full inline-block font-bold">CREDENTIAL FACTORS</span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase text-gray-900 leading-[1.0]">Built for owners who want returns without complications</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-3 bg-white p-8 border border-black/5 rounded-[36px] shadow-[0_40px_80px_rgba(0,0,0,0.02)] space-y-4">
            <span className="text-[9px] font-mono font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wider">Simple Language</span>
            <h4 className="font-serif italic text-2xl text-gray-900 pt-1 leading-none">We explain everything simply first</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-sans font-medium">
              We translate systems configurations into human-friendly outcomes. No technical acronym soup or LLMs jargon larping—just honest growth updates.
            </p>
          </div>

          <div className="md:col-span-2 bg-white p-8 border border-black/5 rounded-[36px] shadow-[0_40px_80px_rgba(0,0,0,0.02)] space-y-4">
            <span className="text-[9px] font-mono font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-wider font-bold">Practical Setup</span>
            <h4 className="font-serif italic text-2xl text-gray-900 pt-1 leading-none">Real operational answers</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-sans font-medium">
              We train bots and connect triggers that directly address missed bookings and phone rings.
            </p>
          </div>

          <div className="md:col-span-2 bg-white p-8 border border-black/5 rounded-[36px] shadow-[0_40px_80px_rgba(0,0,0,0.02)] space-y-4">
            <span className="text-[9px] font-mono font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider font-bold">Managed Systems</span>
            <h4 className="font-serif italic text-2xl text-gray-900 pt-1 leading-none">100% Fully Managed Care</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-sans font-medium">
              Our active monitored program handles all hosting revisions and troubleshooting, meaning you never touch an API.
            </p>
          </div>

          <div className="md:col-span-3 bg-white p-8 border border-black/5 rounded-[36px] shadow-[0_40px_80px_rgba(0,0,0,0.02)] space-y-4">
            <span className="text-[9px] font-mono font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wider font-bold">Communication</span>
            <h4 className="font-serif italic text-2xl text-gray-900 pt-1 leading-none">Accelerated Support Delivery</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-sans font-medium">
              We align setups over fast email channels, Cal.co integrations, or direct interactive WhatsApp messages to prioritize speed.
            </p>
          </div>
        </div>
      </section>

      {/* 10. FINAL ACTION PANEL */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <div className="bg-black rounded-[40px] p-12 sm:p-16 text-white hover:shadow-2xl transition-all relative overflow-hidden flex flex-col items-center border border-black/10">
          <div className="absolute top-[-30px] right-[-30px] w-64 h-64 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-[-30px] left-[-30px] w-64 h-64 bg-rose-500/5 blur-3xl rounded-full pointer-events-none" />
          
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full leading-none text-orange-400">
            CONVERSION PORTAL OPEN
          </span>
          <h2 className="text-4xl sm:text-6xl font-black mt-6 max-w-2xl leading-none uppercase tracking-tighter">
            Ready to make your business smarter?
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-4 max-w-lg leading-relaxed font-medium">
            Book a free coordinator consultation or test custom FAQ bots. Learn how automations reclaim lost booking slots.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <button
              onClick={onOpenConsultationModal}
              className="w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-xs font-mono font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer text-center"
            >
              Get Free AI Consultation
            </button>
            <a
              href={`${BRAND.whatsappUrl}?text=Hi%20Office%20Pigeon%2C%20I%20want%20to%20message%20your%20representatives%20directly!`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-100 text-black text-xs font-mono font-bold uppercase tracking-widest rounded-full transition-all text-center flex items-center justify-center gap-2 shadow-md"
            >
              <MessageSquare size={13} className="text-rose-500" />
              Message on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
