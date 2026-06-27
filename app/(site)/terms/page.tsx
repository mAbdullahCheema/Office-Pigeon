import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo/pageMetadata';
import LegalView from '../LegalView';

export const metadata: Metadata = pageMetadata('terms');

export default function TermsPage() {
  return <LegalView initialTab="terms" />;
}
