'use client';

import { useEffect, useState } from 'react';

import { PriceNote } from '@/components/site/PriceNote';
import { Fx } from '@/components/ui/Fx';

import { ClosingCta, FeatureGrid, PanelKicker, ServiceHero, SplitPanel } from './parts';

const heroStats = [
  { value: '80%+', label: 'questions answered without you' },
  { value: '<5s', label: 'average reply time' },
  { value: '24/7', label: 'including holidays' },
];

const features = [
  {
    icon: '💰',
    tint: '#FFEDE3',
    title: 'Prices and quotes',
    body: 'Answers with your real price list, and gives ranges where a job needs a look first.',
  },
  {
    icon: '🕒',
    tint: '#FFF4D8',
    title: 'Hours and areas',
    body: 'Opening times, holidays, and whether you cover their zip code — instantly.',
  },
  {
    icon: '📅',
    tint: '#E9FBF3',
    title: 'Books appointments',
    body: 'Checks your calendar, offers real slots and confirms with the customer.',
  },
  {
    icon: '🎯',
    tint: '#EEEBFE',
    title: 'Qualifies leads',
    body: 'Asks the three questions you always ask, so you only speak to serious buyers.',
  },
  {
    icon: '🤝',
    tint: '#FFEDE3',
    title: 'Hands over cleanly',
    body: 'When it is out of depth it passes the whole conversation to you, not a fresh start.',
  },
  {
    icon: '🌍',
    tint: '#E9FBF3',
    title: 'Speaks their language',
    body: 'Replies in the language the customer wrote in — English, Hindi, Urdu, Arabic, Spanish.',
  },
];

const channels = [
  {
    icon: '🌐',
    tint: '#FFEDE3',
    title: 'Your website',
    body: 'A bubble in the corner that matches your brand, not a generic widget.',
  },
  {
    icon: '💚',
    tint: '#E9FBF3',
    title: 'WhatsApp Business',
    body: 'Where most customers actually message — replies in seconds, day or night.',
  },
  {
    icon: '📸',
    tint: '#EEEBFE',
    title: 'Instagram & Facebook DMs',
    body: 'Catches the enquiries that arrive after a post does well.',
  },
  {
    icon: '📧',
    tint: '#FFF4D8',
    title: 'Email inbox',
    body: 'Drafts a reply to routine enquiries and flags the ones that need you.',
  },
];

const script = [
  { from: 'them', text: 'Hi — do you do brake pads on a Civic?' },
  { from: 'bot', text: 'We do. Front pads on a Civic are $180 fitted, about 90 minutes.' },
  { from: 'them', text: 'Can you do Saturday morning?' },
  { from: 'bot', text: 'Yes — 9:30 or 11:00 are open. Which suits?' },
  { from: 'them', text: '9:30 please.' },
  { from: 'bot', text: 'Booked. I have sent a confirmation and the workshop address.' },
];

function ChatMockup() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setStep((current) => (current + 1) % script.length), 1900);
    return () => clearInterval(timer);
  }, []);

  const shown = script.slice(0, step + 1);
  const typing = step % 2 === 0 && step < 5;

  return (
    <Fx s="background:#fff;border-radius:42px;padding:22px;box-shadow:0 34px 68px rgba(196,120,74,.26), inset 0 3px 4px rgba(255,255,255,.95)">
      <Fx s="display:flex;align-items:center;gap:12px;padding:2px 4px 16px;border-bottom:1px solid #F6E7DC">
        <Fx
          as="span"
          s="width:44px;height:44px;border-radius:17px;background:#E9FBF3;display:flex;align-items:center;justify-content:center;font-size:20px;flex:none"
        >
          💬
        </Fx>
        <Fx as="span" s="line-height:1.3">
          <Fx as="span" className="tt" s="display:block;font-weight:800;font-size:15.5px">
            Website chat
          </Fx>
          <Fx as="span" s="display:block;font-size:12.5px;color:rgba(36,26,22,.55)">
            Answering as you
          </Fx>
        </Fx>
        <Fx
          as="span"
          s="margin-left:auto;display:flex;align-items:center;gap:6px;font-size:11px;font-weight:800;color:#0F9C6E;background:#E9FBF3;padding:7px 12px;border-radius:999px"
        >
          <Fx
            as="span"
            s="width:6px;height:6px;border-radius:50%;background:#21C08B;animation:glow 1.7s ease-in-out infinite"
          />
          LIVE
        </Fx>
      </Fx>
      <Fx s="min-height:250px;padding:18px 2px 6px;display:flex;flex-direction:column;gap:10px">
        {shown.map((message, index) => {
          const bot = message.from === 'bot';
          return (
            <Fx
              key={index}
              s={`align-self:${bot ? 'flex-start' : 'flex-end'};max-width:84%;background:${
                bot ? '#FFF3EC' : 'linear-gradient(180deg,#FF8149,#EF5A1F)'
              };color:${bot ? '#241A16' : '#fff'};border-radius:${
                bot ? '18px 18px 18px 6px' : '18px 18px 6px 18px'
              };padding:12px 15px;font-size:14px;line-height:1.55;animation:pop .5s cubic-bezier(.34,1.4,.64,1) both`}
            >
              {message.text}
            </Fx>
          );
        })}
        {typing ? (
          <Fx s="align-self:flex-start;display:flex;gap:4px;background:#FFF3EC;border-radius:18px 18px 18px 6px;padding:14px 16px">
            <Fx as="span" s="width:6px;height:6px;border-radius:50%;background:#241A16;animation:tdot 1.2s infinite" />
            <Fx
              as="span"
              s="width:6px;height:6px;border-radius:50%;background:#241A16;animation:tdot 1.2s .18s infinite"
            />
            <Fx
              as="span"
              s="width:6px;height:6px;border-radius:50%;background:#241A16;animation:tdot 1.2s .36s infinite"
            />
          </Fx>
        ) : null}
      </Fx>
      <Fx s="margin-top:8px;padding:14px 16px;border-radius:20px;background:#E9FBF3;display:flex;align-items:center;gap:11px">
        <Fx
          as="span"
          s="width:24px;height:24px;border-radius:50%;background:#0F9C6E;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;flex:none"
        >
          ✓
        </Fx>
        <Fx as="span" s="font-size:13px;font-weight:600">
          Lead captured and sent to your WhatsApp
        </Fx>
      </Fx>
    </Fx>
  );
}

