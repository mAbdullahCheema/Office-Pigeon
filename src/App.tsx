/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, lazy, Suspense } from 'react';
import { PageId, Package } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SmoothScroll from './components/SmoothScroll';
import PipAIWidget from './components/PipAIWidget';
import VoiceAgentClientTools from './components/VoiceAgentClientTools';
import PackageModal from './components/PackageModal';
import PakistanOfferCurtain from './components/PakistanOfferCurtain';

// Pages
import Home from './pages/Home';
const Websites = lazy(() => import('./pages/Websites'));
const Chatbots = lazy(() => import('./pages/Chatbots'));
const CallingAgents = lazy(() => import('./pages/CallingAgents'));
const Automations = lazy(() => import('./pages/Automations'));
const Examples = lazy(() => import('./pages/Examples'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Legal = lazy(() => import('./pages/Legal'));
const Admin = lazy(() => import('./pages/Admin'));
const Pakistan = lazy(() => import('./pages/Pakistan'));

const PAGE_TITLES: Record<PageId, string> = {
  home: 'Office Pigeon | AI Websites, Chatbots, Calling Agents & Automations',
  websites: 'Website Development for Growing Businesses | Office Pigeon',
  chatbots: 'Smart Chatbots for Websites & WhatsApp | Office Pigeon',
  'calling-agents': 'AI Calling Agents for Businesses | Office Pigeon',
  automations: 'Workflow Automation for Growing Businesses | Office Pigeon',
  pakistan: 'Office Pigeon Pakistan | Websites, Chatbots & AI Calling Agents',
  examples: 'Previews and Case Studies | Office Pigeon',
  about: 'About Office Pigeon | AI Business Systems',
  contact: 'Contact Office Pigeon | Free AI Consultation',
  faq: 'FAQ | Office Pigeon',
  privacy: 'Privacy Policy | Office Pigeon',
  terms: 'Terms of Service | Office Pigeon',
  refund: 'Refund Policy | Office Pigeon',
  'fair-usage': 'Fair Usage Policy | Office Pigeon'
};

const PAGE_DESCRIPTIONS: Partial<Record<PageId, string>> = {
  pakistan:
    'Office Pigeon Pakistan helps growing businesses build professional websites, smart chatbots, WhatsApp-friendly inquiry systems, and AI calling agents for faster customer response and better lead capture.'
};

const PAGE_OG: Partial<Record<PageId, { title: string; description: string }>> = {
  pakistan: {
    title: 'Office Pigeon Pakistan',
    description:
      'Professional websites, smart chatbots, AI calling agents, and growth systems for growing Pakistani businesses.'
  }
};

const PAGE_PATHS: Record<PageId, string> = {
  home: '/',
  websites: '/websites',
  chatbots: '/chatbots',
  'calling-agents': '/calling-agents',
  automations: '/automations',
  pakistan: '/pakistan',
  examples: '/examples',
  about: '/about',
  contact: '/contact',
  faq: '/faq',
  privacy: '/privacy',
  terms: '/terms',
  refund: '/refund',
  'fair-usage': '/fair-usage'
};

const pageFromPath = (pathname: string): PageId => {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const match = (Object.entries(PAGE_PATHS) as [PageId, string][]).find(([, path]) => path === normalized);
  return match?.[0] || 'home';
};

export default function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const [currentPage, setCurrentPage] = useState<PageId>(() => pageFromPath(window.location.pathname));
  const [activePackage, setActivePackage] = useState<Package | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (isAdminRoute) {
      document.title = 'Preview Admin | Office Pigeon';
      return;
    }
    document.title = PAGE_TITLES[currentPage];
    const description = PAGE_DESCRIPTIONS[currentPage];
    if (description) {
      const meta =
        document.querySelector<HTMLMetaElement>('meta[name="description"]') ||
        document.head.appendChild(document.createElement('meta'));
      meta.setAttribute('name', 'description');
      meta.setAttribute('content', description);
    }
    const og = PAGE_OG[currentPage];
    if (og) {
      ([
        ['og:title', og.title],
        ['og:description', og.description]
      ] as const).forEach(([property, content]) => {
        const meta =
          document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`) ||
          document.head.appendChild(document.createElement('meta'));
        meta.setAttribute('property', property);
        meta.setAttribute('content', content);
      });
    }
  }, [currentPage, isAdminRoute]);

  useEffect(() => {
    const handlePopState = () => setCurrentPage(pageFromPath(window.location.pathname));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    // Prefetch all lazy pages and ThreeHub when browser is idle to optimize navigation responsiveness
    const prefetch = () => {
      import('./pages/Websites');
      import('./pages/Chatbots');
      import('./pages/CallingAgents');
      import('./pages/Automations');
      import('./pages/Examples');
      import('./pages/About');
      import('./pages/Contact');
      import('./pages/FAQ');
      import('./pages/Legal');
      import('./pages/Pakistan');
      import('./components/ThreeHub');
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prefetch);
    } else {
      setTimeout(prefetch, 1500);
    }
  }, []);

  const handlePageChange = (page: PageId) => {
    setCurrentPage(page);
    const path = PAGE_PATHS[page];
    if (path && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  };

  const handleOpenLaunchModal = (pkg: Package) => {
    setActivePackage(pkg);
    setModalOpen(true);
  };

  const handleOpenGeneralConsultation = () => {
    const generalPkg: Package = {
      id: 'general',
      name: 'Free Strategic Consultation',
      price: 'Free Strategic Discussion',
      timeline: '2–3 working days',
      revision: 'Unlimited schedules',
      bestFor: 'Growing businesses looking to optimize lead flows and reply times.',
      includes: [
        'Strategic 1-on-1 audit mapping',
        'Website credibility scoring',
        'Chatbot opportunity outlining'
      ]
    };
    handleOpenLaunchModal(generalPkg);
  };

  const renderActivePage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home
            onPageChange={handlePageChange}
            onOpenPackageModal={handleOpenLaunchModal}
            onOpenConsultationModal={handleOpenGeneralConsultation}
          />
        );
      case 'websites':
        return <Websites onOpenPackageModal={handleOpenLaunchModal} />;
      case 'chatbots':
        return <Chatbots onOpenPackageModal={handleOpenLaunchModal} />;
      case 'calling-agents':
        return <CallingAgents onOpenPackageModal={handleOpenLaunchModal} />;
      case 'automations':
        return <Automations onOpenPackageModal={handleOpenLaunchModal} />;
      case 'pakistan':
        return (
          <Pakistan
            onPageChange={handlePageChange}
            onOpenPackageModal={handleOpenLaunchModal}
            onOpenConsultationModal={handleOpenGeneralConsultation}
          />
        );
      case 'examples':
        return (
          <Examples
            onPageChange={handlePageChange}
            onOpenConsultationModal={handleOpenGeneralConsultation}
          />
        );
      case 'about':
        return <About onPageChange={handlePageChange} />;
      case 'contact':
        return <Contact />;
      case 'faq':
        return <FAQ />;
      case 'privacy':
      case 'terms':
      case 'refund':
      case 'fair-usage':
        return (
          <div key={currentPage}>
            <Legal
              initialTab={currentPage}
              onTabChange={handlePageChange}
            />
          </div>
        );
      default:
        return (
          <Home
            onPageChange={handlePageChange}
            onOpenPackageModal={handleOpenLaunchModal}
            onOpenConsultationModal={handleOpenGeneralConsultation}
          />
        );
    }
  };

  return (
    <div className="bg-[#FAF9F6] text-[#1A1A1A] min-h-screen relative selection:bg-orange-500 selection:text-white font-sans overflow-x-hidden">
      {isAdminRoute ? <Admin /> : (
        <>
      
      {/* Decorative 3D Ambient Elements (Simulated) */}
      <div style={{ willChange: 'transform', transform: 'translate3d(0,0,0)', background: 'radial-gradient(circle, rgba(254, 215, 170, 0.4) 0%, rgba(255, 237, 213, 0.15) 50%, transparent 70%)' }} className="absolute top-[-120px] right-[-120px] w-[600px] h-[600px] rounded-full opacity-60 pointer-events-none z-0"></div>
      <div style={{ willChange: 'transform', transform: 'translate3d(0,0,0)', background: 'radial-gradient(circle, rgba(253, 230, 138, 0.3) 0%, rgba(254, 215, 170, 0.1) 50%, transparent 70%)' }} className="absolute bottom-[20%] left-[-150px] w-[500px] h-[500px] rounded-full opacity-50 pointer-events-none z-0"></div>
      <div style={{ willChange: 'transform', transform: 'translate3d(0,0,0)', background: 'radial-gradient(circle, rgba(255, 228, 230, 0.2) 0%, rgba(255, 247, 237, 0.08) 50%, transparent 70%)' }} className="absolute top-[40%] right-[-150px] w-[600px] h-[600px] rounded-full opacity-40 pointer-events-none z-0"></div>
      
      {/* NAVBAR */}
      <Navbar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onOpenConsultationModal={handleOpenGeneralConsultation}
      />

      <PakistanOfferCurtain
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {/* PHYSICS-BASED INERTIAL SMOOTH SCROLLER WITH MOBILE MOMENTUM FALLBACK */}
      <SmoothScroll>
        <div className="pt-2">
          {/* Main dynamic viewport transition */}
          <main id="main-content-viewport">
            <Suspense fallback={
              <div className="min-h-[60vh] flex flex-col items-center justify-center animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 animate-spin" />
                <p className="mt-4 text-xs text-gray-400 font-mono uppercase tracking-widest">Loading Page...</p>
              </div>
            }>
              {renderActivePage()}
            </Suspense>
          </main>

          {/* FOOTER */}
          <Footer onPageChange={handlePageChange} />
        </div>
      </SmoothScroll>

      {/* FLOATING CHAT ASSISTANT - OVERLAY */}
      <VoiceAgentClientTools />
      <PipAIWidget onPageChange={handlePageChange} />

      {/* REUSABLE PACKAGES / GENERAL INTAKE FORM MODAL */}
      <PackageModal
        packageData={activePackage}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
        </>
      )}
    </div>
  );
}
