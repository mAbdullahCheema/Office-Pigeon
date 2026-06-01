import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Archive,
  CheckCircle2,
  Copy,
  ExternalLink,
  LogOut,
  RotateCcw,
  Search,
  ShieldAlert,
  ShoppingBag,
  Trash2
} from 'lucide-react';
import { BRAND } from '../config';

type PreviewStatus = 'live' | 'expired' | 'sold' | 'draft' | 'archived';

interface AdminConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  adminEmails: string[];
}

interface PreviewRow {
  slug: string;
  business_name: string;
  status: PreviewStatus;
  url: string;
  exists_on_disk: boolean;
  has_index: boolean;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  removed_at?: string | null;
}

const statusLabels: Record<PreviewStatus | 'all', string> = {
  all: 'All',
  live: 'Live',
  expired: 'Expired',
  sold: 'Sold',
  draft: 'Draft',
  archived: 'Archived'
};

const badgeClass: Record<PreviewStatus, string> = {
  live: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  expired: 'bg-rose-50 text-rose-700 border-rose-100',
  sold: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  draft: 'bg-amber-50 text-amber-700 border-amber-100',
  archived: 'bg-gray-100 text-gray-600 border-gray-200'
};

export default function Admin() {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [sessionToken, setSessionToken] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [previews, setPreviews] = useState<PreviewRow[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<PreviewStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    fetch('/api/admin/config')
      .then((response) => response.json())
      .then((data: AdminConfig) => {
        if (!mounted) return;
        setConfig(data);
        if (data.supabaseUrl && data.supabaseAnonKey) {
          const supabase = createClient(data.supabaseUrl, data.supabaseAnonKey);
          setClient(supabase);
          supabase.auth.getSession().then(({ data: sessionData }) => {
            const token = sessionData.session?.access_token || '';
            setSessionToken(token);
          });
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!client) return;

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      setSessionToken(session?.access_token || '');
      if (!session) {
        setAdminEmail('');
        setPreviews([]);
      }
    });

    return () => data.subscription.unsubscribe();
  }, [client]);

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${sessionToken}` }), [sessionToken]);

  const loadAdmin = async () => {
    if (!sessionToken) return;
    setLoading(true);
    setMessage('');

    const meResponse = await fetch('/api/admin/me', { headers: authHeaders });
    if (!meResponse.ok) {
      const data = await meResponse.json().catch(() => ({}));
      setMessage(data.message || 'Unable to verify admin access.');
      setAdminEmail('');
      setLoading(false);
      return;
    }

    const me = await meResponse.json();
    setAdminEmail(me.email);

    const previewsResponse = await fetch('/api/admin/previews', { headers: authHeaders });
    const data = await previewsResponse.json();
    setPreviews(data.previews || []);
    setLoading(false);
  };

  useEffect(() => {
    loadAdmin();
  }, [sessionToken]);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    if (!client) return;
    setLoading(true);
    setMessage('');

    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      setLoading(false);
    }
  };

  const updateStatus = async (preview: PreviewRow, status: PreviewStatus) => {
    setMessage('');
    const response = await fetch(`/api/admin/previews/${preview.slug}/status`, {
      method: 'PATCH',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status,
        business_name: preview.business_name,
        notes: preview.notes || ''
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.message || 'Unable to update preview.');
      return;
    }

    await loadAdmin();
  };

  const copyLink = async (url: string) => {
    const absoluteUrl = `${window.location.origin}${url}`;
    await navigator.clipboard.writeText(absoluteUrl);
    setMessage('Preview link copied.');
  };

  const filteredPreviews = previews.filter((preview) => {
    const textMatch = `${preview.slug} ${preview.business_name}`.toLowerCase().includes(query.toLowerCase());
    const statusMatch = filter === 'all' || preview.status === filter;
    return textMatch && statusMatch;
  });

  const counts = {
    live: previews.filter((preview) => preview.status === 'live').length,
    expired: previews.filter((preview) => preview.status === 'expired').length,
    sold: previews.filter((preview) => preview.status === 'sold').length,
    inactive: previews.filter((preview) => preview.status === 'draft' || preview.status === 'archived').length
  };

  if (loading && !config) {
    return <div className="min-h-screen bg-[#FAF9F6] grid place-items-center text-sm text-gray-500">Loading admin...</div>;
  }

  if (!config?.supabaseUrl || !config?.supabaseAnonKey || !client) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] grid place-items-center px-4">
        <div className="max-w-md rounded-3xl border border-amber-100 bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto text-amber-600" />
          <h1 className="mt-4 text-2xl font-black tracking-tight text-gray-950">Admin auth is not configured</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Add Supabase URL and anon key environment variables so the dashboard can sign in.
          </p>
        </div>
      </div>
    );
  }

  if (!sessionToken || !adminEmail) {
    const denied = sessionToken && message;

    return (
      <div className="min-h-screen bg-[#FAF9F6] grid place-items-center px-4 py-10">
        <form onSubmit={signIn} className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-500 text-sm font-black text-white">
              OP
            </div>
            <p className="mt-5 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-orange-600">Preview Admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950">Office Pigeon</h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">Sign in with the authorized Supabase admin account.</p>
          </div>

          <div className="mt-8 space-y-3">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-orange-200 focus:bg-white"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-orange-200 focus:bg-white"
              required
            />
          </div>

          {message ? (
            <p className={`mt-4 rounded-2xl px-4 py-3 text-xs ${denied ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-full bg-black px-5 py-3.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-orange-500 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 border-b border-black/5 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-orange-600">Office Pigeon Admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">Preview Management</h1>
            <p className="mt-2 text-sm text-gray-500">Signed in as {adminEmail}</p>
          </div>
          <button
            onClick={() => client.auth.signOut()}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:text-orange-600"
          >
            <LogOut size={14} /> Sign out
          </button>
        </header>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ['Live previews', counts.live],
            ['Expired previews', counts.expired],
            ['Sold', counts.sold],
            ['Draft/Archived', counts.inactive]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">{label}</p>
              <p className="mt-2 text-3xl font-black text-gray-950">{value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex flex-1 items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
              <Search size={16} className="text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search slug or business name"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {(['all', 'live', 'expired', 'sold', 'draft', 'archived'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`rounded-full px-3.5 py-2 text-[11px] font-bold transition ${
                    filter === status ? 'bg-black text-white' : 'bg-gray-50 text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {statusLabels[status]}
                </button>
              ))}
            </div>
          </div>

          {message ? <p className="mt-4 rounded-2xl bg-orange-50 px-4 py-3 text-xs text-orange-700">{message}</p> : null}

          <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100">
            <div className="hidden grid-cols-[1.3fr_.7fr_.7fr_1.6fr] bg-gray-50 px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 lg:grid">
              <span>Preview</span>
              <span>Status</span>
              <span>Disk</span>
              <span>Actions</span>
            </div>

            {filteredPreviews.length ? (
              filteredPreviews.map((preview) => (
                <div key={preview.slug} className="grid gap-4 border-t border-gray-100 px-4 py-4 lg:grid-cols-[1.3fr_.7fr_.7fr_1.6fr] lg:items-center">
                  <div>
                    <h2 className="font-bold text-gray-950">{preview.business_name}</h2>
                    <p className="mt-1 font-mono text-xs text-gray-400">{preview.slug}</p>
                  </div>
                  <span className={`w-fit rounded-full border px-3 py-1 text-[11px] font-bold capitalize ${badgeClass[preview.status]}`}>
                    {preview.status}
                  </span>
                  <p className="text-xs font-semibold text-gray-500">
                    {preview.exists_on_disk && preview.has_index ? 'Ready' : 'Missing index'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={preview.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-2 text-[11px] font-bold text-gray-700 hover:text-orange-600"
                    >
                      <ExternalLink size={13} /> Open
                    </a>
                    <button onClick={() => copyLink(preview.url)} className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-2 text-[11px] font-bold text-gray-700 hover:text-orange-600">
                      <Copy size={13} /> Copy
                    </button>
                    {preview.status !== 'expired' ? (
                      <button onClick={() => updateStatus(preview, 'expired')} className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-700">
                        <Trash2 size={13} /> Remove
                      </button>
                    ) : (
                      <button onClick={() => updateStatus(preview, 'live')} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700">
                        <RotateCcw size={13} /> Restore
                      </button>
                    )}
                    <button onClick={() => updateStatus(preview, 'sold')} className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-2 text-[11px] font-bold text-cyan-700">
                      <ShoppingBag size={13} /> Mark Sold
                    </button>
                    <button onClick={() => updateStatus(preview, 'archived')} className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-2 text-[11px] font-bold text-gray-700">
                      <Archive size={13} /> Archive
                    </button>
                    {preview.status !== 'live' ? (
                      <button onClick={() => updateStatus(preview, 'live')} className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-2 text-[11px] font-bold text-white">
                        <CheckCircle2 size={13} /> Live
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="border-t border-gray-100 px-4 py-12 text-center">
                <p className="text-sm font-bold text-gray-900">No previews found</p>
                <p className="mt-2 text-xs text-gray-500">Add a built Vite output under /previews/business-slug to surface it here.</p>
              </div>
            )}
          </div>
        </section>

        <p className="text-center text-[11px] text-gray-400">{BRAND.name} preview URLs are noindex and managed by Supabase status.</p>
      </div>
    </div>
  );
}
