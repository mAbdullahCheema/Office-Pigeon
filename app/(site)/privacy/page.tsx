import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo/pageMetadata';
import LegalView from '../LegalView';

export const metadata: Metadata = pageMetadata('privacy');

export default function PrivacyPage() {
  return <LegalView initialTab="privacy" />;
}
