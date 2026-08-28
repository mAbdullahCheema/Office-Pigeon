import { NotFoundCard } from '@/components/site/NotFoundCard';

/** Shown when a segment calls `notFound()` — an unknown course slug, say. */
export default function NotFound() {
  return <NotFoundCard />;
}
