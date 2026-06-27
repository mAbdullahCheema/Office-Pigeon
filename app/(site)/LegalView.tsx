'use client';

import Legal from '@/src/views/Legal';
import { useSite } from './SiteChrome';

type LegalTab = 'privacy' | 'terms' | 'refund' | 'fair-usage';

/** Shared client adapter for the four legal routes (privacy/terms/refund/fair-usage). */
export default function LegalView({ initialTab }: { initialTab: LegalTab }) {
  const { navigate } = useSite();
  return <Legal initialTab={initialTab} onTabChange={navigate} />;
}