export function ChatbotsView() {
  return (
    <>
      <ServiceHero
        badge="Chatbots · from $300"
        badgeIcon="💬"
        badgeTint="#E9FBF3"
        accent="#0F9C6E"
        title="The same eight questions, answered forever."
        lede="Trained on your prices, hours, service area and policies. It answers on your site and WhatsApp, qualifies the lead, and hands you only the ones worth your time."
        stats={heroStats}
        visual={<ChatMockup />}
        float={{ kicker: 'Handover rule', value: 'It asks you', valueColor: '#0F9C6E', note: 'the moment it is unsure' }}
      />

      <FeatureGrid
        kicker="What it handles"
        title="It knows your business, not the internet's."
        features={features}
      />

      <SplitPanel
        wash="linear-gradient(150deg,#E9FBF3,#F4FFFA 50%,#FFF0E7)"
        slot="chat-gallery"
        photo="A phone showing the WhatsApp bot"
      >
        <PanelKicker color="#0F9C6E">Where it lives</PanelKicker>
        <Fx as="h2" s="font-size:clamp(30px,3.8vw,46px);margin-top:14px;max-width:14ch">
          One brain, every channel.
        </Fx>
        <Fx
          as="p"
          s="font-size:16.5px;line-height:1.68;color:rgba(36,26,22,.66);max-width:42ch;margin:14px 0 0;text-wrap:pretty"
        >
          Update a price once and it changes everywhere the bot speaks — no re-training, no separate scripts.
        </Fx>
        <Fx s="display:flex;flex-direction:column;gap:12px;margin-top:26px">
          {channels.map((channel) => (
            <Fx
              key={channel.title}
              s="display:flex;align-items:center;gap:14px;background:#fff;border-radius:24px;padding:18px 20px;box-shadow:0 12px 26px rgba(196,120,74,.12), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .35s cubic-bezier(.34,1.4,.64,1)"
              hover="transform:translateX(6px)"
            >
              <Fx
                as="span"
                s={`width:44px;height:44px;flex:none;border-radius:17px;background:${channel.tint};display:flex;align-items:center;justify-content:center;font-size:20px`}
              >
                {channel.icon}
              </Fx>
              <Fx as="span" s="line-height:1.4">
                <Fx as="span" s="display:block;font-weight:700;font-size:15px">
                  {channel.title}
                </Fx>
                <Fx as="span" s="display:block;font-size:13.5px;color:rgba(36,26,22,.6);margin-top:2px">
                  {channel.body}
                </Fx>
              </Fx>
            </Fx>
          ))}
        </Fx>
      </SplitPanel>

      <ClosingCta
        title="Watch it answer your real questions."
        body="Bring the five things customers always ask. We'll train it live on the call and you can try to break it."
      />

      <Fx as="section" s="position:relative;z-index:1;padding:0 20px 90px">
        <Fx s="max-width:1260px;margin:0 auto">
          <PriceNote />
        </Fx>
      </Fx>
    </>
  );
}
