'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import { PriceNote } from '@/components/site/PriceNote';
import { Fx } from '@/components/ui/Fx';
import { money, type ProductApp } from '@/lib/catalog';
import { routes } from '@/lib/routes';
import type { CatalogEntry } from '@/lib/site-content';
import { startTrial, trialFor, type TrialState } from '@/lib/trial';

export type ProductPageProps = {
  app: ProductApp;
  /** The catalog entry, for the plan cards. */
  entry: CatalogEntry;
  /** True when the signed-in visitor has a verified order for this product. */
  licensed: boolean;
  badge: { pill: string; note: string };
  title: string;
  lede: string;
  buyLabel: string;
  heroCard: ReactNode;
  stats: { value: string; label: string }[];
  featuresTitle: string;
  features: { icon: string; title: string; body: string }[];
  stepsTitle: string;
  steps: { n: string; title: string; body: string }[];
  planIncludes: Record<string, string[]>;
  trialPanel: { kicker: string; title: string; body: string };
  faqsTitle: string;
  faqs: { q: string; a: string }[];
  /** The dark trial panel's palette. */
  panel: { bg: string; fg: string; kicker: string; body: string; btnBg: string };
  /**
   * Products with a single plan put the trial panel beside the plan card
   * instead of running it as a band of its own.
   */
  panelBesidePlans?: boolean;
};

