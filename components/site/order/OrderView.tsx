'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { Fx } from '@/components/ui/Fx';
import { money } from '@/lib/catalog';
import { contactPoints, mailtoLink, routes, whatsappLink } from '@/lib/routes';
import type { CatalogEntry } from '@/lib/site-content';

const countries = [
  'United States',
  'Canada',
  'United Kingdom',
  'Ireland',
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Kuwait',
  'Bahrain',
  'Oman',
  'Pakistan',
  'India',
  'Bangladesh',
  'Australia',
  'New Zealand',
  'Somewhere else',
];

const timelines = ['As soon as possible', 'Within two weeks', 'Within a month', 'Just exploring for now'];

const stepLabels = ['Choose', 'Option', 'Details', 'Confirmed'];

const groupOrder: CatalogEntry['group'][] = ['Products', 'Services', 'Academy'];

const fieldStyle =
  'width:100%;margin-top:7px;font-family:inherit;font-size:15px;color:#241A16;background:#FFF9F5;border:0;border-radius:18px;padding:14px 16px;box-shadow:inset 0 2px 5px rgba(196,120,74,.14);outline:none';
const labelStyle =
  'display:block;font-size:12.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:rgba(36,26,22,.45)';

type Done = { ref: string; status: string; name: string; itemName: string; planName: string; price: number; unit: string; country: string };

