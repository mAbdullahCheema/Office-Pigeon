/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Mail, Phone, Clock, MessageCircle, Bird, Shield, Linkedin } from 'lucide-react';
import { PageId } from '../types';
import { BRAND } from '../config';

interface FooterProps {
  onPageChange: (page: PageId) => void;
}

export default function Footer({ onPageChange }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleNavClick = (page: PageId) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#FAF9F6] border-t border-black/5 pt-16 pb-12 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* COLUMN 1: BRAND INFORMATION */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 text-left focus:outline-none cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/10 group-hover:scale-105 transition-transform group-hover:rotate-12 duration-500">
                <Bird size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="font-sans text-xl font-black tracking-tighter italic uppercase text-gray-900 group-hover:text-orange-500 transition-colors block">
                  Office Pigeon
                </span>
                <span className="block text-[10px] md:text-[11px] font-mono tracking-[0.12em] uppercase text-orange-500 font-bold leading-none mt-1.5 whitespace-nowrap">
                  We Automate Your Success
                </span>
              </div>
            </button>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed mt-3 font-medium">
              Serving businesses worldwide with AI-powered websites, chatbots, and automations.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href={BRAND.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-white hover:bg-orange-500 hover:text-white text-[#1A1A1A] border border-black/5 rounded-full transition-all hover:scale-105 shadow-xs"
              >
                <MessageCircle size={15} />
              </a>
              <a
                href={`mailto:${BRAND.email}`}
                className="p-2.5 bg-white hover:bg-orange-500 hover:text-white text-[#1A1A1A] border border-black/5 rounded-full transition-all hover:scale-105 shadow-xs"
              >
                <Mail size={15} />
              </a>
              <a
                href="https://www.linkedin.com/company/office-pigeon/"
                target="_blank"
                rel="noreferrer"
                aria-label="Office Pigeon on LinkedIn"
                className="p-2.5 bg-white hover:bg-orange-500 hover:text-white text-[#1A1A1A] border border-black/5 rounded-full transition-all hover:scale-105 shadow-xs"
              >
                <Linkedin size={15} />
              </a>
            </div>
          </div>

          {/* COLUMN 2: SERVICES MAP */}
          <div>
            <h5 className="text-[10px] font-mono tracking-[0.2em] uppercase text-orange-600 font-bold mb-4">Services</h5>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => handleNavClick('websites')}
                  className="text-xs text-gray-500 hover:text-orange-500 font-bold transition-colors cursor-pointer text-left focus:outline-none"
                >
                  Websites
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('chatbots')}
                  className="text-xs text-gray-500 hover:text-orange-500 font-bold transition-colors cursor-pointer text-left focus:outline-none"
                >
                  Smart Chatbots
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('automations')}
                  className="text-xs text-gray-500 hover:text-orange-500 font-bold transition-colors cursor-pointer text-left focus:outline-none"
                >
                  Workflow Automations
                </button>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400 font-semibold">Smart Voice Calling</span>
                <span className="text-[8px] font-mono bg-orange-50 border border-orange-100 text-orange-600 rounded-full px-2 py-0.5 uppercase tracking-wider">
                  Soon
                </span>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: CORPORATE MAP */}
          <div>
            <h5 className="text-[10px] font-mono tracking-[0.2em] uppercase text-orange-600 font-bold mb-4">Company</h5>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => handleNavClick('examples')}
                  className="text-xs text-gray-500 hover:text-orange-500 font-bold transition-colors cursor-pointer text-left focus:outline-none"
                >
                  Previews and Case Studies
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('about')}
                  className="text-xs text-gray-500 hover:text-orange-500 font-bold transition-colors cursor-pointer text-left focus:outline-none"
                >
                  About us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('faq')}
                  className="text-xs text-gray-500 hover:text-orange-500 font-bold transition-colors cursor-pointer text-left focus:outline-none"
                >
                  FAQ preview
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('contact')}
                  className="text-xs text-gray-500 hover:text-orange-500 font-bold transition-colors cursor-pointer text-left focus:outline-none"
                >
                  Contact Form
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: LEGAL COMPLIANCE */}
          <div>
            <h5 className="text-[10px] font-mono tracking-[0.2em] uppercase text-orange-600 font-bold mb-4">Legal</h5>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => handleNavClick('privacy')}
                  className="text-xs text-gray-500 hover:text-orange-500 font-bold transition-colors cursor-pointer text-left focus:outline-none"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('terms')}
                  className="text-xs text-gray-500 hover:text-orange-500 font-bold transition-colors cursor-pointer text-left focus:outline-none"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('refund')}
                  className="text-xs text-gray-500 hover:text-orange-500 font-bold transition-colors cursor-pointer text-left focus:outline-none"
                >
                  Refund Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('fair-usage')}
                  className="text-xs text-gray-500 hover:text-orange-500 font-bold transition-colors cursor-pointer text-left focus:outline-none"
                >
                  Fair Usage Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM SUPPORT CAPTION SPLIT */}
        <div className="mt-14 pt-8 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
          <div className="space-y-1.5 md:space-y-0.5">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[11px] text-gray-400 font-semibold font-sans">
              <span className="flex items-center gap-1.5">
                <Mail size={12} className="text-gray-300" />
                {BRAND.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={11} className="text-gray-300" />
                {BRAND.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={11} className="text-gray-300" />
                {BRAND.workingHours}
              </span>
            </div>
            <p className="text-[9px] text-gray-400 block pt-1 md:pt-0 font-mono uppercase tracking-wider italic">
              * Dedicated maintenance is active during normal hours.
            </p>
          </div>

          <div className="text-[10px] text-gray-400 flex flex-col items-center md:items-end gap-1.5 font-mono">
            <span className="flex items-center gap-1.5 bg-white border border-black/5 px-3 py-1.5 rounded-full text-gray-500 shadow-xs">
              <Shield size={10} className="text-orange-500" />
              Verified SSL Gateway Secure
            </span>
            <span className="mt-1">© {currentYear} {BRAND.name}. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
