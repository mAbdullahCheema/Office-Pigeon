/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, MapPin, X } from 'lucide-react';
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
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.98 }}
          transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-[86px] z-[35] px-3 pointer-events-none sm:bottom-6 sm:px-5"
          aria-label="Pakistan pricing option"
        >
          <div className="mx-auto flex max-w-[calc(100vw-24px)] justify-center pointer-events-auto sm:max-w-xl">
            <div className="relative flex w-full items-center gap-2 rounded-full border border-orange-500/20 bg-white/95 p-2 shadow-[0_18px_46px_rgba(20,18,15,0.14)] backdrop-blur-xl sm:w-auto sm:min-w-[520px]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500 ring-1 ring-orange-500/15">
                <MapPin size={17} />
              </span>

              <button
                onClick={goToPakistanPage}
                className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-full px-1.5 py-1.5 text-left transition-colors hover:bg-orange-50/70 sm:px-2"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black leading-tight text-gray-900">
                    Pakistan pricing available
                  </span>
                  <span className="block truncate text-[11px] font-semibold leading-tight text-gray-500">
                    Local PKR packages for growing businesses
                  </span>
                </span>
                <span className="hidden shrink-0 items-center gap-1 rounded-full bg-black px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-wider text-white transition-colors sm:inline-flex">
                  View Packages
                  <ArrowRight size={12} />
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white sm:hidden">
                  <ArrowRight size={14} />
                </span>
              </button>

              <button
                onClick={dismiss}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/5 bg-[#F0EEEA] text-gray-500 transition-all hover:bg-black hover:text-white active:scale-[0.98]"
                aria-label="Dismiss Pakistan pricing option"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
