'use client';

import { useEffect, useState } from 'react';

import { PriceNote } from '@/components/site/PriceNote';
import { Fx } from '@/components/ui/Fx';

import { ClosingCta, FeatureGrid, PanelKicker, ServiceHero, SplitPanel } from './parts';

const heroStats = [
  { value: '1 ring', label: 'average pickup' },
  { value: '24/7', label: 'nights and weekends' },
  { value: '0', label: 'calls sent to voicemail' },
];

const features = [
  {
    icon: '👋',
    tint: '#EEEBFE',
    title: 'Answers in your voice',
    body: 'Your greeting, your tone, your business name — not a robot reading a menu.',
  },
  {
    icon: '🎯',
    tint: '#FFEDE3',
    title: 'Qualifies properly',
    body: 'Vehicle, address, urgency, budget — whatever you would have asked yourself.',
  },
  {
    icon: '📅',
    tint: '#E9FBF3',
    title: 'Books into your calendar',
    body: 'Checks real availability and confirms the slot before hanging up.',
  },
  {
    icon: '📲',
    tint: '#FFF4D8',
    title: 'Texts you the summary',
    body: 'Name, number, what they want and the recording — in one message.',
  },
  {
    icon: '🚨',
    tint: '#FFEDE3',
    title: 'Escalates emergencies',
    body: 'Genuine urgent jobs get transferred to your mobile straight away.',
  },
  {
    icon: '🌍',
    tint: '#EEEBFE',
    title: 'Handles overflow',
    body: 'Picks up only when you are busy, or takes every call — your choice.',
  },
];

const math = [
  { label: 'Calls missed each week', value: '12', color: '#E8480F' },
  { label: 'Typical job value', value: '$180', color: '#241A16' },
  { label: 'Recovered at just 3 a week', value: '$540', color: '#0F9C6E' },
  { label: 'Agent cost per month', value: 'from $600', color: '#5A48D6' },
];

const script = [
  { who: 'AI', text: 'Good evening, Rahman Auto Care — how can I help?' },
  { who: 'YOU', text: 'My car is making a grinding noise when I brake.' },
  { who: 'AI', text: 'Sounds like pads. Which car is it, and where are you based?' },
  { who: 'YOU', text: 'A 2019 Civic, in Jackson Heights.' },
  { who: 'AI', text: 'We cover that. Front pads are $180 fitted — Tuesday 10am works, shall I book it?' },
];

const bars = Array.from({ length: 22 }, (_, index) => ({
  height: `${18 + ((index * 37) % 40)}px`,
  duration: `${(0.7 + (index % 5) * 0.16).toFixed(2)}s`,
  delay: `${((index % 7) * 0.09).toFixed(2)}s`,
}));

