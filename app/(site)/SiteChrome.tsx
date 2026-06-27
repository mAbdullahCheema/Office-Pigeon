'use client';

/**
 * Next site chrome + actions context (Phase 3).
 *
 * Mirrors the shell in `src/App.tsx` so the existing components are reused
 * verbatim, but navigation is Next routing and the page-level callbacks
 * (onPageChange / onOpenPackageModal / onOpenConsultationModal) are provided
 * through a context instead of prop-drilling. Each ported `app/(site)/<route>`
 * page renders its `src/views/*` component as a client island and pulls these
 * actions from `useSite()`.
 *
 * This is a client boundary: everything it renders (Navbar, Footer, the page,
 * the overlays) is still server-rendered to HTML on first load, then hydrated.
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { PageId, Package } from '@/src/types';
import { pageFromPath, pathForPage } from '@/lib/site/routes';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import PipAIWidget from '@/src/components/PipAIWidget';
import VoiceAgentClientTools from '@/src/components/VoiceAgentClientTools';
import PackageModal from '@/src/components/PackageModal';
import PakistanOfferCurtain from '@/src/components/PakistanOfferCurtain';

interface SiteActions {
  currentPage: PageId;
  navigate: (page: PageId) => void;
  openPackageModal: (pkg: Package) => void;
  openConsultation: () => void;
}

const SiteContext = createContext<SiteActions | null>(null);

export function useSite(): SiteActions {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within <SiteChrome>');
  return ctx;
}

const GENERAL_CONSULTATION: Package = {
  id: 'general',
  name: 'Free Strategic Consultation',
  price: 'Free Strategic Discussion',
  timeline: '2–3 working days',
  revision: 'Unlimited schedules',
  bestFor: 'Growing businesses looking to optimize lead flows and reply times.',
  includes: [
    'Strategic 1-on-1 audit mapping',
    'Website credibility scoring',
    'Chatbot opportunity outlining',
  ],
};

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentPage = pageFromPath(pathname || '/');

  const [activePackage, setActivePackage] = useState<Package | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const navigate = useCallback(
    (page: PageId) => {
      router.push(pathForPage(page));
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [router],
  );

  const openPackageModal = useCallback((pkg: Package) => {
    setActivePackage(pkg);
    setModalOpen(true);
  }, []);

  const openConsultation = useCallback(() => {
    openPackageModal(GENERAL_CONSULTATION);
  }, [openPackageModal]);

  const value = useMemo<SiteActions>(
    () => ({ currentPage, navigate, openPackageModal, openConsultation }),
    [currentPage, navigate, openPackageModal, openConsultation],
  );

  return (
    <SiteContext.Provider value={value}>
      <div className="bg-[#FAF9F6] text-[#1A1A1A] min-h-screen relative selection:bg-orange-500 selection:text-white font-sans overflow-x-hidden">
        {/* Decorative ambient gradients (parity with src/App.tsx) */}
        <div style={{ willChange: 'transform', transform: 'translate3d(0,0,0)', background: 'radial-gradient(circle, rgba(254, 215, 170, 0.4) 0%, rgba(255, 237, 213, 0.15) 50%, transparent 70%)' }} className="absolute top-[-120px] right-[-120px] w-[600px] h-[600px] rounded-full opacity-60 pointer-events-none z-0" />
        <div style={{ willChange: 'transform', transform: 'translate3d(0,0,0)', background: 'radial-gradient(circle, rgba(253, 230, 138, 0.3) 0%, rgba(254, 215, 170, 0.1) 50%, transparent 70%)' }} className="absolute bottom-[20%] left-[-150px] w-[500px] h-[500px] rounded-full opacity-50 pointer-events-none z-0" />
        <div style={{ willChange: 'transform', transform: 'translate3d(0,0,0)', background: 'radial-gradient(circle, rgba(255, 228, 230, 0.2) 0%, rgba(255, 247, 237, 0.08) 50%, transparent 70%)' }} className="absolute top-[40%] right-[-150px] w-[600px] h-[600px] rounded-full opacity-40 pointer-events-none z-0" />

        <Navbar currentPage={currentPage} onPageChange={navigate} onOpenConsultationModal={openConsultation} />

        <PakistanOfferCurtain currentPage={currentPage} onPageChange={navigate} />

        <div className="w-full">
          <div className="pt-2">
            <main id="main-content-viewport">{children}</main>
            <Footer onPageChange={navigate} />
          </div>
        </div>

        <VoiceAgentClientTools />
        <PipAIWidget onPageChange={navigate} />

        <PackageModal packageData={activePackage} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </SiteContext.Provider>
  );
}
