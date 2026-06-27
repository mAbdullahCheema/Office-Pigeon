'use client';

import CallingAgents from '@/src/views/CallingAgents';
import { useSite } from '../SiteChrome';

export default function CallingAgentsView() {
  const { openPackageModal } = useSite();
  return <CallingAgents onOpenPackageModal={openPackageModal} />;
}
