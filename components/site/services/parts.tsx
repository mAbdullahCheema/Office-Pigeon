import Link from 'next/link';
import type { ReactNode } from 'react';

import { Fx } from '@/components/ui/Fx';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { contactPoints, routes } from '@/lib/routes';

/** The pieces every service page is assembled from. */

const lift = 'transform:translateY(-4px)';
const liftScale = 'transform:translateY(-4px) scale(1.02)';

export type Stat = { value: string; label: string };
export type Feature = { icon: string; tint: string; title: string; body: string };
export type Step = { n: string; title: string; body: string };

export function ServiceHero({
  badge,
  badgeIcon,
  badgeTint,
  accent,
  title,
  lede,
  stats,
  visual,
  float,
}: {
  badge: string;
  badgeIcon: string;
  badgeTint: string;
  accent: string;
  title: ReactNode;
  lede: string;
  stats: Stat[];
  visual: ReactNode;
  float: { kicker: string; value: string; valueColor: string; note: string };
}) {
  return (
    <Fx as="section" s="position:relative;z-index:1;padding:80px 20px 96px;overflow:hidden">
      <Fx
        className="two"
        s="max-width:1260px;margin:0 auto;position:relative;display:grid;grid-template-columns:minmax(0,1.02fr) minmax(0,.98fr);gap:56px;align-items:center"
      >
        <Fx className="hero-copy">
          <Fx
            s={`display:inline-flex;align-items:center;gap:10px;background:#fff;border-radius:999px;padding:8px 18px 8px 10px;box-shadow:0 10px 22px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9);font-size:13px;font-weight:700;color:${accent};animation:pop .7s cubic-bezier(.34,1.4,.64,1) both`}
          >
            <Fx
              as="span"
              s={`width:26px;height:26px;border-radius:50%;background:${badgeTint};display:flex;align-items:center;justify-content:center;font-size:12px`}
            >
              {badgeIcon}
            </Fx>
            {badge}
          </Fx>
          <Fx
            as="h1"
            s="font-size:clamp(40px,5.4vw,72px);margin-top:24px;max-width:14ch;animation:pop .8s ease-out .1s both"
          >
            {title}
          </Fx>
          <Fx
            as="p"
            s="font-size:18.5px;line-height:1.66;color:rgba(36,26,22,.66);max-width:46ch;margin:24px 0 0;animation:pop .8s ease-out .2s both;text-wrap:pretty"
          >
            {lede}
          </Fx>
          <Fx s="display:flex;gap:14px;margin-top:32px;flex-wrap:wrap;animation:pop .8s ease-out .3s both">
            <Fx
              as="a"
              href={contactPoints.demoCall}
              s="display:flex;align-items:center;gap:12px;text-decoration:none;color:#fff;font-weight:700;font-size:16px;padding:17px 22px 17px 28px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 18px 34px rgba(226,78,23,.38), inset 0 2px 3px rgba(255,255,255,.45);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
              hover={liftScale}
            >
              Book a demo
              <Fx
                as="span"
                s="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:14px"
              >
                →
              </Fx>
            </Fx>
            <Fx
              as={Link}
              href={routes.pricing}
              s="display:flex;align-items:center;text-decoration:none;color:#241A16;font-weight:700;font-size:16px;padding:17px 26px;border-radius:999px;background:#fff;box-shadow:0 14px 26px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
              hover={lift}
            >
              See pricing
            </Fx>
          </Fx>
          <Fx s="display:flex;gap:12px;margin-top:34px;flex-wrap:wrap;animation:pop .8s ease-out .4s both">
            {stats.map((stat) => (
              <Fx
                key={stat.label}
                s="background:#fff;border-radius:24px;padding:16px 22px;box-shadow:0 12px 26px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9)"
              >
                <Fx
                  s={`font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:27px;color:${accent}`}
                >
                  {stat.value}
                </Fx>
                <Fx s="font-size:12.5px;color:rgba(36,26,22,.55);margin-top:3px">{stat.label}</Fx>
              </Fx>
            ))}
          </Fx>
        </Fx>

        <Fx s="position:relative;animation:pop .9s cubic-bezier(.34,1.3,.64,1) .25s both">
          {visual}
          <Fx
            className="float"
            s="position:absolute;bottom:-64px;right:-6px;background:#fff;border-radius:24px;padding:15px 20px;box-shadow:0 20px 44px rgba(196,120,74,.22), inset 0 2px 3px rgba(255,255,255,.9);animation:floaty 8s ease-in-out infinite"
          >
            <Fx s="font-size:10.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(36,26,22,.42)">
              {float.kicker}
            </Fx>
            <Fx
              s={`font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:26px;color:${float.valueColor};line-height:1.1;margin-top:5px`}
            >
              {float.value}
            </Fx>
            <Fx s="font-size:12px;color:rgba(36,26,22,.55)">{float.note}</Fx>
          </Fx>
        </Fx>
      </Fx>
    </Fx>
  );
}

