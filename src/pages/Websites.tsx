/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Smartphone, Check, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { WEBSITE_PACKAGES } from '../config';
import { Package } from '../types';

interface WebsitesProps {
  onOpenPackageModal: (pkg: Package) => void;
}

export default function Websites({ onOpenPackageModal }: WebsitesProps) {
  return (
    <div className="space-y-24 pb-20 mt-16 font-sans overflow-hidden">
      
      {/* HERO HERO SECTION */}
      <section className="bg-gradient-to-b from-cyan-50/10 via-transparent to-transparent pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-600 font-bold bg-cyan-50 px-3.5 py-1.5 rounded-full">
            BEAUTIFUL WEB DEVELOPMENT
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight max-w-3xl mx-auto">
            Turn your online presence into a business advantage
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            Your website is often the first place customers check before they contact you. Office Pigeon builds clean, modern, mobile-friendly websites that make your business look credible, professional, and easy to reach.
          </p>
          <div className="pt-3 flex items-center justify-center gap-4">
            <button
              onClick={() => onOpenPackageModal(WEBSITE_PACKAGES[0])}
              className="px-6 py-3.5 bg-gray-900 text-white font-sans text-xs font-bold rounded-2xl cursor-pointer"
            >
              Start My Website
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('website-pricing');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 font-sans text-xs font-semibold rounded-2xl"
            >
              View Website Packages
            </button>
          </div>
        </div>
      </section>

      {/* WHY CREDIBILITY MATTERS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-5">
            <span className="text-[9px] font-mono tracking-widest uppercase text-cyan-600 font-bold">THE CREDIBILITY REVOLUTION</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              Customers judge your business before they ever speak to you
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              When someone finds your business online, they quickly look for signs of trust. A missing, outdated, or confusing website can make a great business look less serious than it really is.
            </p>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Office Pigeon helps you fix that with a website that clearly shows who you are, what you offer, how customers can contact you, and why they should trust you.
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 p-6 rounded-3xl space-y-2">
              <span className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center"><Globe size={16} /></span>
              <h4 className="font-bold text-sm text-gray-900 pt-1">Build Online Credibility</h4>
              <p className="text-[11px] text-gray-400 leading-normal">Give customers a professional place to learn about your business before they call, message, or visit.</p>
            </div>
            
            <div className="bg-white border border-gray-100 p-6 rounded-3xl space-y-2">
              <span className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center"><Smartphone size={16} /></span>
              <h4 className="font-bold text-sm text-gray-900 pt-1">Make Contact Easy</h4>
              <p className="text-[11px] text-gray-400 leading-normal">Add clear buttons for calls, WhatsApp channels, maps routing, and automated calendar holds.</p>
            </div>

            <div className="bg-white border border-gray-100 p-6 rounded-3xl space-y-2">
              <span className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center"><Smartphone size={16} /></span>
              <h4 className="font-bold text-sm text-gray-900 pt-1">Modern Look on Mobiles</h4>
              <p className="text-[11px] text-gray-400 leading-normal">Your website should look fully smooth and professional on phones, tablets, laptops, and ultra-wide displays.</p>
            </div>

            <div className="bg-white border border-gray-100 p-6 rounded-3xl space-y-2">
              <span className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center"><ShieldCheck size={16} /></span>
              <h4 className="font-bold text-sm text-gray-900 pt-1">Turn Visitors Into Leads</h4>
              <p className="text-[11px] text-gray-400 leading-normal">Guide users toward taking targeted actions immediately rather than leaving your landing page confused.</p>
            </div>
          </div>

        </div>
      </section>

      {/* DETAILED PACKAGES GRIED SECTION */}
      <section id="website-pricing" className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-600 font-bold">WEBSITE PACKAGES</span>
            <h2 className="text-3xl font-black text-gray-900">Choose the best structure for your scaling goals</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WEBSITE_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white border rounded-3xl p-7 flex flex-col justify-between relative shadow-xs transition-transform hover:translate-y-[-4px] ${
                  pkg.badge ? 'border-cyan-200 ring-4 ring-cyan-50/50' : 'border-gray-100'
                }`}
              >
                {pkg.badge && (
                  <span className="absolute top-0 right-6 -translate-y-1/2 bg-cyan-600 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                    {pkg.badge}
                  </span>
                )}
                <div>
                  <h4 className="font-bold text-lg text-gray-900">{pkg.name}</h4>
                  <p className="text-[10px] text-cyan-600 uppercase tracking-widest font-mono font-bold mt-1">Timeline: {pkg.timeline}</p>
                  
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-black text-gray-900">{pkg.price}</span>
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

                  {pkg.note && (
                    <p className="text-[10px] text-gray-400 mt-4 italic leading-normal border-t border-gray-50 pt-3">
                      💡 {pkg.note}
                    </p>
                  )}
                </div>

                <div className="mt-8 space-y-2">
                  <button
                    onClick={() => onOpenPackageModal(pkg)}
                    className={`w-full py-4 text-xs font-bold rounded-2xl text-center cursor-pointer transition-all ${
                      pkg.badge ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-100 hover:bg-cyan-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    Start {pkg.name} Setup
                  </button>
                  <p className="text-[9px] text-gray-400 text-center uppercase tracking-widest font-mono">Revision: {pkg.revision}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WEBSITE TIMELINE STEPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-400">OUR WEB MILESTONES</span>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">How we launch your professional digital home</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="p-6 bg-white border border-gray-100 rounded-3xl space-y-3 relative">
            <span className="absolute top-4 right-5 text-4xl font-black text-gray-50">01</span>
            <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center font-bold text-sm">SP</div>
            <h4 className="font-bold text-sm text-gray-950 pt-2">Share Your Business</h4>
            <p className="text-[11px] text-gray-400 leading-normal">Tell us what your business does, what services or products you offer, and what you want your website to help with.</p>
          </div>

          <div className="p-6 bg-white border border-gray-100 rounded-3xl space-y-3 relative">
            <span className="absolute top-4 right-5 text-4xl font-black text-gray-50">02</span>
            <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center font-bold text-sm">LO</div>
            <h4 className="font-bold text-sm text-gray-950 pt-2">We Plan Key Layouts</h4>
            <p className="text-[11px] text-gray-400 leading-normal font-medium">We design and organize your content layers into a clean hierarchy that makes complete sense for customers.</p>
          </div>

          <div className="p-6 bg-white border border-gray-100 rounded-3xl space-y-3 relative">
            <span className="absolute top-4 right-5 text-4xl font-black text-gray-50">03</span>
            <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center font-bold text-sm">DV</div>
            <h4 className="font-bold text-sm text-gray-950 pt-2">We Build & Show You</h4>
            <p className="text-[11px] text-gray-400 leading-normal">You review the fully operational development sandbox layout before final transfer so everything is clear.</p>
          </div>

          <div className="p-6 bg-white border border-gray-100 rounded-3xl space-y-3 relative">
            <span className="absolute top-4 right-5 text-4xl font-black text-gray-50">04</span>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-sm">LV</div>
            <h4 className="font-bold text-sm text-gray-950 pt-2">Live Integration Deployment</h4>
            <p className="text-[11px] text-gray-400 leading-normal font-medium">Once final payment is complete, your website is made live and ready to welcome paying customer pipelines.</p>
          </div>
        </div>
      </section>

      {/* FINAL INTERPLAY */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <div className="border border-cyan-100 bg-white p-10 rounded-3xl shadow-xs space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">Ready to give your business a better online presence?</h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
            Start with a clean landing page or plan a complete business website built around your goals.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onOpenPackageModal(WEBSITE_PACKAGES[0])}
              className="px-6 py-3.5 bg-gray-900 text-white font-sans text-xs font-bold rounded-2xl shadow-md cursor-pointer inline-flex items-center gap-1.5 hover:bg-gray-800"
            >
              Start My Landing Page Now
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
