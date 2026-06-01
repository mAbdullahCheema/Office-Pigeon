/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, ExternalLink, Globe2, Loader2, Sparkles } from 'lucide-react';
import { PageId } from '../types';

interface ExamplesProps {
  onPageChange: (page: PageId) => void;
  onOpenConsultationModal: () => void;
}

interface PublicPreview {
  slug: string;
  business_name: string;
  url: string;
  status: 'live';
}

const titleCaseSlug = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function Examples({ onPageChange, onOpenConsultationModal }: ExamplesProps) {
  const [previews, setPreviews] = useState<PublicPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    fetch('/api/public/previews')
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load previews.');
        return response.json();
      })
      .then((data) => {
        if (mounted) setPreviews(data.previews || []);
      })
      .catch(() => {
        if (mounted) setError('Live previews are being prepared.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const previewCountLabel = useMemo(() => {
    if (loading) return 'Loading live previews';
    if (previews.length === 1) return '1 live preview';
    return `${previews.length} live previews`;
  }, [loading, previews.length]);

  return (
    <div className="space-y-24 pb-20 mt-16 font-sans overflow-hidden">
      <section className="bg-gradient-to-b from-cyan-50/10 via-transparent to-transparent pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-600 font-bold bg-cyan-50 px-3.5 py-1.5 rounded-full">
            PREVIEWS AND CASE STUDIES
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight max-w-3xl mx-auto">
            Free preview websites built for real businesses
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            Browse live Office Pigeon previews, then claim the one made for your business or request a custom version.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-700 shadow-xs">
              <Globe2 size={12} /> {previewCountLabel}
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight text-gray-950">Live previews</h2>
          </div>
          <button
            onClick={onOpenConsultationModal}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-orange-500"
          >
            Request a preview <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="grid min-h-[220px] place-items-center rounded-3xl border border-gray-100 bg-white">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
              <Loader2 size={16} className="animate-spin" /> Loading previews
            </div>
          </div>
        ) : previews.length ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {previews.map((preview) => (
              <article key={preview.slug} className="group flex min-h-[220px] flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-cyan-200 hover:shadow-md">
                <div className="space-y-4">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-700">
                    <Sparkles size={11} /> Free Preview
                  </span>
                  <div>
                    <h3 className="text-xl font-black leading-tight text-gray-950 group-hover:text-cyan-700">
                      {preview.business_name || titleCaseSlug(preview.slug)}
                    </h3>
                    <p className="mt-2 font-mono text-[11px] text-gray-400">/previews/{preview.slug}</p>
                  </div>
                </div>

                <a
                  href={preview.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-gray-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-orange-500"
                >
                  Open preview <ExternalLink size={13} />
                </a>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-cyan-200 bg-white px-6 py-14 text-center shadow-xs">
            <h3 className="text-2xl font-black text-gray-950">New previews are coming soon</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500">
              {error || 'Live preview websites will appear here as soon as they are published.'}
            </p>
          </div>
        )}
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-100 bg-gray-50 py-16 px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-widest text-cyan-600 font-bold bg-white px-3.5 py-1.5 rounded-full border border-gray-100 uppercase">
              <BookOpen size={11} /> CASE STUDIES COMING SOON
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-950">Real operational outcomes are being prepared</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-lg mx-auto">
              Case studies will show the business problem, the Office Pigeon system, and the result once projects move from preview to production.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <div className="border border-cyan-100 bg-white p-10 rounded-3xl shadow-xs space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">Want a custom business solution designed?</h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
            Let's evaluate your goals and map the right preview, website, chatbot, or automation setup.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={onOpenConsultationModal}
              className="px-6 py-3.5 bg-gray-900 text-white font-sans text-xs font-bold rounded-2xl shadow-md cursor-pointer inline-flex items-center gap-1.5 hover:bg-gray-800"
            >
              Get Free Consultation
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => onPageChange('websites')}
              className="px-6 py-3.5 bg-orange-50 text-orange-700 border border-orange-100 font-sans text-xs font-bold rounded-2xl cursor-pointer inline-flex items-center gap-1.5 hover:bg-orange-100"
            >
              Website Packages
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
