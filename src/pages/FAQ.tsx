/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';
import { GENERAL_FAQS } from '../config';

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'general' | 'websites' | 'chatbots' | 'automations' | 'calling'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFAQs = GENERAL_FAQS.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-16 pb-20 mt-16 font-sans overflow-hidden">
      
      {/* HERO HERO SECTION */}
      <section className="bg-gradient-to-b from-cyan-50/10 via-transparent to-transparent pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-600 font-bold bg-cyan-50 px-3.5 py-1.5 rounded-full">
            KNOWLEDGE BASE
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight max-w-3xl mx-auto">
            Questions business owners usually ask
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            We list clear answers so you know exactly what options fit best, how renewals operate, and what monitoring safeguards.
          </p>

          {/* SEARCH SYSTEM */}
          <div className="max-w-md mx-auto relative pt-4">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 mt-2" />
            <input
              type="text"
              placeholder="Search frequently asked questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-205 rounded-xl text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* FILTER BUTTONS AND EXPANDS */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex items-center justify-center flex-wrap gap-1.5 bg-gray-100 p-1 rounded-2xl">
          {(['all', 'general', 'websites', 'chatbots', 'automations', 'calling'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setOpenIndex(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold capitalize cursor-pointer transition-all ${
                activeCategory === cat ? 'bg-white text-cyan-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {cat === 'all' ? 'All Questions' : cat}
            </button>
          ))}
        </div>

        {/* ACCORDION MATRIX */}
        <div className="space-y-3.5 select-none">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full px-5 py-4 text-left flex items-start justify-between gap-4 text-xs font-bold text-gray-900 transition-colors hover:text-cyan-600 cursor-pointer focus:outline-none"
                  >
                    <span className="flex items-start gap-3 pt-0.5">
                      <HelpCircle size={15} className="text-cyan-600 flex-shrink-0 mt-0.5" />
                      <span>{faq.question}</span>
                    </span>
                    <ChevronDown
                      size={15}
                      className={`text-gray-400 mt-0.5 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      isOpen ? 'max-h-[300px] border-t border-gray-50 bg-gray-50/20' : 'max-h-0'
                    }`}
                  >
                    <div className="px-12 py-4 text-xs text-gray-500 leading-relaxed font-normal whitespace-pre-wrap">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-xs text-gray-400 font-medium">
              No matching questions found. Try search keywords like "landing", "domain", "budget".
            </div>
          )}
        </div>

      </section>
    </div>
  );
}
