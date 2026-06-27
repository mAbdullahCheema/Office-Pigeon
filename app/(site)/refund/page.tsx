import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo/pageMetadata';
import LegalView from '../LegalView';

export const metadata: Metadata = pageMetadata('refund');

export default function RefundPage() {
  return <LegalView initialTab="refund" />;
}
