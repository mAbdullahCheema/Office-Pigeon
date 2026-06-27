'use client';

import Home from '@/src/views/Home';
import { useSite } from './SiteChrome';

export default function HomeView() {
  const { navigate, openPackageModal, openConsultation } = useSite();
  return (
    <Home
      onPageChange={navigate}
      onOpenPackageModal={openPackageModal}
      onOpenConsultationModal={openConsultation}
    />
  );
}