export function ProductPage({
  app,
  entry,
  licensed,
  badge,
  title,
  lede,
  buyLabel,
  heroCard,
  stats,
  featuresTitle,
  features,
  stepsTitle,
  steps,
  planIncludes,
  trialPanel,
  faqsTitle,
  faqs,
  panel,
  panelBesidePlans = false,
}: ProductPageProps) {
  const router = useRouter();
  const [trial, setTrial] = useState<TrialState | null>(null);

  useEffect(() => {
    // The trial is held in this browser, so it can only be read after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTrial(trialFor(app.key));
  }, [app.key]);

  const tryLabel = licensed
    ? `Open ${app.name}`
    : trial?.active
      ? `Resume trial · ${trial.daysLeft} days left`
      : trial?.expired
        ? 'Trial ended — see plans'
        : `Start ${app.trialDays}-day free trial`;

  const trialNote = licensed
    ? 'Your licence is active.'
    : trial?.exists
      ? trial.active
        ? `${trial.daysLeft} of ${trial.days} trial days left`
        : 'Your trial has ended'
      : 'Trial runs in your browser — nothing to install';

  function openApp() {
    if (!licensed && trial?.expired) {
      router.push(`${routes.order}?item=${app.itemId}`);
      return;
    }
    if (!licensed) setTrial(startTrial(app.key));
    // Products without an app of their own send you back to this page, so only
    // navigate when there is somewhere else to go.
    if (app.app !== window.location.pathname) router.push(app.app);
  }

  return (
    <>
      <Fx as="section" s="position:relative;z-index:1;padding:34px 20px 12px">
        <Fx
          className="two"
          s="max-width:1260px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1.02fr) minmax(0,.98fr);gap:22px;align-items:center"
        >
          <Fx className="hero-copy">
            <Fx s="display:inline-flex;align-items:center;gap:10px;background:#fff;border-radius:999px;padding:7px 17px 7px 8px;box-shadow:0 10px 22px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9);font-size:12.5px;font-weight:700;color:rgba(36,26,22,.7);animation:pop .7s cubic-bezier(.34,1.4,.64,1) both">
              <Fx
                as="span"
                s={`display:flex;align-items:center;gap:6px;background:${app.wash};color:${app.accent};padding:5px 12px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:.05em`}
              >
                {badge.pill}
              </Fx>
              {badge.note}
            </Fx>
            <Fx
              as="h1"
              s="font-size:clamp(36px,4.6vw,60px);margin:20px 0 0;max-width:18ch;animation:pop .8s ease-out .05s both"
            >
              {title}
            </Fx>
            <Fx
              as="p"
              s="font-size:18px;line-height:1.66;color:rgba(36,26,22,.66);max-width:50ch;margin:20px 0 0;text-wrap:pretty;animation:pop .8s ease-out .12s both"
            >
              {lede}
            </Fx>
            <Fx s="display:flex;gap:12px;margin-top:28px;flex-wrap:wrap;animation:pop .8s ease-out .2s both">
              <Fx
                as="button"
                type="button"
                onClick={openApp}
                s={`border:0;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:12px;color:#fff;font-weight:700;font-size:15.5px;padding:16px 22px 16px 26px;border-radius:999px;background:linear-gradient(180deg,${app.accent}CC,${app.accent});box-shadow:0 18px 32px ${app.accent}55, inset 0 2px 3px rgba(255,255,255,.4);transition:transform .3s cubic-bezier(.34,1.56,.64,1)`}
                hover="transform:translateY(-4px) scale(1.02)"
              >
                {tryLabel}
                <Fx
                  as="span"
                  s="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.24);display:flex;align-items:center;justify-content:center;font-size:13px"
                >
                  →
                </Fx>
              </Fx>
              <Fx
                as={Link}
                href={`${routes.order}?item=${app.itemId}`}
                s="display:flex;align-items:center;text-decoration:none;color:#241A16;font-weight:700;font-size:15.5px;padding:16px 24px;border-radius:999px;background:#fff;box-shadow:0 12px 24px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                hover="transform:translateY(-4px)"
              >
                {buyLabel}
              </Fx>
            </Fx>
            <Fx as="p" s="font-size:13px;color:rgba(36,26,22,.5);margin:14px 0 0">
              {trialNote} · Runs at <strong>{app.host}</strong>, on its own.
            </Fx>
          </Fx>

          {heroCard}
        </Fx>

        <Fx s="max-width:1260px;margin:22px auto 0;display:flex;gap:12px;flex-wrap:wrap">
          {stats.map((stat) => (
            <Fx
              key={stat.label}
              s="flex:1;min-width:min(170px, 100%);background:#fff;border-radius:24px;padding:18px 22px;box-shadow:0 14px 28px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9)"
            >
              <Fx
                s={`font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:28px;color:${app.accent}`}
              >
                {stat.value}
              </Fx>
              <Fx s="font-size:12.5px;color:rgba(36,26,22,.55);margin-top:3px">{stat.label}</Fx>
            </Fx>
          ))}
        </Fx>
      </Fx>

      <Fx as="section" s="position:relative;z-index:1;padding:56px 20px 0">
        <Fx s="max-width:1260px;margin:0 auto">
          <Fx as="h2" s="font-size:clamp(28px,3.4vw,42px);max-width:24ch">
            {featuresTitle}
          </Fx>
          <Fx className="grid6" s="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:28px">
            {features.map((feature) => (
              <Fx
                key={feature.title}
                className="clay"
                s="background:#fff;border-radius:28px;padding:26px 24px;box-shadow:0 14px 30px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9)"
              >
                <Fx
                  as="span"
                  s={`width:46px;height:46px;border-radius:16px;background:${app.wash};display:flex;align-items:center;justify-content:center;font-size:21px`}
                >
                  {feature.icon}
                </Fx>
                <Fx as="h3" s="font-size:19px;margin-top:16px">
                  {feature.title}
                </Fx>
                <Fx as="p" s="font-size:14.5px;line-height:1.62;color:rgba(36,26,22,.63);margin:9px 0 0;text-wrap:pretty">
                  {feature.body}
                </Fx>
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" s="position:relative;z-index:1;padding:56px 20px 0">
        <Fx
          s={`max-width:1260px;margin:0 auto;background:linear-gradient(150deg,${app.wash},#FFFFFF 55%,#FFF0E7);border-radius:44px;padding:44px 40px;box-shadow:inset 0 2px 4px rgba(255,255,255,.9), 0 20px 44px rgba(196,120,74,.14)`}
        >
          <Fx as="h2" s="font-size:clamp(26px,3.2vw,38px);max-width:22ch">
            {stepsTitle}
          </Fx>
          <Fx className="three" s="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:26px">
            {steps.map((step) => (
              <Fx
                key={step.n}
                s="background:#fff;border-radius:28px;padding:26px 24px;box-shadow:0 14px 28px rgba(196,120,74,.12), inset 0 2px 3px rgba(255,255,255,.9)"
              >
                <Fx
                  as="span"
                  s={`display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:${app.accent};color:#fff;font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:17px`}
                >
                  {step.n}
                </Fx>
                <Fx as="h3" s="font-size:18.5px;margin-top:15px">
                  {step.title}
                </Fx>
                <Fx as="p" s="font-size:14.5px;line-height:1.62;color:rgba(36,26,22,.63);margin:9px 0 0">
                  {step.body}
                </Fx>
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" s="position:relative;z-index:1;padding:56px 20px 0">
        <Fx
          className="two"
          s="max-width:1260px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px"
        >
          {entry.plans.map((plan) => (
            <Fx
              key={plan.id}
              s="background:#fff;border-radius:34px;padding:34px 32px;box-shadow:0 20px 42px rgba(196,120,74,.15), inset 0 2px 4px rgba(255,255,255,.95)"
            >
              <Fx
                s={`font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:${app.accent}`}
              >
                {plan.name}
              </Fx>
              <Fx s="display:flex;align-items:flex-end;gap:8px;margin-top:12px">
                <Fx
                  as="span"
                  s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:46px;letter-spacing:-0.04em"
                >
                  {money(plan.price)}
                </Fx>
                <Fx as="span" s="font-size:15px;font-weight:600;color:rgba(36,26,22,.55);padding-bottom:8px">
                  {plan.unit}
                </Fx>
              </Fx>
              <Fx as="p" s="font-size:14.5px;color:rgba(36,26,22,.6);margin:8px 0 0">
                {plan.note}
              </Fx>
              <Fx s="display:flex;flex-direction:column;gap:9px;margin-top:20px">
                {(planIncludes[plan.id] ?? []).map((item) => (
                  <Fx
                    key={item}
                    s="display:flex;align-items:flex-start;gap:10px;font-size:14.5px;line-height:1.5;color:rgba(36,26,22,.72)"
                  >
                    <Fx
                      as="span"
                      s={`width:22px;height:22px;flex:none;border-radius:50%;background:${app.wash};color:${app.accent};display:flex;align-items:center;justify-content:center;font-size:11px`}
                    >
                      ✓
                    </Fx>
                    {item}
                  </Fx>
                ))}
              </Fx>
              <Fx
                as={Link}
                href={`${routes.order}?item=${app.itemId}&plan=${plan.id}`}
                s="display:flex;align-items:center;justify-content:center;margin-top:24px;text-decoration:none;color:#fff;font-weight:700;font-size:15.5px;padding:16px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 16px 30px rgba(226,78,23,.34), inset 0 2px 3px rgba(255,255,255,.4);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                hover="transform:translateY(-3px)"
              >
                Order {plan.name}
              </Fx>
            </Fx>
          ))}

          {panelBesidePlans ? (
            <Fx
              s={`background:${panel.bg};color:${panel.fg};border-radius:34px;padding:34px 32px;display:flex;flex-direction:column;justify-content:space-between;gap:22px`}
            >
              <Fx>
                <Fx
                  s={`font-size:11.5px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:${panel.kicker}`}
                >
                  {trialPanel.kicker}
                </Fx>
                <Fx as="h2" s="font-size:clamp(24px,2.8vw,32px);max-width:20ch;margin-top:12px">
                  {trialPanel.title}
                </Fx>
                <Fx as="p" s={`font-size:15px;line-height:1.65;color:${panel.body};margin:12px 0 0;text-wrap:pretty`}>
                  {trialPanel.body}
                </Fx>
              </Fx>
              <Fx
                as="button"
                type="button"
                onClick={openApp}
                s={`border:0;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:space-between;gap:12px;color:#241A16;font-weight:700;font-size:15.5px;padding:17px 20px 17px 24px;border-radius:999px;background:${panel.btnBg};box-shadow:0 18px 32px rgba(0,0,0,.28);transition:transform .3s cubic-bezier(.34,1.56,.64,1)`}
                hover="transform:translateY(-4px)"
              >
                {tryLabel}
                <Fx
                  as="span"
                  s="width:30px;height:30px;border-radius:50%;background:rgba(36,26,22,.16);display:flex;align-items:center;justify-content:center;font-size:13px"
                >
                  →
                </Fx>
              </Fx>
            </Fx>
          ) : null}
        </Fx>
      </Fx>

      <Fx
        as="section"
        s={`position:relative;z-index:1;padding:56px 20px 0;display:${panelBesidePlans ? 'none' : 'block'}`}
      >
        <Fx
          s={`max-width:1260px;margin:0 auto;background:${panel.bg};color:${panel.fg};border-radius:44px;padding:46px 42px;display:flex;align-items:center;justify-content:space-between;gap:30px;flex-wrap:wrap`}
        >
          <Fx>
            <Fx
              s={`font-size:11.5px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:${panel.kicker}`}
            >
              {trialPanel.kicker}
            </Fx>
            <Fx as="h2" s="font-size:clamp(26px,3.2vw,38px);max-width:22ch;margin-top:12px">
              {trialPanel.title}
            </Fx>
            <Fx
              as="p"
              s={`font-size:15.5px;line-height:1.65;color:${panel.body};max-width:48ch;margin:12px 0 0;text-wrap:pretty`}
            >
              {trialPanel.body}
            </Fx>
          </Fx>
          <Fx
            as="button"
            type="button"
            className="cta-block"
            onClick={openApp}
            s={`flex:none;border:0;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:12px;color:#241A16;font-weight:700;font-size:16px;padding:18px 26px 18px 30px;border-radius:999px;background:${panel.btnBg};box-shadow:0 18px 34px rgba(0,0,0,.3);transition:transform .3s cubic-bezier(.34,1.56,.64,1)`}
            hover="transform:translateY(-4px) scale(1.02)"
          >
            {tryLabel}
            <Fx
              as="span"
              s="width:30px;height:30px;border-radius:50%;background:rgba(36,26,22,.14);display:flex;align-items:center;justify-content:center;font-size:13px"
            >
              →
            </Fx>
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" s="position:relative;z-index:1;padding:56px 20px 0">
        <Fx s="max-width:1260px;margin:0 auto">
          <Fx as="h2" s="font-size:clamp(26px,3.2vw,38px)">
            {faqsTitle}
          </Fx>
          <Fx s="display:flex;flex-direction:column;gap:10px;margin-top:24px">
            {faqs.map((faq) => (
              <Fx
                key={faq.q}
                s="background:#fff;border-radius:26px;padding:24px 26px;box-shadow:0 12px 26px rgba(196,120,74,.12), inset 0 2px 3px rgba(255,255,255,.9)"
              >
                <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:17.5px">
                  {faq.q}
                </Fx>
                <Fx
                  as="p"
                  s="font-size:14.5px;line-height:1.65;color:rgba(36,26,22,.65);margin:9px 0 0;max-width:78ch;text-wrap:pretty"
                >
                  {faq.a}
                </Fx>
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" s="position:relative;z-index:1;padding:48px 20px 90px">
        <Fx s="max-width:1260px;margin:0 auto">
          <PriceNote />
        </Fx>
      </Fx>
    </>
  );
}