export function FeatureGrid({
  kicker,
  title,
  features,
}: {
  kicker: string;
  title: string;
  features: Feature[];
}) {
  return (
    <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
      <Fx s="max-width:1260px;margin:0 auto">
        <Fx s="text-align:center">
          <Fx s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#E8480F">
            {kicker}
          </Fx>
          <Fx as="h2" s="font-size:clamp(32px,4.2vw,52px);margin-top:14px">
            {title}
          </Fx>
        </Fx>
        <Fx className="three" s="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:34px">
          {features.map((feature) => (
            <Fx
              key={feature.title}
              className="clay"
              s="background:#fff;border-radius:30px;padding:26px 24px 28px;box-shadow:0 16px 34px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9)"
            >
              <Fx
                as="span"
                s={`width:48px;height:48px;border-radius:18px;background:${feature.tint};display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)`}
              >
                {feature.icon}
              </Fx>
              <Fx as="h3" s="font-size:19.5px;margin-top:16px">
                {feature.title}
              </Fx>
              <Fx as="p" s="font-size:14px;line-height:1.6;color:rgba(36,26,22,.62);margin:9px 0 0;text-wrap:pretty">
                {feature.body}
              </Fx>
            </Fx>
          ))}
        </Fx>
      </Fx>
    </Fx>
  );
}

export function SplitPanel({
  wash,
  slot,
  photo,
  children,
}: {
  wash: string;
  slot: string;
  photo: string;
  children: ReactNode;
}) {
  return (
    <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
      <Fx
        s={`max-width:1260px;margin:0 auto;background:${wash};border-radius:46px;padding:14px;box-shadow:inset 0 2px 4px rgba(255,255,255,.9), 0 20px 44px rgba(196,120,74,.14)`}
      >
        <Fx
          className="two"
          s="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.9fr);gap:14px;align-items:stretch"
        >
          <Fx className="pad-xl" s="padding:44px 38px">{children}</Fx>
          <Fx s="border-radius:36px;overflow:hidden;min-height:420px;background:#fff">
            <ImageSlot id={slot} placeholder={photo} sizes="(max-width: 1000px) 92vw, 600px" />
          </Fx>
        </Fx>
      </Fx>
    </Fx>
  );
}

export function StepGrid({ kicker, title, steps }: { kicker: string; title: string; steps: Step[] }) {
  return (
    <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
      <Fx s="max-width:1260px;margin:0 auto">
        <Fx s="text-align:center">
          <Fx s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#E8480F">
            {kicker}
          </Fx>
          <Fx as="h2" s="font-size:clamp(32px,4.2vw,52px);margin-top:14px">
            {title}
          </Fx>
        </Fx>
        <Fx className="four" s="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:34px">
          {steps.map((step) => (
            <Fx
              key={step.n}
              className="clay"
              s="background:#fff;border-radius:28px;padding:24px 22px 26px;box-shadow:0 14px 30px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9)"
            >
              <Fx
                as="span"
                s="width:38px;height:38px;border-radius:14px;background:linear-gradient(150deg,#FFA46A,#EF5A1F);color:#fff;font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 16px rgba(226,78,23,.28)"
              >
                {step.n}
              </Fx>
              <Fx as="h3" s="font-size:18.5px;margin-top:16px">
                {step.title}
              </Fx>
              <Fx as="p" s="font-size:13.5px;line-height:1.6;color:rgba(36,26,22,.62);margin:8px 0 0;text-wrap:pretty">
                {step.body}
              </Fx>
            </Fx>
          ))}
        </Fx>
      </Fx>
    </Fx>
  );
}

export function ClosingCta({ title, body, label = 'Book a demo call' }: { title: string; body: string; label?: string }) {
  return (
    <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 96px">
      <Fx className="pad-xl" s="max-width:1260px;margin:0 auto;background:#fff;border-radius:44px;padding:52px 46px;box-shadow:0 24px 50px rgba(196,120,74,.18), inset 0 2px 4px rgba(255,255,255,.95);display:flex;align-items:center;justify-content:space-between;gap:32px;flex-wrap:wrap">
        <Fx>
          <Fx as="h2" s="font-size:clamp(28px,3.4vw,42px);max-width:18ch">
            {title}
          </Fx>
          <Fx
            as="p"
            s="font-size:16px;line-height:1.65;color:rgba(36,26,22,.62);max-width:44ch;margin:14px 0 0;text-wrap:pretty"
          >
            {body}
          </Fx>
        </Fx>
        <Fx
          as="a"
          href={contactPoints.demoCall}
          className="cta-block"
          s="flex:none;display:flex;align-items:center;gap:12px;text-decoration:none;color:#fff;font-weight:700;font-size:16px;padding:18px 26px 18px 30px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 18px 34px rgba(226,78,23,.4), inset 0 2px 3px rgba(255,255,255,.45);transition:transform .3s cubic-bezier(.34,1.56,.64,1);animation:floaty 5s ease-in-out infinite"
          hover={liftScale}
        >
          {label}
          <Fx
            as="span"
            s="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:13px"
          >
            →
          </Fx>
        </Fx>
      </Fx>
    </Fx>
  );
}

export function PanelKicker({ children, color }: { children: ReactNode; color: string }) {
  return (
    <Fx s={`font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:${color}`}>
      {children}
    </Fx>
  );
}
