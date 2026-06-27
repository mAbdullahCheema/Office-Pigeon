import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo/pageMetadata';
import LegalView from '../LegalView';

export const metadata: Metadata = pageMetadata('fair-usage');

export default function FairUsagePage() {
  return <LegalView initialTab="fair-usage" />;
}
