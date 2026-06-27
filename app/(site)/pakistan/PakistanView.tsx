'use client';

import Pakistan from '@/src/views/Pakistan';
import { useSite } from '../SiteChrome';

export default function PakistanView() {
  const { navigate, openPackageModal, openConsultation } = useSite();
  return (
    <Pakistan
      onPageChange={navigate}
      onOpenPackageModal={openPackageModal}
      onOpenConsultationModal={openConsultation}
    />
  );
}
