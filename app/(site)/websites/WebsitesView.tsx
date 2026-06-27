'use client';

import Websites from '@/src/views/Websites';
import { useSite } from '../SiteChrome';

export default function WebsitesView() {
  const { openPackageModal } = useSite();
  return <Websites onOpenPackageModal={openPackageModal} />;
}
