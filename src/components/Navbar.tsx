/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Bird } from 'lucide-react';
import { PageId } from '../types';

interface NavbarProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
  onOpenConsultationModal: () => void;
}

export default function Navbar({ currentPage, onPageChange, onOpenConsultationModal }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Home', page: 'home' as PageId },
    { label: 'Websites', page: 'websites' as PageId },
    { label: 'Smart Chatbots', page: 'chatbots' as PageId },
    { label: 'Calling Agents', page: 'calling-agents' as PageId },
    { label: 'Workflow Automations', page: 'automations' as PageId },
    { label: 'Previews', page: 'examples' as PageId },
    { label: 'FAQ', page: 'faq' as PageId },
    { label: 'Contact', page: 'contact' as PageId }
  ];

  const handleNavClick = (page: PageId) => {
    onPageChange(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 font-sans ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-black/5 shadow-xs'
          : 'bg-transparent border-b border-transparent'
      }`}
      id="main-app-header"
    >
      <div className="max-w-[96rem] mx-auto px-3 sm:px-4 lg:px-5 xl:px-6 py-3.5 flex items-center justify-between gap-3 xl:gap-4">
        {/* programmatically constructed professional logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 xl:gap-3 px-1 py-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 cursor-pointer group text-left shrink-0"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/10 group-hover:scale-105 transition-transform group-hover:rotate-12 duration-500">
            <Bird size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="font-sans text-lg xl:text-xl font-black tracking-tighter italic uppercase text-gray-900 group-hover:text-orange-500 transition-colors whitespace-nowrap">
              Office Pigeon
            </span>
            <span className="navbar-kicker block font-mono uppercase text-orange-500 font-bold leading-none mt-1.5 whitespace-nowrap">
              We Automate Your Success
            </span>
          </div>
        </button>

        {/* DESKTOP LINKS */}
        <nav className="hidden min-[1360px]:flex items-center justify-center gap-1.5 2xl:gap-2 bg-[#F0EEEA]/80 border border-black/5 px-2 py-2 rounded-full min-w-0 flex-1 max-w-fit">
          {menuItems.map((item) => (
            <button
              key={item.page}
              onClick={() => handleNavClick(item.page)}
              className={`navbar-link px-2.5 py-2.5 2xl:px-4 rounded-full font-sans font-extrabold uppercase transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/25 cursor-pointer whitespace-nowrap ${
                currentPage === item.page
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* DESKTOP CTAS */}
        <div className="hidden min-[1360px]:flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenConsultationModal}
            className="navbar-cta px-4 py-3 2xl:px-6 bg-black hover:bg-orange-500 hover:scale-105 text-white font-sans font-black uppercase rounded-full transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 whitespace-nowrap"
          >
            Get Free Consultation
            <ArrowUpRight size={13} className="stroke-[2.5]" />
          </button>
        </div>

        {/* MOBILE MENU TRIGGER */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="min-[1360px]:hidden p-3 rounded-full hover:bg-black/5 text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 cursor-pointer"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* MOBILE DROP RANGE */}
      <div
        className={`min-[1360px]:hidden overflow-hidden transition-all duration-300 bg-white/95 backdrop-blur-xl border-b border-gray-100 ${
          mobileMenuOpen ? 'max-h-screen py-6 px-4 border-t border-gray-100' : 'max-h-0 py-0 px-4'
        }`}
      >
        <div className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <button
              key={item.page}
              onClick={() => handleNavClick(item.page)}
              className={`w-full text-left px-5 py-3.5 rounded-2xl text-xs font-sans font-extrabold uppercase tracking-wider transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/25 ${
                currentPage === item.page
                  ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="h-px bg-gray-100 my-2" />
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenConsultationModal();
            }}
            className="w-full py-4 bg-black hover:bg-orange-500 text-white rounded-2xl text-xs font-bold uppercase tracking-wide transition-all shadow-md text-center cursor-pointer block focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30"
          >
            Get Free Consultation
          </button>
        </div>
      </div>
    </header>
  );
}
