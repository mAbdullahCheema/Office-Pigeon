/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, MapPin, Sparkles, X } from 'lucide-react';
import { PageId } from '../types';

interface PakistanOfferCurtainProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
}

interface RegionOfferResponse {
  showPakistanOffer?: boolean;
}

const DISMISS_KEY = 'office-pigeon-pakistan-offer-dismissed';

export default function PakistanOfferCurtain({ currentPage, onPageChange }: PakistanOfferCurtainProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (currentPage === 'pakistan') {
      setVisible(false);
      return;
    }

    if (sessionStorage.getItem(DISMISS_KEY) === '1') return;

    const controller = new AbortController();
    const search = new URLSearchParams(window.location.search);
    const country = search.get('country');
    const query = country ? `?country=${encodeURIComponent(country)}` : '';

    fetch(`/api/region-offer${query}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data: RegionOfferResponse | null) => {
        if (data?.showPakistanOffer) {
          window.setTimeout(() => setVisible(true), 650);
        }
      })
      .catch(() => {
        setVisible(false);
      });

    return () => controller.abort();
  }, [currentPage]);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  const goToPakistanPage = () => {
    setVisible(false);
    onPageChange('pakistan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ opacity: 0, y: -28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-0 right-0 top-[76px] z-[35] px-3 sm:px-5 pointer-events-none"
          aria-label="Pakistan exclusive offers"
        >
          <div className="mx-auto max-w-5xl pointer-events-auto">
            <div className="relative overflow-hidden rounded-[28px] border border-orange-500/20 bg-white/94 shadow-[0_28px_70px_rgba(20,18,15,0.13)] backdrop-blur-xl">
              <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-orange-500 via-rose-500 to-amber-500" />
              <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-orange-200/35 blur-3xl pointer-events-none" />
              <div className="flex flex-col gap-4 p-4 pl-6 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:p-5 sm:pl-7">
                <div className="flex min-w-0 items-start gap-3 sm:items-center">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500 ring-1 ring-orange-500/15 sm:mt-0">
                    <MapPin size={18} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600 ring-1 ring-orange-500/10">
                        <Sparkles size={11} />
                        Pakistan Exclusive Offers
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-black leading-snug text-gray-900 sm:text-base">
                      Clear Pakistan pricing for websites, smart chatbots, WhatsApp flows, and AI calling agents.
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-gray-500">
                      Built for Pakistani business owners. Open it when you want, without changing the main website experience.
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                  <button
                    onClick={goToPakistanPage}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-black px-5 text-[11px] font-mono font-bold uppercase tracking-wider text-white shadow-md shadow-black/10 transition-all hover:bg-orange-500 active:scale-[0.98] sm:flex-none"
                  >
                    View Pakistan Page
                    <ArrowRight size={13} />
                  </button>
                  <button
                    onClick={dismiss}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/5 bg-[#F0EEEA] text-gray-500 transition-all hover:bg-black hover:text-white active:scale-[0.98]"
                    aria-label="Dismiss Pakistan exclusive offers"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
