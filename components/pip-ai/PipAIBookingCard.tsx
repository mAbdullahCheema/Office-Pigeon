'use client';

import { Calendar } from 'lucide-react';

function calUrl() {
  return (import.meta as any).env?.VITE_CALCOM_URL || process.env.NEXT_PUBLIC_CALCOM_URL || 'https://cal.com/office-pigeon/demo-call';
}

export default function PipAIBookingCard() {
  return (
    <a
      href={calUrl()}
      target="_blank"
      rel="noreferrer"
      className="block rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 text-left shadow-sm transition hover:bg-cyan-50"
    >
      <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-cyan-600 shadow-sm">
        <Calendar size={16} />
      </span>
      <p className="text-sm font-black text-gray-900">Book Free Consultation</p>
      <p className="mt-1 text-xs leading-relaxed text-gray-600">
        Book a free consultation so we can understand your business and recommend the right website, chatbot, or automation setup.
      </p>
    </a>
  );
}
