'use client';

import { MessageCircle } from 'lucide-react';

export default function PipAIHandoffCard({ whatsappUrl }: { whatsappUrl?: string }) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4 shadow-sm">
      <p className="text-sm font-black text-gray-900">Human help is ready</p>
      <p className="mt-1 text-xs leading-relaxed text-gray-600">
        I want to make sure you get the correct answer, so I’ll connect you with the Office Pigeon team.
      </p>
      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-emerald-700"
        >
          <MessageCircle size={14} />
          Continue on WhatsApp
        </a>
      ) : null}
    </div>
  );
}
