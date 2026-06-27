'use client';

import Automations from '@/src/views/Automations';
import { useSite } from '../SiteChrome';

export default function AutomationsView() {
  const { openPackageModal } = useSite();
  return <Automations onOpenPackageModal={openPackageModal} />;
}
