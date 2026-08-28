'use client';

import { useEffect, useState } from 'react';

import { PriceNote } from '@/components/site/PriceNote';
import { Fx } from '@/components/ui/Fx';

import { ClosingCta, FeatureGrid, PanelKicker, ServiceHero, SplitPanel } from './parts';

const heroStats = [
  { value: '$100', label: 'per workflow, one-off' },
  { value: '1 week', label: 'typical build time' },
  { value: '24/7', label: 'runs without you' },
];

const features = [
  {
    icon: '📥',
    tint: '#FFF4D8',
    title: 'Lead routing',
    body: 'Every enquiry logged, tagged and sent to the right person in seconds.',
  },
  {
    icon: '⏰',
    tint: '#FFEDE3',
    title: 'Appointment reminders',
    body: 'SMS and WhatsApp reminders that cut no-shows without you lifting a finger.',
  },
  {
    icon: '⭐',
    tint: '#E9FBF3',
    title: 'Review requests',
    body: 'Asks happy customers for a Google review at exactly the right moment.',
  },
  {
    icon: '🔁',
    tint: '#EEEBFE',
    title: 'Quote follow-ups',
    body: 'Two nudges over a week — the reason half of quotes ever get accepted.',
  },
  {
    icon: '🧾',
    tint: '#FFF4D8',
    title: 'Invoice chasing',
    body: 'Polite, scheduled reminders until the invoice is actually paid.',
  },
  {
    icon: '📑',
    tint: '#FFEDE3',
    title: 'Sheets & CRM sync',
    body: 'One source of truth — no more copying numbers between four tabs.',
  },
];

const tools = [
  { icon: '📊', label: 'Google Sheets' },
  { icon: '📅', label: 'Google Calendar' },
  { icon: '💚', label: 'WhatsApp' },
  { icon: '✉️', label: 'Gmail & Outlook' },
  { icon: '🧾', label: 'QuickBooks' },
  { icon: '💳', label: 'Stripe' },
  { icon: '🗂️', label: 'HubSpot' },
  { icon: '📞', label: 'Twilio' },
];

/** What a workflow pack is scoped to do, not results claimed on a client's behalf. */
const savings = [
  { value: '4', label: 'workflows in a pack' },
  { value: 'Twice', label: 'reminders before an appointment' },
  { value: 'Day after', label: 'the review request goes out' },
];

const flowSteps = [
  { title: 'Form submitted', body: 'Quote request arrives from your website at 9:42pm.' },
  { title: 'Lead saved to CRM', body: 'Contact created, source tagged, owner assigned.' },
  { title: 'Instant reply sent', body: 'A friendly holding message with your price range.' },
  { title: 'You get a WhatsApp', body: 'Name, job, phone number — one tap to call back.' },
  { title: 'Follow-up in 2 days', body: 'If nobody replied, a polite nudge goes out for you.' },
  { title: 'Review requested', body: 'Once the job is marked done, a review link is sent.' },
];

