'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { PriceNote } from '@/components/site/PriceNote';
import { Fx } from '@/components/ui/Fx';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { comingSoonProducts } from '@/lib/coming-soon';
import { contactPoints, routes } from '@/lib/routes';
import type { CatalogEntry, Testimonial } from '@/lib/site-content';

const heroProof = [
  'Answers calls, WhatsApp and web chat 24/7 — in your voice',
  'Starter site live in 1 day, full build in 14',
  'Fixed monthly price, cancel any time',
];

const heroFaces = [
  { initials: 'RK', tint: '#FFE0CE' },
  { initials: 'AS', tint: '#EEEBFE' },
  { initials: 'MJ', tint: '#DFF6EC' },
  { initials: 'TN', tint: '#FFF0C7' },
];

const marquee = [
  { icon: '🚗', label: 'Auto services' },
  { icon: '🧼', label: 'Cleaning crews' },
  { icon: '💇', label: 'Salons & spas' },
  { icon: '🏋️', label: 'Gyms & studios' },
  { icon: '🏡', label: 'Real estate' },
  { icon: '🏫', label: 'Schools' },
  { icon: '🍽️', label: 'Restaurants' },
];

/** The three channels the hero bot cycles through in its status ticker. */
const channels = [
  { label: 'Phone call', outcome: 'Job booked · Thu 3:00pm · in your calendar' },
  { label: 'WhatsApp', outcome: 'Deposit paid in 4 min · slot confirmed' },
  { label: 'Web chat', outcome: 'Trial class booked · tutor assigned' },
];

/** Equaliser bars on the bot's chest panel. */
const waveBars = [0, 1, 2, 3, 4, 5, 6].map((index) => `${(index * 0.11).toFixed(2)}s`);

const sceneChips = [
  {
    icon: '📞',
    tint: '#FFEDE3',
    fg: '#E8480F',
    label: 'Call at 9:41pm',
    note: 'answered on the first ring',
    position: 'left:-38px',
    top: '54px',
    duration: '7s',
    delay: '0s',
  },
  {
    icon: '💬',
    tint: '#E9FBF3',
    fg: '#0F9C6E',
    label: 'WhatsApp price ask',
    note: 'quoted in 11 seconds',
    position: 'right:-30px',
    top: '206px',
    duration: '8.5s',
    delay: '.6s',
  },
  {
    icon: '🌐',
    tint: '#EEEBFE',
    fg: '#5A48D6',
    label: 'Web chat, midnight',
    note: 'trial class booked',
    position: 'left:-24px',
    top: '346px',
    duration: '9.5s',
    delay: '1.2s',
  },
];

const academyChips = [
  'IGCSE & O Level',
  'A Level',
  'AP & SAT',
  'IB',
  'IELTS · TOEFL',
  'EmSAT · NET · MDCAT',
  'Grades 1–12',
];

const academyStats = [
  { value: '16', label: 'countries our tutors teach in' },
  { value: '25+', label: 'courses running' },
  { value: '1:1', label: 'or small groups' },
];

const steps = [
  {
    n: '1',
    title: 'Free demo call',
    body: 'Twenty minutes. We look at where enquiries are leaking today.',
  },
  {
    n: '2',
    title: 'We build it',
    body: 'Site, bot, agent or product setup — configured around your workflow.',
  },
  {
    n: '3',
    title: 'You approve',
    body: 'One round of changes, live on your domain and numbers.',
  },
  {
    n: '4',
    title: 'We maintain it',
    body: 'Hosting, tweaks and monitoring. You just answer the booked jobs.',
  },
];

const cardLift =
  'box-shadow:0 28px 54px rgba(196,120,74,.24), inset 0 2px 3px rgba(255,255,255,.9)';

