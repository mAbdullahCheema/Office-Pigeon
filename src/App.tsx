/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { PageId, Package } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SmoothScroll from './components/SmoothScroll';
import PipAIWidget from './components/PipAIWidget';
import PackageModal from './components/PackageModal';

// Pages
import Home from './pages/Home';
import Websites from './pages/Websites';
import Chatbots from './pages/Chatbots';
import CallingAgents from './pages/CallingAgents';
import Automations from './pages/Automations';
import Examples from './pages/Examples';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Legal from './pages/Legal';
import Admin from './pages/Admin';

const PAGE_TITLES: Record<PageId, string> = {
  home: 'Office Pigeon | AI Websites, Chatbots, Calling Agents & Automations',
  websites: 'Website Development for Growing Businesses | Office Pigeon',
  chatbots: 'Smart Chatbots for Websites & WhatsApp | Office Pigeon',
  'calling-agents': 'AI Calling Agents for Businesses | Office Pigeon',
  automations: 'Workflow Automation for Growing Businesses | Office Pigeon',
  examples: 'Previews and Case Studies | Office Pigeon',
  about: 'About Office Pigeon | AI Business Systems',
  contact: 'Contact Office Pigeon | Free AI Consultation',
  faq: 'FAQ | Office Pigeon',
  privacy: 'Privacy Policy | Office Pigeon',
  terms: 'Terms of Service | Office Pigeon',
  refund: 'Refund Policy | Office Pigeon',
  'fair-usage': 'Fair Usage Policy | Office Pigeon'
};

export default function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [activePackage, setActivePackage] = useState<Package | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (isAdminRoute) {
      document.title = 'Preview Admin | Office Pigeon';
      return;
    }
    document.title = PAGE_TITLES[currentPage];
  }, [currentPage, isAdminRoute]);

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
            onPageChange={setCurrentPage}
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
      case 'examples':
        return (
          <Examples
            onPageChange={setCurrentPage}
            onOpenConsultationModal={handleOpenGeneralConsultation}
          />
        );
      case 'about':
        return <About onPageChange={setCurrentPage} />;
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
              onTabChange={setCurrentPage}
            />
          </div>
        );
      default:
        return (
          <Home
            onPageChange={setCurrentPage}
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
      <div className="absolute top-[-120px] right-[-120px] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-orange-200/40 via-orange-100/20 to-transparent blur-3xl opacity-60 pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] left-[-150px] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-200/30 via-orange-100/10 to-transparent blur-3xl opacity-50 pointer-events-none z-0"></div>
      <div className="absolute top-[40%] right-[-150px] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-rose-100/20 via-orange-50/10 to-transparent blur-3xl opacity-40 pointer-events-none z-0"></div>
      
      {/* NAVBAR */}
      <Navbar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onOpenConsultationModal={handleOpenGeneralConsultation}
      />

      {/* PHYSICS-BASED INERTIAL SMOOTH SCROLLER WITH MOBILE MOMENTUM FALLBACK */}
      <SmoothScroll>
        <div className="pt-2">
          {/* Main dynamic viewport transition */}
          <main id="main-content-viewport">
            {renderActivePage()}
          </main>

          {/* FOOTER */}
          <Footer onPageChange={setCurrentPage} />
        </div>
      </SmoothScroll>

      {/* FLOATING CHAT ASSISTANT - OVERLAY */}
      <PipAIWidget onPageChange={setCurrentPage} />

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
