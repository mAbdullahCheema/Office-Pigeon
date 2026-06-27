'use client';

import Examples from '@/src/views/Examples';
import { useSite } from '../SiteChrome';

export default function ExamplesView() {
  const { navigate, openConsultation } = useSite();
  return <Examples onPageChange={navigate} onOpenConsultationModal={openConsultation} />;
}