export function HomeView({
  services,
  testimonials,
}: {
  services: CatalogEntry[];
  testimonials: Testimonial[];
}) {
  const [channel, setChannel] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const channelTimer = setInterval(
      () => setChannel((current) => (current + 1) % channels.length),
      3600,
    );
    const quoteTimer = setInterval(
      () => setQuoteIndex((current) => (current + 1) % testimonials.length),
      6400,
    );
    return () => {
      clearInterval(channelTimer);
      clearInterval(quoteTimer);
    };
  }, [testimonials.length]);

  const active = channels[channel];
  const quote = testimonials[quoteIndex % testimonials.length];

  return (
    <>
      <Fx as="section" s="position:relative;z-index:1;padding:80px 20px 96px;overflow:hidden">
        <Fx
          className="two"
          s="max-width:1260px;margin:0 auto;position:relative;display:grid;grid-template-columns:minmax(0,1.04fr) minmax(0,.96fr);gap:56px;align-items:center"
        >
          <Fx className="hero-copy">
            <Fx s="display:inline-flex;align-items:center;gap:9px;background:#fff;border-radius:999px;padding:7px 16px 7px 8px;box-shadow:0 10px 22px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9);font-size:12.5px;font-weight:700;color:rgba(36,26,22,.7);animation:pop .7s cubic-bezier(.34,1.4,.64,1) both">
              <Fx
                as="span"
                s="display:flex;align-items:center;gap:6px;background:#E9FBF3;color:#0F9C6E;padding:5px 11px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:.05em"
              >
                <Fx
                  as="span"
                  s="width:6px;height:6px;border-radius:50%;background:#21C08B;animation:glow 1.7s ease-in-out infinite"
                />
                TAKING AUGUST BUILDS
              </Fx>
              3 slots left this month
            </Fx>

            <Fx as="h1" s="font-size:clamp(42px,5.6vw,74px);margin-top:22px;max-width:16ch;line-height:1.03">
              <span className="w" style={{ animationDelay: '.05s' }}>
                Never
              </span>{' '}
              <span className="w" style={{ animationDelay: '.13s' }}>
                miss
              </span>{' '}
              <span className="w" style={{ animationDelay: '.21s' }}>
                another
              </span>{' '}
              <span className="w" style={{ animationDelay: '.29s', position: 'relative', display: 'inline-block' }}>
                <Fx
                  as="span"
                  s="position:absolute;left:-8px;right:-8px;bottom:4px;height:36%;background:linear-gradient(90deg,#FFD9BE,#FFC0A0);border-radius:10px;z-index:0"
                />
                <Fx
                  as="span"
                  s="position:relative;z-index:1;background:linear-gradient(120deg,#FF8149,#E8480F 60%,#B4239B);-webkit-background-clip:text;background-clip:text;color:transparent"
                >
                  customer
                </Fx>
              </span>{' '}
              <span className="w" style={{ animationDelay: '.37s' }}>
                again.
              </span>
            </Fx>

            <Fx
              as="p"
              s="font-size:19px;line-height:1.6;color:rgba(36,26,22,.7);max-width:44ch;margin:22px 0 0;animation:pop .8s ease-out .45s both;text-wrap:pretty"
            >
              We build and run the AI that answers every call, reply and enquiry for you — website, chatbot, calling
              agent and automations. Live in 14 days, handled end to end.
            </Fx>

            <Fx s="display:flex;flex-direction:column;gap:11px;margin-top:24px;animation:pop .8s ease-out .5s both">
              {heroProof.map((proof) => (
                <Fx
                  key={proof}
                  s="display:flex;align-items:center;gap:11px;font-size:15px;font-weight:600;color:rgba(36,26,22,.78)"
                >
                  <Fx
                    as="span"
                    s="width:22px;height:22px;border-radius:50%;background:#E9FBF3;color:#0F9C6E;display:flex;align-items:center;justify-content:center;font-size:12px;flex:none"
                  >
                    ✓
                  </Fx>
                  {proof}
                </Fx>
              ))}
            </Fx>

            <Fx s="display:flex;gap:14px;margin-top:30px;flex-wrap:wrap;animation:pop .8s ease-out .55s both">
              <Fx
                as="a"
                href={contactPoints.demoCall}
                s="display:flex;align-items:center;gap:12px;text-decoration:none;color:#fff;font-weight:700;font-size:16.5px;padding:18px 22px 18px 30px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 18px 34px rgba(226,78,23,.38), inset 0 2px 3px rgba(255,255,255,.45), inset 0 -6px 12px rgba(150,40,0,.22);transition:transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s"
                hover="transform:translateY(-4px) scale(1.02);box-shadow:0 26px 44px rgba(226,78,23,.46)"
                active="transform:translateY(2px) scale(.98)"
              >
                Book a free 15-min demo
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
                s="display:flex;align-items:center;gap:12px;text-decoration:none;color:#241A16;font-weight:700;font-size:16px;padding:18px 26px 18px 18px;border-radius:999px;background:#fff;box-shadow:0 14px 26px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s"
                hover="transform:translateY(-4px);box-shadow:0 22px 38px rgba(196,120,74,.22)"
              >
                <Fx
                  as="span"
                  s="width:34px;height:34px;border-radius:50%;background:#FFEDE3;color:#E8480F;display:flex;align-items:center;justify-content:center;font-size:12px"
                >
                  ▶
                </Fx>
                See what we build
              </Fx>
            </Fx>

            <Fx s="display:flex;align-items:center;gap:16px;margin-top:26px;flex-wrap:wrap;animation:pop .8s ease-out .65s both">
              <Fx s="display:flex;align-items:center">
                {heroFaces.map((face) => (
                  <Fx
                    key={face.initials}
                    as="span"
                    s={`width:36px;height:36px;border-radius:50%;background:${face.tint};border:3px solid #fff;margin-left:-10px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:rgba(36,26,22,.6);box-shadow:0 6px 14px rgba(196,120,74,.18)`}
                  >
                    {face.initials}
                  </Fx>
                ))}
              </Fx>
              <Fx s="line-height:1.35">
                <Fx s="font-size:14px;font-weight:700;color:#241A16">
                  <Fx as="span" s="color:#E8A33C;letter-spacing:1px">
                    ★★★★★
                  </Fx>{' '}
                  100+ five-star reviews
                </Fx>
                <Fx s="font-size:12.5px;color:rgba(36,26,22,.55)">
                  Businesses in 9 countries run on Office Pigeon
                </Fx>
              </Fx>
            </Fx>
          </Fx>

          <Fx s="position:relative;animation:pop .9s cubic-bezier(.34,1.3,.64,1) .25s both">
            <Fx className="scene">
              <Fx className="scene-stage">
                {/* Signal rings pulsing out from behind the bot. */}
                {[
                  { color: 'rgba(232,72,15,.22)', delay: '0s' },
                  { color: 'rgba(90,72,214,.2)', delay: '1.5s' },
                  { color: 'rgba(33,192,139,.2)', delay: '3s' },
                ].map((ripple) => (
                  <Fx
                    key={ripple.delay}
                    s={`position:absolute;left:50%;top:150px;width:340px;height:340px;margin-left:-170px;border-radius:50%;border:2px solid ${ripple.color};animation:ring 4.6s ease-out ${ripple.delay} infinite`}
                  />
                ))}
                <Fx s="position:absolute;left:50%;bottom:52px;width:300px;height:44px;margin-left:-150px;border-radius:50%;background:radial-gradient(ellipse,rgba(150,80,40,.24),rgba(150,80,40,0) 70%)" />

                <Fx s="position:absolute;left:50%;bottom:70px;width:268px;margin-left:-134px;animation:bob 5.2s ease-in-out infinite">
                  <Fx s="position:absolute;left:50%;top:-46px;margin-left:-3px;width:6px;height:34px;border-radius:999px;background:linear-gradient(180deg,#FFB086,#E8480F)" />
                  <Fx s="position:absolute;left:50%;top:-62px;margin-left:-9px;width:18px;height:18px;border-radius:50%;background:#FF8149;box-shadow:0 0 0 8px rgba(255,129,73,.18), 0 0 22px rgba(255,129,73,.7);animation:glow 1.8s ease-in-out infinite" />

                  {/* Head */}
                  <Fx s="position:relative;width:214px;margin:0 auto;height:168px;border-radius:60px;background:linear-gradient(160deg,#FFFFFF 30%,#FFEFE6);box-shadow:0 30px 54px rgba(150,80,40,.24), inset 0 4px 6px rgba(255,255,255,.95), inset 0 -12px 22px rgba(196,120,74,.12)">
                    <Fx s="position:absolute;left:-11px;right:-11px;top:-18px;height:66px;border-radius:999px 999px 0 0;border:12px solid #E7D5CB;border-bottom:0;box-sizing:border-box" />
                    <Fx s="position:absolute;left:-27px;top:56px;width:36px;height:60px;border-radius:16px;background:linear-gradient(160deg,#8F7CFF,#5A48D6);box-shadow:0 10px 20px rgba(90,72,214,.34), inset 0 2px 3px rgba(255,255,255,.4)" />
                    <Fx s="position:absolute;right:-27px;top:56px;width:36px;height:60px;border-radius:16px;background:linear-gradient(160deg,#8F7CFF,#5A48D6);box-shadow:0 10px 20px rgba(90,72,214,.34), inset 0 2px 3px rgba(255,255,255,.4)" />
                    <Fx s="position:absolute;left:-8px;top:106px;width:74px;height:8px;border-radius:999px;background:#5A48D6;transform:rotate(30deg);transform-origin:left center" />
                    <Fx s="position:absolute;left:52px;top:140px;width:17px;height:17px;border-radius:50%;background:#241A16;box-shadow:0 0 0 4px rgba(90,72,214,.2)" />

                    <Fx s="position:absolute;inset:22px 20px;border-radius:44px;background:linear-gradient(165deg,#3A2B25,#241A16 55%);box-shadow:inset 0 3px 8px rgba(0,0,0,.5)">
                      <Fx s="position:absolute;inset:0;border-radius:44px;background:linear-gradient(150deg,rgba(255,255,255,.16),rgba(255,255,255,0) 46%)" />
                      <Fx s="position:absolute;left:0;right:0;top:44px;display:flex;justify-content:center;gap:30px">
                        <Fx as="span" s="width:26px;height:30px;border-radius:14px;background:#7BE8C0;box-shadow:0 0 18px rgba(123,232,192,.8);animation:blink 5s ease-in-out infinite" />
                        <Fx as="span" s="width:26px;height:30px;border-radius:14px;background:#7BE8C0;box-shadow:0 0 18px rgba(123,232,192,.8);animation:blink 5s ease-in-out infinite" />
                      </Fx>
                      <Fx s="position:absolute;left:50%;bottom:24px;margin-left:-22px;width:44px;height:16px;border-radius:0 0 30px 30px;border-bottom:5px solid rgba(123,232,192,.75);border-left:5px solid rgba(123,232,192,.22);border-right:5px solid rgba(123,232,192,.22)" />
                    </Fx>
                  </Fx>

                  <Fx s="width:46px;height:20px;margin:-4px auto 0;background:#F3E3DA;border-radius:0 0 12px 12px" />

                  {/* Body */}
                  <Fx s="position:relative;width:250px;margin:0 auto;height:172px;border-radius:52px 52px 40px 40px;background:linear-gradient(160deg,#FFFFFF 28%,#FFEFE6);box-shadow:0 34px 60px rgba(150,80,40,.26), inset 0 4px 6px rgba(255,255,255,.95), inset 0 -14px 24px rgba(196,120,74,.12)">
                    <Fx s="position:absolute;left:-34px;top:26px;width:30px;height:112px;border-radius:999px;background:linear-gradient(180deg,#FFFFFF,#FFE7DA);box-shadow:0 12px 22px rgba(150,80,40,.18);transform-origin:top center;animation:armType 1.1s ease-in-out infinite" />
                    <Fx s="position:absolute;right:-40px;top:22px;width:30px;height:104px;border-radius:999px;background:linear-gradient(180deg,#FFFFFF,#FFE7DA);box-shadow:0 12px 22px rgba(150,80,40,.18);transform-origin:top center;animation:armWave 2.4s ease-in-out infinite" />

                    <Fx s="position:absolute;left:50%;top:30px;margin-left:-79px;width:158px;height:70px;border-radius:22px;background:#241A16;box-shadow:inset 0 3px 8px rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;gap:6px">
                      {waveBars.map((delay) => (
                        <Fx
                          key={delay}
                          as="span"
                          s={`width:7px;height:38px;border-radius:4px;background:linear-gradient(180deg,#FFB86A,#EF5A1F);animation:waveBar .9s ease-in-out ${delay} infinite`}
                        />
                      ))}
                    </Fx>

                    <Fx s="position:absolute;left:0;right:0;bottom:34px;display:flex;justify-content:center;gap:9px">
                      <Fx as="span" s="width:10px;height:10px;border-radius:50%;background:#21C08B;animation:glow 1.6s ease-in-out infinite" />
                      <Fx as="span" s="width:10px;height:10px;border-radius:50%;background:#FFD9BE" />
                      <Fx as="span" s="width:10px;height:10px;border-radius:50%;background:#EAE5FF" />
                    </Fx>
                  </Fx>
                </Fx>

                {sceneChips.map((chip) => (
                  <Fx
                    key={chip.label}
                    s={`position:absolute;${chip.position};top:${chip.top};display:flex;align-items:center;gap:10px;background:#fff;border-radius:999px;padding:11px 16px 11px 12px;box-shadow:0 18px 34px rgba(150,80,40,.18), inset 0 2px 3px rgba(255,255,255,.9);animation:floaty ${chip.duration} ease-in-out ${chip.delay} infinite`}
                  >
                    <Fx
                      as="span"
                      s={`width:32px;height:32px;border-radius:50%;background:${chip.tint};color:${chip.fg};display:flex;align-items:center;justify-content:center;font-size:15px;flex:none`}
                    >
                      {chip.icon}
                    </Fx>
                    <Fx as="span" s="line-height:1.25;white-space:nowrap">
                      <Fx as="span" s="display:block;font-size:13px;font-weight:700">
                        {chip.label}
                      </Fx>
                      <Fx as="span" s="display:block;font-size:11px;color:rgba(36,26,22,.5)">
                        {chip.note}
                      </Fx>
                    </Fx>
                    <Fx
                      as="span"
                      s="width:20px;height:20px;border-radius:50%;background:#E9FBF3;color:#0F9C6E;display:flex;align-items:center;justify-content:center;font-size:11px;flex:none"
                    >
                      ✓
                    </Fx>
                  </Fx>
                ))}

                <Fx
                  aria-live="polite"
                  s="position:absolute;left:50%;bottom:-6px;width:400px;max-width:calc(100vw - 52px);margin-left:-200px;background:#fff;border-radius:24px;padding:14px 18px;display:flex;align-items:center;gap:12px;box-shadow:0 22px 44px rgba(150,80,40,.2), inset 0 2px 3px rgba(255,255,255,.9)"
                >
                  <Fx
                    as="span"
                    s="width:8px;height:8px;border-radius:50%;background:#21C08B;flex:none;animation:glow 1.7s ease-in-out infinite"
                  />
                  <Fx as="span" s="min-width:0;line-height:1.35">
                    <Fx
                      as="span"
                      s="display:block;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:rgba(36,26,22,.4)"
                    >
                      {active.label} · just now
                    </Fx>
                    <Fx as="span" s="display:block;font-size:14px;font-weight:700;color:#241A16;text-wrap:pretty">
                      {active.outcome}
                    </Fx>
                  </Fx>
                </Fx>
              </Fx>
            </Fx>

            <Fx
              className="float"
              s="position:absolute;top:0;right:-14px;background:#fff;border-radius:24px;padding:14px 20px;box-shadow:0 20px 44px rgba(196,120,74,.2), inset 0 2px 3px rgba(255,255,255,.9);animation:floaty 10s ease-in-out infinite reverse;z-index:2"
            >
              <Fx s="font-size:10.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(36,26,22,.42)">
                Last night
              </Fx>
              <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:26px;color:#E8480F;line-height:1.1;margin-top:4px">
                7 leads
              </Fx>
              <Fx s="font-size:12px;color:rgba(36,26,22,.55)">captured while closed</Fx>
            </Fx>
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:56px 0 86px;overflow:hidden">
        <Fx s="max-width:1260px;margin:0 auto 24px;padding:0 26px;display:flex;align-items:center;gap:16px">
          <Fx
            as="span"
            s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:rgba(36,26,22,.4);white-space:nowrap"
          >
            Quietly running the back office for
          </Fx>
          <Fx as="span" s="flex:1;height:1px;background:linear-gradient(90deg,rgba(36,26,22,.14),rgba(36,26,22,0))" />
        </Fx>
        <Fx s="display:flex;overflow:hidden;mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)">
          <Fx s="display:flex;gap:14px;padding-right:14px;animation:slide 40s linear infinite;flex:none">
            {[...marquee, ...marquee].map((entry, index) => (
              <Fx
                key={`${entry.label}-${index}`}
                as="span"
                s="display:flex;align-items:center;gap:10px;white-space:nowrap;background:#fff;border-radius:999px;padding:13px 22px;font-size:14.5px;font-weight:700;color:rgba(36,26,22,.6);box-shadow:0 10px 22px rgba(196,120,74,.12), inset 0 2px 3px rgba(255,255,255,.9)"
              >
                <Fx as="span" s="font-size:16px">
                  {entry.icon}
                </Fx>
                {entry.label}
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:1260px;margin:0 auto">
          <Fx s="display:flex;align-items:flex-end;justify-content:space-between;gap:30px;flex-wrap:wrap">
            <Fx>
              <Fx s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#E8480F">
                Our services
              </Fx>
              <Fx as="h2" s="font-size:clamp(32px,4.2vw,54px);margin-top:14px;max-width:18ch">
                The work we run for you.
              </Fx>
            </Fx>
            <Fx
              as={Link}
              href={routes.pricing}
              s="display:flex;align-items:center;gap:10px;text-decoration:none;color:#241A16;font-weight:700;font-size:14.5px;background:#fff;padding:14px 22px;border-radius:999px;box-shadow:0 12px 24px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
              hover="transform:translateY(-3px)"
            >
              Compare pricing <Fx as="span" s="color:#E8480F">→</Fx>
            </Fx>
          </Fx>

          <Fx className="four" s="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:34px">
            {services.map((service) => (
              <Fx
                key={service.itemId}
                as={Link}
                className="clay"
                href={service.href}
                s="text-decoration:none;color:#241A16;background:#fff;border-radius:32px;padding:26px 24px 28px;display:flex;flex-direction:column;box-shadow:0 16px 34px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9)"
                hover={cardLift}
              >
                <Fx
                  as="span"
                  s={`width:50px;height:50px;border-radius:19px;background:${service.tint};display:flex;align-items:center;justify-content:center;font-size:23px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)`}
                >
                  {service.icon}
                </Fx>
                <Fx as="h3" s="font-size:21px;margin-top:18px">
                  {service.name}
                </Fx>
                <Fx
                  as="p"
                  s="font-size:14px;line-height:1.6;color:rgba(36,26,22,.62);margin:9px 0 20px;text-wrap:pretty"
                >
                  {service.body}
                </Fx>
                <Fx
                  as="span"
                  s="margin-top:auto;display:inline-block;width:fit-content;font-size:12.5px;font-weight:700;color:#E8480F;background:#FFEDE3;padding:7px 14px;border-radius:999px"
                >
                  {service.tagline}
                </Fx>
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:1260px;margin:0 auto;background:linear-gradient(150deg,#EEEBFE,#F6F2FF 48%,#FFF0E7);border-radius:44px;padding:14px;box-shadow:inset 0 2px 4px rgba(255,255,255,.9), 0 20px 44px rgba(196,120,74,.14)">
          <Fx
            className="two"
            s="display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:14px;align-items:stretch"
          >
            <Fx className="pad-xl" s="padding:44px 38px">
              <Fx s="display:inline-flex;align-items:center;gap:9px;background:#fff;border-radius:999px;padding:8px 16px 8px 9px;font-size:12.5px;font-weight:700;color:#5A48D6;box-shadow:0 8px 18px rgba(120,90,220,.16)">
                <Fx
                  as="span"
                  s="width:24px;height:24px;border-radius:50%;background:#EEEBFE;display:flex;align-items:center;justify-content:center;font-size:12px"
                >
                  📚
                </Fx>
                Office Pigeon Academy
              </Fx>
              <Fx as="h2" s="font-size:clamp(30px,3.8vw,48px);margin-top:18px;max-width:16ch">
                Learn smarter. Achieve more. Succeed globally.
              </Fx>
              <Fx
                as="p"
                s="font-size:16.5px;line-height:1.68;color:rgba(36,26,22,.66);max-width:42ch;margin:16px 0 0;text-wrap:pretty"
              >
                Live one-to-one and small-group tutoring on British, American, Canadian, Australian, Pakistani and GCC
                curricula — IGCSE, A Level, SAT, IELTS and entrance exams — taught by specialist tutors to students in
                sixteen countries.
              </Fx>
              <Fx s="display:flex;gap:10px;margin-top:26px;flex-wrap:wrap">
                {academyChips.map((chip) => (
                  <Fx
                    key={chip}
                    as="span"
                    s="font-size:13px;font-weight:600;color:rgba(36,26,22,.68);background:#fff;border-radius:999px;padding:10px 16px;box-shadow:0 8px 16px rgba(120,90,220,.12), inset 0 2px 3px rgba(255,255,255,.9)"
                  >
                    {chip}
                  </Fx>
                ))}
              </Fx>
              <Fx s="display:flex;gap:28px;margin-top:30px;flex-wrap:wrap">
                {academyStats.map((stat) => (
                  <Fx key={stat.label}>
                    <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:32px;color:#5A48D6">
                      {stat.value}
                    </Fx>
                    <Fx s="font-size:12.5px;color:rgba(36,26,22,.55);margin-top:4px">{stat.label}</Fx>
                  </Fx>
                ))}
              </Fx>
              <Fx
                as={Link}
                href={routes.academy}
                s="display:inline-flex;align-items:center;gap:12px;margin-top:30px;text-decoration:none;color:#fff;font-weight:700;font-size:15.5px;padding:16px 22px 16px 26px;border-radius:999px;background:linear-gradient(180deg,#8F7CFF,#5A48D6);box-shadow:0 18px 32px rgba(90,72,214,.36), inset 0 2px 3px rgba(255,255,255,.4);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                hover="transform:translateY(-4px) scale(1.02)"
              >
                Visit the Academy
                <Fx
                  as="span"
                  s="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.24);display:flex;align-items:center;justify-content:center;font-size:13px"
                >
                  →
                </Fx>
              </Fx>

              {/* The professional track sits under the school pitch: same
                  Academy, different audience and a different billing model. */}
              <Fx
                as={Link}
                href={routes.appliedAi}
                s="display:flex;align-items:center;gap:14px;margin-top:22px;text-decoration:none;color:#241A16;background:#fff;border-radius:26px;padding:18px 22px;box-shadow:0 14px 30px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                hover="transform:translateY(-3px)"
              >
                <Fx
                  as="span"
                  s="width:42px;height:42px;flex:none;border-radius:16px;background:#EEEBFE;display:flex;align-items:center;justify-content:center;font-size:20px"
                >
                  🤖
                </Fx>
                <Fx s="flex:1;line-height:1.45">
                  <Fx s="font-weight:700;font-size:15.5px">Adults: Applied AI Engineering</Fx>
                  <Fx s="font-size:13px;color:rgba(36,26,22,.58);margin-top:2px">
                    16 weeks, one-to-one, from $25/hour — first session free.
                  </Fx>
                </Fx>
                <Fx as="span" s="font-size:15px;color:#E8480F;flex:none">
                  →
                </Fx>
              </Fx>
            </Fx>
            <Fx s="border-radius:34px;overflow:hidden;min-height:360px;background:#fff">
              <ImageSlot id="home-academy" placeholder="A student in a live online class" sizes="(max-width: 1000px) 92vw, 600px" />
            </Fx>
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:1260px;margin:0 auto">
          <Fx s="display:flex;align-items:flex-end;justify-content:space-between;gap:30px;flex-wrap:wrap">
            <Fx>
              <Fx s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#E8480F">
                Our products
              </Fx>
              <Fx as="h2" s="font-size:clamp(32px,4.2vw,54px);margin-top:14px;max-width:18ch">
                Four tools, still in build.
              </Fx>
            </Fx>
            <Fx
              as={Link}
              href={routes.products}
              s="display:flex;align-items:center;gap:10px;text-decoration:none;color:#241A16;font-weight:700;font-size:14.5px;background:#fff;padding:14px 22px;border-radius:999px;box-shadow:0 12px 24px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
              hover="transform:translateY(-3px)"
            >
              See what is coming <Fx as="span" s="color:#E8480F">→</Fx>
            </Fx>
          </Fx>

          <Fx className="four" s="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:34px">
            {comingSoonProducts.map((product) => (
              <Fx
                key={product.itemId}
                as={Link}
                className="clay"
                href={product.page}
                s="text-decoration:none;color:#241A16;background:#fff;border-radius:32px;padding:26px 24px 28px;display:flex;flex-direction:column;box-shadow:0 16px 34px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9)"
                hover={cardLift}
              >
                <Fx
                  as="span"
                  s={`width:50px;height:50px;border-radius:19px;background:${product.tint};display:flex;align-items:center;justify-content:center;font-size:23px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)`}
                >
                  {product.icon}
                </Fx>
                <Fx as="h3" s="font-size:21px;margin-top:18px">
                  {product.name}
                </Fx>
                <Fx
                  as="p"
                  s="font-size:14px;line-height:1.6;color:rgba(36,26,22,.62);margin:9px 0 20px;text-wrap:pretty"
                >
                  {product.line}
                </Fx>
                <Fx
                  as="span"
                  s={`margin-top:auto;display:inline-block;width:fit-content;font-size:11.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${product.accent};background:${product.tint};padding:7px 14px;border-radius:999px`}
                >
                  In build
                </Fx>
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:1260px;margin:0 auto">
          <Fx s="text-align:center">
            <Fx s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#E8480F">
              How it works
            </Fx>
            <Fx as="h2" s="font-size:clamp(32px,4.2vw,54px);margin-top:14px">
              Live in a week, not a quarter.
            </Fx>
          </Fx>
          <Fx className="four" s="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:36px">
            {steps.map((step) => (
              <Fx
                key={step.n}
                className="clay"
                s="background:#fff;border-radius:30px;padding:26px 24px 28px;box-shadow:0 16px 34px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9)"
              >
                <Fx s="display:flex;align-items:center;gap:12px">
                  <Fx
                    as="span"
                    s="width:38px;height:38px;border-radius:14px;background:linear-gradient(150deg,#FFA46A,#EF5A1F);color:#fff;font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 16px rgba(226,78,23,.28)"
                  >
                    {step.n}
                  </Fx>
                  <Fx as="span" s="height:2px;flex:1;background:#FFEDE3;border-radius:2px" />
                </Fx>
                <Fx as="h3" s="font-size:19px;margin-top:16px">
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

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 96px">
        <Fx s="max-width:1260px;margin:0 auto">
          <Fx s="display:flex;align-items:flex-end;justify-content:space-between;gap:30px;flex-wrap:wrap">
            <Fx as="h2" s="font-size:clamp(30px,3.8vw,46px);max-width:16ch">
              Families our tutors already teach.
            </Fx>
            <Fx s="display:flex;gap:10px">
              <Fx
                as="button"
                type="button"
                onClick={() =>
                  setQuoteIndex((current) => (current + testimonials.length - 1) % testimonials.length)
                }
                aria-label="Previous"
                s="width:48px;height:48px;border:0;border-radius:18px;background:#fff;color:#241A16;font-size:15px;cursor:pointer;box-shadow:0 12px 24px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .25s"
                active="transform:scale(.94)"
              >
                ←
              </Fx>
              <Fx
                as="button"
                type="button"
                onClick={() => setQuoteIndex((current) => (current + 1) % testimonials.length)}
                aria-label="Next"
                s="width:48px;height:48px;border:0;border-radius:18px;background:linear-gradient(180deg,#FF8149,#EF5A1F);color:#fff;font-size:15px;cursor:pointer;box-shadow:0 12px 24px rgba(226,78,23,.3), inset 0 2px 3px rgba(255,255,255,.4);transition:transform .25s"
                active="transform:scale(.94)"
              >
                →
              </Fx>
            </Fx>
          </Fx>
          <Fx s="background:#fff;border-radius:40px;padding:44px 44px 40px;margin-top:30px;box-shadow:0 24px 50px rgba(196,120,74,.18), inset 0 2px 4px rgba(255,255,255,.95)">
            <Fx s="font-size:15px;color:#E8A100;letter-spacing:.14em">★★★★★</Fx>
            <Fx
              as="p"
              s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:600;font-size:clamp(21px,2.5vw,30px);line-height:1.42;letter-spacing:-0.02em;margin:18px 0 0;max-width:34ch;animation:pop .5s ease-out both"
            >
              {quote.text}
            </Fx>
            <Fx s="display:flex;align-items:center;gap:14px;margin-top:28px">
              <Fx
                as="span"
                className="tt"
                s={`width:48px;height:48px;border-radius:18px;background:${quote.tint};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;color:#241A16`}
              >
                {quote.initials}
              </Fx>
              <Fx as="span" s="line-height:1.35">
                <Fx as="span" className="tt" s="display:block;font-weight:700;font-size:15px">
                  {quote.name}
                </Fx>
                <Fx as="span" s="display:block;font-size:13px;color:rgba(36,26,22,.55)">
                  {quote.role}
                </Fx>
              </Fx>
              <Fx as="span" s="margin-left:auto;display:flex;gap:6px">
                {testimonials.map((entry, index) => (
                  <Fx
                    key={entry.name}
                    as="span"
                    s={`width:8px;height:8px;border-radius:50%;background:${
                      index === quoteIndex % testimonials.length ? '#EF5A1F' : '#FFDCC9'
                    };transition:background .3s`}
                  />
                ))}
              </Fx>
            </Fx>
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" s="position:relative;z-index:1;padding:0 20px 90px">
        <Fx s="max-width:1260px;margin:0 auto">
          <PriceNote />
        </Fx>
      </Fx>
    </>
  );
}