function FlowMockup() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setStep((current) => (current + 1) % flowSteps.length), 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <Fx s="background:#fff;border-radius:42px;padding:24px;box-shadow:0 34px 68px rgba(196,120,74,.26), inset 0 3px 4px rgba(255,255,255,.95)">
      <Fx s="display:flex;align-items:center;gap:12px;padding-bottom:18px;border-bottom:1px solid #F6E7DC">
        <Fx
          as="span"
          s="width:44px;height:44px;border-radius:17px;background:#FFF4D8;display:flex;align-items:center;justify-content:center;font-size:20px;flex:none"
        >
          ⚙️
        </Fx>
        <Fx as="span" s="line-height:1.3">
          <Fx as="span" className="tt" s="display:block;font-weight:800;font-size:15.5px">
            New quote request
          </Fx>
          <Fx as="span" s="display:block;font-size:12.5px;color:rgba(36,26,22,.55)">
            Workflow running now
          </Fx>
        </Fx>
        <Fx
          as="span"
          s="margin-left:auto;display:flex;align-items:center;gap:6px;font-size:11px;font-weight:800;color:#E8A100;background:#FFF4D8;padding:7px 12px;border-radius:999px"
        >
          <Fx
            as="span"
            s="width:6px;height:6px;border-radius:50%;background:#E8A100;animation:glow 1.6s ease-in-out infinite"
          />
          RUNNING
        </Fx>
      </Fx>
      <Fx s="display:flex;flex-direction:column;gap:0;padding-top:18px">
        {flowSteps.map((item, index) => {
          const done = index <= step;
          return (
            <Fx key={item.title} s="display:flex;gap:14px;align-items:flex-start">
              <Fx as="span" s="display:flex;flex-direction:column;align-items:center;flex:none">
                <Fx
                  as="span"
                  s={`width:30px;height:30px;border-radius:12px;background:${
                    done ? 'linear-gradient(150deg,#FFD36A,#E8A100)' : '#FFF3EC'
                  };color:${
                    done ? '#fff' : 'rgba(36,26,22,.4)'
                  };display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:${
                    done ? '0 8px 16px rgba(232,161,0,.3)' : 'inset 0 2px 3px rgba(255,255,255,.9)'
                  };transition:background .4s, box-shadow .4s`}
                >
                  {done ? '✓' : String(index + 1)}
                </Fx>
                <Fx
                  as="span"
                  s={`width:2px;flex:1;min-height:22px;background:${
                    done ? '#FFE2A6' : '#F6E7DC'
                  };transition:background .4s`}
                />
              </Fx>
              <Fx as="span" s="padding-bottom:16px;line-height:1.45">
                <Fx
                  as="span"
                  s={`display:block;font-weight:700;font-size:14.5px;color:${
                    done ? '#241A16' : 'rgba(36,26,22,.5)'
                  };transition:color .4s`}
                >
                  {item.title}
                </Fx>
                <Fx as="span" s="display:block;font-size:13px;color:rgba(36,26,22,.55);margin-top:3px">
                  {item.body}
                </Fx>
              </Fx>
            </Fx>
          );
        })}
      </Fx>
    </Fx>
  );
}

export function AutomationsView() {
  return (
    <>
      <ServiceHero
        badge="Automations · from $100"
        badgeIcon="⚙️"
        badgeTint="#FFF4D8"
        accent="#E8A100"
        title="The follow-up you keep meaning to send."
        lede="Quiet little workflows that chase quotes, send reminders, ask for reviews and keep your sheets and CRM honest — running whether you remember them or not."
        stats={heroStats}
        visual={<FlowMockup />}
        float={{ kicker: 'Every workflow', value: 'Monitored', valueColor: '#E8A100', note: 'after we hand it over' }}
      />

      <FeatureGrid kicker="Popular workflows" title="Small jobs. Enormous relief." features={features} />

      <SplitPanel
        wash="linear-gradient(150deg,#FFF4D8,#FFFAEC 50%,#FFF0E7)"
        slot="auto-gallery"
        photo="Photo of a tidy back-office desk"
      >
        <PanelKicker color="#E8A100">Plays nicely with</PanelKicker>
        <Fx as="h2" s="font-size:clamp(30px,3.8vw,46px);margin-top:14px;max-width:15ch">
          The tools you already pay for.
        </Fx>
        <Fx
          as="p"
          s="font-size:16.5px;line-height:1.68;color:rgba(36,26,22,.66);max-width:42ch;margin:14px 0 0;text-wrap:pretty"
        >
          No migration project. We connect what you use today and leave the rest alone.
        </Fx>
        <Fx s="display:flex;flex-wrap:wrap;gap:10px;margin-top:26px">
          {tools.map((tool) => (
            <Fx
              key={tool.label}
              as="span"
              s="display:flex;align-items:center;gap:9px;font-size:13.5px;font-weight:600;color:rgba(36,26,22,.7);background:#fff;border-radius:999px;padding:11px 18px;box-shadow:0 10px 20px rgba(196,120,74,.12), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
              hover="transform:translateY(-3px)"
            >
              <Fx as="span" s="font-size:15px">
                {tool.icon}
              </Fx>
              {tool.label}
            </Fx>
          ))}
        </Fx>
        <Fx s="display:flex;gap:26px;margin-top:32px;flex-wrap:wrap">
          {savings.map((saving) => (
            <Fx key={saving.label}>
              <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:30px;color:#E8A100">
                {saving.value}
              </Fx>
              <Fx s="font-size:12.5px;color:rgba(36,26,22,.55);margin-top:4px">{saving.label}</Fx>
            </Fx>
          ))}
        </Fx>
      </SplitPanel>

      <ClosingCta
        title="Tell us the task you dread. We'll automate that one first."
        body="Most workflows are live within a week and start from $100 one-off."
      />

      <Fx as="section" s="position:relative;z-index:1;padding:0 20px 90px">
        <Fx s="max-width:1260px;margin:0 auto">
          <PriceNote />
        </Fx>
      </Fx>
    </>
  );
}