export function OrderView({
  catalog,
  preselect,
}: {
  catalog: CatalogEntry[];
  /** Pricing and product pages deep-link straight into the flow. */
  preselect?: { item?: string; plan?: string };
}) {
  const preItem = catalog.find((entry) => entry.itemId === preselect?.item) ?? null;
  const prePlan = preItem?.plans.find((entry) => entry.id === preselect?.plan) ?? null;

  const [step, setStep] = useState(preItem ? (prePlan ? 2 : 1) : 0);
  const [itemId, setItemId] = useState<string | null>(preItem?.itemId ?? null);
  const [planId, setPlanId] = useState<string | null>(prePlan?.id ?? null);
  const [done, setDone] = useState<Done | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const item = catalog.find((entry) => entry.itemId === itemId) ?? null;
  const plan = item?.plans.find((entry) => entry.id === planId) ?? null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item || !plan) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const country = String(data.get('country') ?? '');

    setPending(true);
    setError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          itemId: item.itemId,
          planId: plan.id,
          name,
          email: String(data.get('email') ?? '').trim(),
          phone: String(data.get('phone') ?? '').trim(),
          company: String(data.get('company') ?? '').trim(),
          country,
          timeline: String(data.get('timeline') ?? ''),
          notes: String(data.get('notes') ?? '').trim(),
          consent: data.get('consent') === 'on',
          company_website: String(data.get('company_website') ?? ''),
        }),
      });

      const body = (await response.json().catch(() => null)) as
        | { ref?: string; status?: string; errors?: Record<string, string> }
        | null;

      if (!response.ok || !body?.ref) {
        setError(
          Object.values(body?.errors ?? {})[0] ?? 'That did not go through. Try again, or message us directly.',
        );
        return;
      }

      setDone({
        ref: body.ref,
        status: body.status ?? 'Awaiting confirmation',
        name,
        itemName: item.name,
        planName: plan.name,
        price: plan.price,
        unit: plan.unit,
        country,
      });
      setStep(3);
    } catch {
      setError('That did not go through. Try again, or message us directly.');
    } finally {
      setPending(false);
    }
  }

  const summaryIcon = item?.icon ?? '🧾';
  const summaryTint = item?.tint ?? '#FFF0E7';
  const summaryName = item?.name ?? 'Nothing selected yet';
  const summaryPlan = plan
    ? `${plan.name} · ${plan.note}`
    : item
      ? 'Choose an option'
      : 'Pick a service or a class';
  const summaryPrice = plan
    ? money(plan.price)
    : item
      ? `from ${money(Math.min(...item.plans.map((entry) => entry.price)))}`
      : '—';

  return (
    <>
      <Fx as="section" s="position:relative;z-index:1;padding:36px 20px 70px;overflow:hidden">
        <Fx s="max-width:1180px;margin:0 auto;position:relative">
          <Fx s="text-align:center">
            <Fx s="display:inline-flex;align-items:center;gap:10px;background:#fff;border-radius:999px;padding:8px 18px 8px 10px;box-shadow:0 10px 22px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9);font-size:13px;font-weight:700;color:#E8480F;animation:pop .7s cubic-bezier(.34,1.4,.64,1) both">
              <Fx
                as="span"
                s="width:26px;height:26px;border-radius:50%;background:#FFEDE3;display:flex;align-items:center;justify-content:center;font-size:12px"
              >
                🧾
              </Fx>
              Place an order
            </Fx>
            <Fx
              as="h1"
              s="font-size:clamp(36px,4.6vw,58px);margin:20px auto 0;max-width:20ch;animation:pop .8s ease-out .08s both"
            >
              Tell us what you need. We confirm the price before anything is charged.
            </Fx>
            <Fx
              as="p"
              s="font-size:17px;line-height:1.66;color:rgba(36,26,22,.64);max-width:56ch;margin:18px auto 0;animation:pop .8s ease-out .16s both;text-wrap:pretty"
            >
              Nothing is billed here. Submit the order, and a real person replies with a firm quote — usually within a
              few hours.
            </Fx>
          </Fx>

          <Fx s="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:34px">
            {stepLabels.map((label, index) => {
              const active = index === step;
              const past = index < step;
              return (
                <Fx
                  key={label}
                  s={`display:flex;align-items:center;gap:10px;background:${
                    active ? 'linear-gradient(180deg,#FF8149,#EF5A1F)' : '#fff'
                  };color:${
                    active ? '#fff' : past ? '#241A16' : 'rgba(36,26,22,.5)'
                  };border-radius:999px;padding:11px 18px 11px 11px;font-size:13.5px;font-weight:700;box-shadow:${
                    active
                      ? '0 12px 24px rgba(226,78,23,.3), inset 0 2px 3px rgba(255,255,255,.4)'
                      : '0 8px 18px rgba(196,120,74,.12), inset 0 2px 3px rgba(255,255,255,.9)'
                  };transition:background .35s, color .35s`}
                >
                  <Fx
                    as="span"
                    s={`width:26px;height:26px;border-radius:50%;background:${
                      active ? 'rgba(255,255,255,.26)' : past ? '#E9FBF3' : '#FFF0E7'
                    };color:${
                      active ? '#fff' : past ? '#0F9C6E' : 'rgba(36,26,22,.5)'
                    };display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800`}
                  >
                    {past ? '✓' : String(index + 1)}
                  </Fx>
                  {label}
                </Fx>
              );
            })}
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" s="position:relative;z-index:1;padding:0 20px 96px">
        <Fx
          className="split"
          s="max-width:1180px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,.9fr);gap:20px;align-items:start"
        >
          <Fx s="background:#fff;border-radius:40px;padding:36px 34px 38px;box-shadow:0 26px 54px rgba(196,120,74,.2), inset 0 2px 4px rgba(255,255,255,.95)">
            {step === 0 ? (
              <Fx s="animation:pop .4s cubic-bezier(.34,1.4,.64,1) both">
                <Fx as="h2" s="font-size:26px">
                  What are you ordering?
                </Fx>
                <Fx as="p" s="font-size:14.5px;line-height:1.6;color:rgba(36,26,22,.6);margin:9px 0 0">
                  Pick one to start. You can add more on the call — bundles are usually cheaper than the sum of the
                  parts.
                </Fx>
                {groupOrder.map((group) => {
                  const items = catalog.filter((entry) => entry.group === group);
                  if (items.length === 0) return null;
                  return (
                    <Fx key={group} s="margin-top:28px">
                      <Fx s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:rgba(36,26,22,.4)">
                        {group}
                      </Fx>
                      <Fx className="grid3" s="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:14px">
                        {items.map((entry) => {
                          const selected = itemId === entry.itemId;
                          const from =
                            entry.plans.length > 1
                              ? `from ${money(Math.min(...entry.plans.map((p) => p.price)))}`
                              : `${money(entry.plans[0]?.price ?? 0)} ${entry.plans[0]?.unit ?? ''}`;
                          return (
                            <Fx
                              key={entry.itemId}
                              as="button"
                              type="button"
                              className="clay"
                              onClick={() => {
                                setItemId(entry.itemId);
                                setPlanId(null);
                                setStep(1);
                              }}
                              s={`text-align:left;border:0;cursor:pointer;font-family:inherit;background:${
                                selected ? '#FFF6F1' : '#fff'
                              };border-radius:26px;padding:20px 22px;box-shadow:${
                                selected
                                  ? '0 0 0 2px #EF5A1F inset, 0 14px 28px rgba(226,78,23,.16)'
                                  : '0 12px 26px rgba(196,120,74,.12), inset 0 2px 3px rgba(255,255,255,.9)'
                              };display:flex;gap:14px;align-items:flex-start;transition:background .3s, box-shadow .35s, transform .35s cubic-bezier(.34,1.4,.64,1)`}
                            >
                              <Fx
                                as="span"
                                s={`width:44px;height:44px;flex:none;border-radius:50%;background:${entry.tint};display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)`}
                              >
                                {entry.icon}
                              </Fx>
                              <Fx as="span" s="min-width:0">
                                <Fx as="span" className="tt" s="display:block;font-weight:800;font-size:15.5px;color:#241A16">
                                  {entry.name}
                                </Fx>
                                <Fx
                                  as="span"
                                  s="display:block;font-size:13px;line-height:1.5;color:rgba(36,26,22,.6);margin-top:4px"
                                >
                                  {entry.blurb}
                                </Fx>
                                <Fx
                                  as="span"
                                  s="display:block;font-size:12.5px;font-weight:700;color:#E8480F;margin-top:8px"
                                >
                                  {from}
                                </Fx>
                              </Fx>
                            </Fx>
                          );
                        })}
                      </Fx>
                    </Fx>
                  );
                })}
              </Fx>
            ) : null}

            {step === 1 && item ? (
              <Fx s="animation:pop .4s cubic-bezier(.34,1.4,.64,1) both">
                <Fx
                  as="button"
                  type="button"
                  onClick={() => setStep(0)}
                  s="border:0;cursor:pointer;font-family:inherit;font-size:13.5px;font-weight:700;color:rgba(36,26,22,.55);background:transparent;padding:0;margin-bottom:18px"
                >
                  ← Choose something else
                </Fx>
                <Fx as="h2" s="font-size:26px">
                  Which option fits?
                </Fx>
                <Fx as="p" s="font-size:14.5px;line-height:1.6;color:rgba(36,26,22,.6);margin:9px 0 0">
                  {item.blurb}
                </Fx>
                <Fx s="display:flex;flex-direction:column;gap:12px;margin-top:24px">
                  {item.plans.map((entry) => {
                    const selected = planId === entry.id;
                    return (
                      <Fx
                        key={entry.id}
                        as="button"
                        type="button"
                        className="clay"
                        onClick={() => {
                          setPlanId(entry.id);
                          setStep(2);
                        }}
                        s={`text-align:left;border:0;cursor:pointer;font-family:inherit;background:${
                          selected ? '#FFF6F1' : '#fff'
                        };border-radius:26px;padding:22px 24px;box-shadow:${
                          selected
                            ? '0 0 0 2px #EF5A1F inset, 0 14px 28px rgba(226,78,23,.16)'
                            : '0 12px 26px rgba(196,120,74,.12), inset 0 2px 3px rgba(255,255,255,.9)'
                        };display:flex;align-items:center;gap:18px;transition:background .3s, box-shadow .35s, transform .35s cubic-bezier(.34,1.4,.64,1)`}
                      >
                        <Fx as="span" s="min-width:0;flex:1">
                          <Fx as="span" className="tt" s="display:block;font-weight:800;font-size:17px;color:#241A16">
                            {entry.name}
                          </Fx>
                          <Fx as="span" s="display:block;font-size:13.5px;color:rgba(36,26,22,.6);margin-top:4px">
                            {entry.note}
                          </Fx>
                        </Fx>
                        <Fx as="span" s="text-align:right;flex:none">
                          <Fx
                            as="span"
                            s="display:block;font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:24px;color:#E8480F"
                          >
                            {money(entry.price)}
                          </Fx>
                          <Fx as="span" s="display:block;font-size:12px;color:rgba(36,26,22,.5);margin-top:2px">
                            {entry.unit}
                          </Fx>
                        </Fx>
                      </Fx>
                    );
                  })}
                </Fx>
                <Fx s="margin-top:20px;background:#FFF4D8;border-radius:22px;padding:16px 20px;font-size:13.5px;line-height:1.6;color:rgba(36,26,22,.68)">
                  Final price can vary with region, currency, scope and setup. This order requests a firm quote — you are
                  not charged now.
                </Fx>
              </Fx>
            ) : null}

            {step === 2 && item && plan ? (
              <Fx as="form" onSubmit={submit} s="animation:pop .4s cubic-bezier(.34,1.4,.64,1) both">
                <Fx
                  as="button"
                  type="button"
                  onClick={() => setStep(1)}
                  s="border:0;cursor:pointer;font-family:inherit;font-size:13.5px;font-weight:700;color:rgba(36,26,22,.55);background:transparent;padding:0;margin-bottom:18px"
                >
                  ← Change option
                </Fx>
                <Fx as="h2" s="font-size:26px">
                  Where do we send the quote?
                </Fx>
                <Fx as="p" s="font-size:14.5px;line-height:1.6;color:rgba(36,26,22,.6);margin:9px 0 0">
                  We reply by email, and on WhatsApp too if you give us a number.
                </Fx>

                <Fx className="pair" s="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:24px">
                  <Fx>
                    <Fx as="label" htmlFor="o-name" s={labelStyle}>
                      Your name
                    </Fx>
                    <Fx
                      as="input"
                      id="o-name"
                      name="name"
                      autoComplete="name"
                      placeholder="Amir Rahman"
                      required
                      s={fieldStyle}
                    />
                  </Fx>
                  <Fx>
                    <Fx as="label" htmlFor="o-company" s={labelStyle}>
                      Business or school
                    </Fx>
                    <Fx as="input" id="o-company" name="company" placeholder="Rahman Auto Care" s={fieldStyle} />
                  </Fx>
                </Fx>
                <Fx className="pair" s="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px">
                  <Fx>
                    <Fx as="label" htmlFor="o-email" s={labelStyle}>
                      Email
                    </Fx>
                    <Fx
                      as="input"
                      id="o-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@business.com"
                      required
                      s={fieldStyle}
                    />
                  </Fx>
                  <Fx>
                    <Fx as="label" htmlFor="o-phone" s={labelStyle}>
                      WhatsApp or phone
                    </Fx>
                    <Fx
                      as="input"
                      id="o-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+1 917 000 0000"
                      s={fieldStyle}
                    />
                  </Fx>
                </Fx>
                <Fx className="pair" s="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px">
                  <Fx>
                    <Fx as="label" htmlFor="o-country" s={labelStyle}>
                      Country or region
                    </Fx>
                    <Fx as="select" id="o-country" name="country" defaultValue={countries[0]} s={fieldStyle}>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </Fx>
                  </Fx>
                  <Fx>
                    <Fx as="label" htmlFor="o-when" s={labelStyle}>
                      How soon?
                    </Fx>
                    <Fx as="select" id="o-when" name="timeline" defaultValue={timelines[0]} s={fieldStyle}>
                      {timelines.map((timeline) => (
                        <option key={timeline} value={timeline}>
                          {timeline}
                        </option>
                      ))}
                    </Fx>
                  </Fx>
                </Fx>
                <Fx s="margin-top:16px">
                  <Fx as="label" htmlFor="o-notes" s={labelStyle}>
                    Anything we should know?
                  </Fx>
                  <Fx
                    as="textarea"
                    id="o-notes"
                    name="notes"
                    rows={4}
                    placeholder="We miss calls most evenings and I think we are losing jobs to it."
                    s={`${fieldStyle};resize:vertical`}
                  />
                </Fx>

                <Fx
                  as="label"
                  htmlFor="o-consent"
                  s="display:flex;gap:12px;align-items:flex-start;margin-top:20px;padding:16px 18px;border-radius:20px;background:#FFF7F1;cursor:pointer;font-size:13.5px;line-height:1.6;color:rgba(36,26,22,.7);font-weight:500"
                >
                  <Fx
                    as="input"
                    id="o-consent"
                    name="consent"
                    type="checkbox"
                    required
                    s="width:18px;height:18px;flex:none;margin-top:2px;accent-color:#EF5A1F"
                  />
                  <Fx as="span">
                    I accept the <Link href={`${routes.legal}#terms`}>Terms of Service</Link>, including the refund
                    policy — no refund once an order is placed, with one free revision round included — and the{' '}
                    <Link href={`${routes.legal}#privacy`}>Privacy Policy</Link>.
                  </Fx>
                </Fx>

                {/* Hidden from people, irresistible to bots. */}
                <Fx
                  as="input"
                  name="company_website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  s="position:absolute;left:-9999px;width:1px;height:1px;opacity:0"
                />

                {error ? (
                  <Fx role="alert" s="margin-top:16px;background:#FFEDE3;color:#B4230C;border-radius:16px;padding:13px 16px;font-size:13.5px;font-weight:600">
                    {error}
                  </Fx>
                ) : null}

                <Fx
                  as="button"
                  type="submit"
                  disabled={pending}
                  s={`width:100%;margin-top:18px;border:0;cursor:${
                    pending ? 'wait' : 'pointer'
                  };font-family:inherit;font-weight:700;font-size:16px;color:#fff;padding:18px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 18px 34px rgba(226,78,23,.38), inset 0 2px 3px rgba(255,255,255,.45);transition:transform .3s cubic-bezier(.34,1.56,.64,1);opacity:${
                    pending ? 0.7 : 1
                  }`}
                  hover="transform:translateY(-3px)"
                  active="transform:translateY(2px) scale(.99)"
                >
                  {pending ? 'Sending…' : 'Submit order request'}
                </Fx>
                <Fx
                  as="p"
                  s="font-size:12.5px;line-height:1.6;color:rgba(36,26,22,.48);margin:14px 0 0;text-align:center"
                >
                  No payment is taken now. We confirm scope and the final price with you first.
                </Fx>
              </Fx>
            ) : null}

            {step === 3 && done ? (
              <Fx
                role="status"
                s="text-align:center;padding:14px 0 4px;animation:pop .45s cubic-bezier(.34,1.4,.64,1) both"
              >
                <Fx
                  as="span"
                  s="width:76px;height:76px;margin:0 auto;border-radius:50%;background:linear-gradient(150deg,#FFA46A,#EF5A1F);color:#fff;display:flex;align-items:center;justify-content:center;font-size:33px;box-shadow:0 18px 34px rgba(226,78,23,.36), inset 0 2px 3px rgba(255,255,255,.45)"
                >
                  ✓
                </Fx>
                <Fx as="h2" s="font-size:30px;margin-top:22px">
                  Order received.
                </Fx>
                <Fx
                  as="p"
                  s="font-size:16px;line-height:1.68;color:rgba(36,26,22,.64);margin:12px auto 0;max-width:40ch;text-wrap:pretty"
                >
                  Thanks {done.name.split(' ')[0] || 'there'} — your reference is <strong>{done.ref}</strong>. We will
                  confirm the final price and next steps by email, usually within a few hours.
                </Fx>
                <Fx s="background:#FFF6F1;border-radius:26px;padding:22px 24px;margin-top:26px;text-align:left;box-shadow:inset 0 2px 5px rgba(196,120,74,.12)">
                  {[
                    { label: 'Reference', value: done.ref },
                    { label: 'Item', value: `${done.itemName} · ${done.planName}` },
                    { label: 'Indicative price', value: `${money(done.price)} ${done.unit}` },
                    { label: 'Region', value: done.country },
                    { label: 'Status', value: done.status },
                  ].map((row) => (
                    <Fx
                      key={row.label}
                      s="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:9px 0;font-size:14.5px"
                    >
                      <Fx as="span" s="color:rgba(36,26,22,.58)">
                        {row.label}
                      </Fx>
                      <Fx as="span" s="font-weight:700;text-align:right">
                        {row.value}
                      </Fx>
                    </Fx>
                  ))}
                </Fx>
                <Fx s="display:flex;gap:10px;justify-content:center;margin-top:26px;flex-wrap:wrap">
                  <Fx
                    as={Link}
                    href={routes.dashboard}
                    s="display:flex;align-items:center;gap:10px;text-decoration:none;color:#fff;font-weight:700;font-size:15px;padding:15px 24px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 16px 30px rgba(226,78,23,.36);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                    hover="transform:translateY(-3px)"
                  >
                    Track it in your dashboard
                  </Fx>
                  <Fx
                    as="a"
                    href={whatsappLink(`Hi Office Pigeon — checking on order ${done.ref}`)}
                    s="display:flex;align-items:center;gap:9px;text-decoration:none;color:#241A16;font-weight:700;font-size:15px;padding:15px 22px;border-radius:999px;background:#E9FBF3;box-shadow:inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                    hover="transform:translateY(-3px)"
                  >
                    <span>💬</span>Chase it on WhatsApp
                  </Fx>
                  <Fx
                    as="button"
                    type="button"
                    onClick={() => {
                      setStep(0);
                      setItemId(null);
                      setPlanId(null);
                      setDone(null);
                    }}
                    s="border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:15px;padding:15px 22px;border-radius:999px;background:#FFF0E7;color:#241A16;box-shadow:inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                    hover="transform:translateY(-3px)"
                  >
                    Order something else
                  </Fx>
                </Fx>
              </Fx>
            ) : null}
          </Fx>

          <Fx s="display:flex;flex-direction:column;gap:16px;position:sticky;top:110px">
            <Fx s="background:#fff;border-radius:34px;padding:26px 28px 28px;box-shadow:0 18px 40px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9)">
              <Fx s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:rgba(36,26,22,.4)">
                Your order
              </Fx>
              <Fx s="display:flex;align-items:center;gap:13px;margin-top:16px">
                <Fx
                  as="span"
                  s={`width:46px;height:46px;flex:none;border-radius:50%;background:${summaryTint};display:flex;align-items:center;justify-content:center;font-size:21px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)`}
                >
                  {summaryIcon}
                </Fx>
                <Fx as="span" s="line-height:1.35;min-width:0">
                  <Fx as="span" className="tt" s="display:block;font-weight:800;font-size:16px">
                    {summaryName}
                  </Fx>
                  <Fx as="span" s="display:block;font-size:13px;color:rgba(36,26,22,.55)">
                    {summaryPlan}
                  </Fx>
                </Fx>
              </Fx>
              <Fx s="height:1px;background:#F6E7DC;margin:20px 0" />
              <Fx s="display:flex;align-items:baseline;gap:8px">
                <Fx
                  as="span"
                  s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:34px;color:#E8480F"
                >
                  {summaryPrice}
                </Fx>
                <Fx as="span" s="font-size:13px;color:rgba(36,26,22,.55)">
                  {plan?.unit ?? ''}
                </Fx>
              </Fx>
              <Fx s="font-size:13px;line-height:1.6;color:rgba(36,26,22,.58);margin-top:12px">
                Indicative only — region, currency and scope change the final number. We confirm before any payment.
              </Fx>
            </Fx>

            <Fx s="background:linear-gradient(150deg,#FFEDE3,#FFF6F1 55%,#E9FBF3);border-radius:34px;padding:26px 28px 28px;box-shadow:inset 0 2px 4px rgba(255,255,255,.9), 0 16px 34px rgba(196,120,74,.14)">
              <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:19px">
                Rather just ask first?
              </Fx>
              <Fx as="p" s="font-size:14px;line-height:1.6;color:rgba(36,26,22,.62);margin:9px 0 18px">
                Message us and we will confirm pricing for your region before you commit to anything.
              </Fx>
              <Fx s="display:flex;flex-direction:column;gap:10px">
                {[
                  {
                    href: whatsappLink('Hi Office Pigeon — I would like to confirm pricing before ordering.'),
                    tint: '#E9FBF3',
                    icon: '💬',
                    label: `WhatsApp ${contactPoints.phone}`,
                  },
                  { href: mailtoLink('Pricing question'), tint: '#FFF0E7', icon: '✉️', label: contactPoints.email },
                  { href: contactPoints.demoCall, tint: '#EEEBFE', icon: '📅', label: 'Book a demo call' },
                ].map((entry) => (
                  <Fx
                    key={entry.label}
                    as="a"
                    href={entry.href}
                    s="display:flex;align-items:center;gap:11px;text-decoration:none;color:#241A16;font-weight:700;font-size:14.5px;background:#fff;border-radius:999px;padding:13px 18px;box-shadow:0 10px 20px rgba(196,120,74,.14);transition:transform .3s cubic-bezier(.34,1.56,.64,1);min-width:0;overflow-wrap:anywhere"
                    hover="transform:translateX(4px)"
                  >
                    <Fx
                      as="span"
                      s={`width:30px;height:30px;flex:none;border-radius:50%;background:${entry.tint};display:flex;align-items:center;justify-content:center;font-size:14px`}
                    >
                      {entry.icon}
                    </Fx>
                    {entry.label}
                  </Fx>
                ))}
              </Fx>
            </Fx>
          </Fx>
        </Fx>
      </Fx>
    </>
  );
}
