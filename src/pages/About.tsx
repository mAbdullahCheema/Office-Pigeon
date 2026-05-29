/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Bird, Shield, Target, Award, Sparkles, Heart } from 'lucide-react';
import { PageId } from '../types';

interface AboutProps {
  onPageChange: (page: PageId) => void;
}

export default function About({ onPageChange }: AboutProps) {
  return (
    <div className="space-y-24 pb-20 mt-16 font-sans overflow-hidden">
      
      {/* HERO SECTION CONTAINER */}
      <section className="bg-gradient-to-b from-cyan-50/10 via-transparent to-transparent pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-600 font-bold bg-cyan-50 px-3.5 py-1.5 rounded-full">
            ABOUT OFFICE PIGEON
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight max-w-3xl mx-auto">
            Built to make business feel lighter
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            Office Pigeon was created from a simple idea: businesses should not lose time, leads, or credibility because their online systems are outdated or manual.
          </p>
        </div>
      </section>

      {/* HISTORIC ORIGIN STORY BLOCK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* Abstract clean visual representation of message bird */}
            <div className="w-64 h-64 bg-cyan-50 rounded-full flex items-center justify-center relative shadow-inner">
              <div className="absolute inset-4 border border-cyan-100 border-dashed rounded-full animate-spin [animation-duration:12s]" />
              <Bird size={64} className="text-cyan-600 stroke-[1.8]" />
              <div className="absolute top-4 right-10 w-4 h-4 bg-emerald-400 rounded-full animate-bounce" />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5">
            <span className="text-[9px] font-mono tracking-widest uppercase text-cyan-600 font-bold">OUR HERITAGE INSIDGHT</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              From old-school messengers to modern business systems
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              For centuries, pigeons helped people send important messages faster and easier. Office Pigeon brings that same idea into the modern business world.
            </p>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Instead of carrying letters, Office Pigeon helps carry leads, replies, bookings, follow-ups, and repetitive tasks through smarter digital systems.
            </p>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-semibold text-cyan-700">
              The goal is simple: help businesses save time, look professional, and run with less manual stress.
            </p>
          </div>

        </div>
      </section>

      {/* PHILOSOPHY & BELIEFS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50 py-16 rounded-3xl border border-gray-100">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-400">GUIDING PRINCIPLES</span>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 font-sans">
            Practical systems formulated for real results
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed max-w-lg mx-auto mt-2">
            We focus on tools that business owners can actually use. That means websites that build trust, chatbots that answer customers, and automations that remove repetitive work. We do not build AI for show.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1 md:p-6 text-left">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-2">
            <span className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center"><Sparkles size={16} /></span>
            <h4 className="font-bold text-sm text-gray-950">Technology should feel simple</h4>
            <p className="text-xs text-gray-400 leading-relaxed">Business owners should not need to understand servers, API databases, or code scripts to capture leads and grow.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-2">
            <span className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center"><Target size={16} /></span>
            <h4 className="font-bold text-sm text-gray-950">Design builds absolute trust</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">A beautiful online presence makes your business look professional, reliable, and ready to serve.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-2">
            <span className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center"><Award size={16} /></span>
            <h4 className="font-bold text-sm text-gray-950">AI should save actual hours</h4>
            <p className="text-xs text-gray-400 leading-relaxed">The best systems handle automatic spreadsheets logging and SMS grids, giving your crew hours back.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-2">
            <span className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center"><Heart size={16} /></span>
            <h4 className="font-bold text-sm text-gray-950">Clear communication matters</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">No hidden fees, no opaque contracts, and no complicated terms. We describe everything in standard English first.</p>
          </div>

        </div>
      </section>

      {/* ABOUT BOTTOM SECTION CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <div className="border border-cyan-100 bg-white p-10 rounded-3xl shadow-xs space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">Ready to see our systems in action?</h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
            Let's discuss how customized web templates or chatbots can help save hours for your crew.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onPageChange('contact')}
              className="px-6 py-3.5 bg-gray-900 text-white font-sans text-xs font-bold rounded-2xl shadow-md cursor-pointer hover:bg-gray-800 transition-colors"
            >
              Contact Our Representative
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
