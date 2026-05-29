'use client';

export default function PipAIRecommendationCard({ service, reason }: { service?: string; reason?: string }) {
  if (!service) return null;

  return (
    <div className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-widest text-cyan-600">Recommended</p>
      <p className="mt-1 text-sm font-black text-gray-950">{service}</p>
      {reason ? <p className="mt-1 text-xs leading-relaxed text-gray-500">{reason}</p> : null}
    </div>
  );
}
