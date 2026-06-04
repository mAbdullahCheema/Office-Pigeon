'use client';

import { FormEvent, useState } from 'react';
import { Briefcase, Mail, Phone, User } from 'lucide-react';
import DropdownMenu from '@/components/ui/dropdown-menu';

export interface PipLead {
  id?: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  needHelpWith: string;
}

export default function PipAILeadForm({ onSaved }: { onSaved: (lead: PipLead) => void }) {
  const [form, setForm] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    needHelpWith: 'Not sure yet',
    consent: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/pip/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/' })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Lead save failed.');
      if (data.leadId) localStorage.setItem('pip_ai_lead_id', data.leadId);
      onSaved({ ...form, id: data.leadId });
    } catch (err) {
      setError('Something went wrong, but you can still continue. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3.5 p-4">
      <div className="space-y-1 text-center">
        <p className="text-base font-black text-gray-950">Hi, I’m Pip AI.</p>
        <p className="text-xs leading-relaxed text-gray-500">
          I can help you choose the right website, chatbot, or automation. Before we start, please share a few details so the Office Pigeon team can help if needed.
        </p>
      </div>

      {[
        ['name', 'Name', User],
        ['businessName', 'Business name', Briefcase],
        ['email', 'Email', Mail],
        ['phone', 'Phone / WhatsApp', Phone]
      ].map(([field, label, Icon]) => (
        <label key={field as string} className="relative block">
          <Icon className="absolute left-3 top-3.5 text-gray-400" size={14} />
          <input
            required
            type={field === 'email' ? 'email' : 'text'}
            placeholder={label as string}
            value={form[field as keyof typeof form] as string}
            onChange={(event) => update(field as keyof typeof form, event.target.value)}
            className="w-full rounded-2xl border border-gray-100 bg-white py-3 pl-9 pr-3 text-xs outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          />
        </label>
      ))}

      <DropdownMenu
        value={form.needHelpWith}
        onChange={(value) => update('needHelpWith', value)}
        options={[
          'Website',
          'Smart chatbot',
          'Workflow automation',
          'Not sure yet',
          'Multiple services'
        ]}
      />

      <label className="flex items-start gap-2 text-[10px] leading-relaxed text-gray-500">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(event) => update('consent', event.target.checked)}
          className="mt-0.5 rounded border-gray-300 text-cyan-600"
        />
        I agree that Office Pigeon may contact me about my inquiry.
      </label>

      {error ? <p className="text-xs font-semibold text-red-500">{error}</p> : null}

      <button
        type="submit"
        disabled={loading || !form.consent}
        className="flex w-full items-center justify-center rounded-2xl bg-cyan-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-cyan-100 transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Saving...' : 'Start Chat'}
      </button>
    </form>
  );
}
