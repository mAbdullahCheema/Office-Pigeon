/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, MapPin, Minimize2 } from 'lucide-react';
import { PageId } from '../types';

interface PakistanOfferCurtainProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
}

interface RegionOfferResponse {
  showPakistanOffer?: boolean;
}

const MINIMIZED_KEY = 'office-pigeon-pakistan-offer-minimized';

export default function PakistanOfferCurtain({ currentPage, onPageChange }: PakistanOfferCurtainProps) {
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    if (currentPage === 'pakistan') {
      setVisible(false);
      return;
    }

    setMinimized(sessionStorage.getItem(MINIMIZED_KEY) === '1');

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

  const minimize = () => {
    sessionStorage.setItem(MINIMIZED_KEY, '1');
    setMinimized(true);
  };

  const goToPakistanPage = () => {
    setVisible(false);
    onPageChange('pakistan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence mode="popLayout">
      {visible && !minimized && (
        <motion.aside
          key="pakistan-offer-expanded"
          layoutId="pakistan-offer"
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.92, filter: 'blur(6px)' }}
          transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 top-[76px] bottom-auto z-[35] px-3 pointer-events-none lg:top-auto lg:bottom-6 lg:px-5"
          aria-label="Pakistan pricing option"
        >
          <div className="mx-auto flex max-w-[calc(100vw-24px)] justify-center pointer-events-auto sm:max-w-xl">
            <div className="relative flex w-full items-center gap-2 rounded-full border border-orange-500/20 bg-white/95 p-2 shadow-[0_18px_46px_rgba(20,18,15,0.14)] backdrop-blur-xl sm:w-auto sm:min-w-[min(520px,calc(100vw-40px))]">
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
                onClick={minimize}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/5 bg-[#F0EEEA] text-gray-500 transition-all hover:bg-black hover:text-white active:scale-[0.98]"
                aria-label="Minimize Pakistan pricing option"
              >
                <Minimize2 size={15} />
              </button>
            </div>
          </div>
        </motion.aside>
      )}

      {visible && minimized && (
        <motion.aside
          key="pakistan-offer-minimized"
          layoutId="pakistan-offer"
          initial={{ opacity: 0, y: 18, scale: 0.88, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 18, scale: 0.88, filter: 'blur(6px)' }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-[76px] left-4 bottom-auto right-auto z-[35] pointer-events-none lg:top-auto lg:bottom-[82px] lg:left-auto lg:right-5 sm:left-5"
          aria-label="Pakistan pricing minimized option"
        >
          <button
            type="button"
            onClick={goToPakistanPage}
            className="group pointer-events-auto flex max-w-[min(250px,calc(100vw-40px))] items-center gap-2 rounded-full border border-orange-500/20 bg-white/95 p-2 pr-3 text-left shadow-[0_16px_42px_rgba(20,18,15,0.14)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-orange-500/35 hover:shadow-[0_20px_50px_rgba(20,18,15,0.18)] focus:outline-none focus:ring-2 focus:ring-orange-300 sm:max-w-[270px] sm:pr-4"
            aria-label="View Pakistan pricing packages"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500 ring-1 ring-orange-500/15">
              <MapPin size={17} />
            </span>
            <span className="hidden min-w-0 min-[390px]:block">
              <span className="block truncate text-xs font-black leading-tight text-gray-900 sm:text-sm">Pakistan pricing</span>
              <span className="block truncate text-[10px] font-semibold leading-tight text-gray-500 sm:text-[11px]">PKR packages</span>
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:translate-x-0.5">
              <ArrowRight size={13} />
            </span>
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
