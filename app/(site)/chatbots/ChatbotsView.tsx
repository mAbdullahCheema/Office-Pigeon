'use client';

import Chatbots from '@/src/views/Chatbots';
import { useSite } from '../SiteChrome';

export default function ChatbotsView() {
  const { openPackageModal } = useSite();
  return <Chatbots onOpenPackageModal={openPackageModal} />;
}