function CallMockup() {
  const [step, setStep] = useState(0);
  const [seconds, setSeconds] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((current) => {
        const next = (current + 1) % script.length;
        setSeconds((elapsed) => (next === 0 ? 4 : elapsed + 6));
        return next;
      });
    }, 2100);
    return () => clearInterval(timer);
  }, []);

  const shown = script.slice(0, step + 1);

  return (
    <Fx s="background:#fff;border-radius:42px;padding:24px;box-shadow:0 34px 68px rgba(196,120,74,.26), inset 0 3px 4px rgba(255,255,255,.95)">
      <Fx s="display:flex;align-items:center;gap:12px">
        <Fx
          as="span"
          s="width:48px;height:48px;border-radius:18px;background:linear-gradient(150deg,#8F7CFF,#5A48D6);color:#fff;display:flex;align-items:center;justify-content:center;font-size:21px;flex:none;box-shadow:0 12px 22px rgba(90,72,214,.32)"
        >
          📞
        </Fx>
        <Fx as="span" s="line-height:1.3">
          <Fx as="span" className="tt" s="display:block;font-weight:800;font-size:15.5px">
            Incoming call · +1 917 ••• 4402
          </Fx>
          <Fx as="span" s="display:block;font-size:12.5px;color:rgba(36,26,22,.55)">
            Answered in 1 ring
          </Fx>
        </Fx>
        <Fx
          as="span"
          s="margin-left:auto;display:flex;align-items:center;gap:6px;font-size:11px;font-weight:800;color:#5A48D6;background:#EEEBFE;padding:7px 12px;border-radius:999px"
        >
          <Fx
            as="span"
            s="width:6px;height:6px;border-radius:50%;background:#8F7CFF;animation:glow 1.6s ease-in-out infinite"
          />
          {`0:${String(seconds).padStart(2, '0')}`}
        </Fx>
      </Fx>

      <Fx s="display:flex;align-items:center;justify-content:center;gap:4px;height:64px;margin:20px 0 4px">
        {bars.map((bar, index) => (
          <Fx
            key={index}
            as="span"
            s={`width:5px;height:${bar.height};border-radius:3px;background:linear-gradient(180deg,#8F7CFF,#5A48D6);animation:wave ${bar.duration} ease-in-out infinite;animation-delay:${bar.delay};opacity:.85`}
          />
        ))}
      </Fx>

      <Fx s="display:flex;flex-direction:column;gap:10px;margin-top:12px;min-height:180px">
        {shown.map((line, index) => (
          <Fx key={index} s="display:flex;gap:10px;align-items:flex-start;animation:pop .5s cubic-bezier(.34,1.4,.64,1) both">
            <Fx
              as="span"
              s={`width:26px;height:26px;flex:none;border-radius:10px;background:${
                line.who === 'AI' ? '#EEEBFE' : '#FFEDE3'
              };color:${
                line.who === 'AI' ? '#5A48D6' : '#E8480F'
              };display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;margin-top:2px`}
            >
              {line.who}
            </Fx>
            <Fx as="span" s="font-size:14px;line-height:1.55;color:rgba(36,26,22,.78)">
              {line.text}
            </Fx>
          </Fx>
        ))}
      </Fx>

      <Fx s="margin-top:10px;padding:14px 16px;border-radius:20px;background:#EEEBFE;display:flex;align-items:center;gap:11px">
        <Fx
          as="span"
          s="width:24px;height:24px;border-radius:50%;background:#5A48D6;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;flex:none"
        >
          ✓
        </Fx>
        <Fx as="span" s="font-size:13px;font-weight:600">
          Booked Tue 10:00 · summary texted to you
        </Fx>
      </Fx>
    </Fx>
  );
}

export function CallingAgentsView() {
  return (
    <>
      <ServiceHero
        badge="AI Calling Agents · from $600"
        badgeIcon="📞"
        badgeTint="#EEEBFE"
        accent="#5A48D6"
        title="Your phone never rings out again."
        lede="A voice agent that picks up on the first ring — while you're under a car, mid-treatment or asleep. It answers, qualifies, books, and texts you the summary."
        stats={heroStats}
        visual={<CallMockup />}
        float={{ kicker: 'Voicemail', value: 'Never', valueColor: '#5A48D6', note: 'every call gets answered' }}
      />

      <FeatureGrid
        kicker="What it does on a call"
        title="Like a receptionist who never has a bad day."
        features={features}
      />

      <SplitPanel
        wash="linear-gradient(150deg,#EEEBFE,#F6F2FF 50%,#FFF0E7)"
        slot="call-gallery"
        photo="Photo of a tradesperson mid-job, phone in pocket"
      >
        <PanelKicker color="#5A48D6">The math</PanelKicker>
        <Fx as="h2" s="font-size:clamp(30px,3.8vw,46px);margin-top:14px;max-width:15ch">
          One saved job pays for the month.
        </Fx>
        <Fx
          as="p"
          s="font-size:16.5px;line-height:1.68;color:rgba(36,26,22,.66);max-width:42ch;margin:14px 0 0;text-wrap:pretty"
        >
          Most small service businesses miss a quarter of their inbound calls. Those callers don&apos;t leave a
          voicemail — they call the next name on the list.
        </Fx>
        <Fx s="display:flex;flex-direction:column;gap:12px;margin-top:26px">
          {math.map((row) => (
            <Fx
              key={row.label}
              s="display:flex;align-items:center;justify-content:space-between;gap:16px;background:#fff;border-radius:22px;padding:18px 22px;box-shadow:0 12px 26px rgba(196,120,74,.12), inset 0 2px 3px rgba(255,255,255,.9)"
            >
              <Fx as="span" s="font-size:14.5px;font-weight:600;color:rgba(36,26,22,.72)">
                {row.label}
              </Fx>
              <Fx
                as="span"
                s={`font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:22px;color:${row.color}`}
              >
                {row.value}
              </Fx>
            </Fx>
          ))}
        </Fx>
      </SplitPanel>

      <ClosingCta
        title="Call the demo line and try to trip it up."
        body="On the demo call we point a live agent at your business and let you play the awkward customer."
      />

      <Fx as="section" s="position:relative;z-index:1;padding:0 20px 90px">
        <Fx s="max-width:1260px;margin:0 auto">
          <PriceNote />
        </Fx>
      </Fx>
    </>
  );
}
