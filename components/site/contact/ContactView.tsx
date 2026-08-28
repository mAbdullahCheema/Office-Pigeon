'use client';

import { useState, type FormEvent } from 'react';

import { Fx } from '@/components/ui/Fx';
import { contactPoints } from '@/lib/routes';

const topics = ['A product', 'A service', 'Academy classes', 'Something else'];

const interests = [
  'Not sure yet — help me pick',
  'Smart School OS',
  'AI Finance',
  'AI Whiteboard',
  'AI Recipes',
  'Website',
  'Chatbot',
  'AI Calling Agent',
  'Automations',
  'Academy classes',
  'Applied AI Engineering course',
];

const channels = [
  { icon: '📞', tint: '#FFEDE3', label: 'Call or text', value: contactPoints.phone, href: contactPoints.phoneHref },
  { icon: '✉️', tint: '#E9FBF3', label: 'Email', value: contactPoints.email, href: contactPoints.emailHref },
  {
    icon: '📅',
    tint: '#EEEBFE',
    label: 'Book a slot',
    value: 'cal.com/office-pigeon',
    href: contactPoints.demoCall,
  },
];

const hours = [
  { day: 'Monday – Friday', time: '9:00 – 19:00 ET' },
  { day: 'Saturday', time: '10:00 – 15:00 ET' },
  { day: 'Sunday', time: 'Agent on duty' },
];

const fieldStyle =
  'width:100%;margin-top:7px;font-family:inherit;font-size:15px;color:#241A16;background:#FFF9F5;border:0;border-radius:18px;padding:14px 16px;box-shadow:inset 0 2px 5px rgba(196,120,74,.14);outline:none';
const labelStyle =
  'display:block;font-size:12.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:rgba(36,26,22,.45)';

export function ContactView() {
  const [topic, setTopic] = useState(0);
  const [sent, setSent] = useState(false);
  const [sentName, setSentName] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const business = String(data.get('business') ?? '').trim();
    const phone = String(data.get('phone') ?? '').trim();
    const interest = String(data.get('interest') ?? '').trim();
    const note = String(data.get('message') ?? '').trim();

    // The API sees the note plus the extra fields, so check the note itself.
    if (note.length < 10) {
      setError('Tell us a little more — a sentence is plenty.');
      return;
    }

    const details = [
      note,
      business ? `Business or school: ${business}` : '',
      phone ? `Phone or WhatsApp: ${phone}` : '',
      `Interested in: ${interest}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    setPending(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          email: String(data.get('email') ?? '').trim(),
          subject: `${topics[topic]} · ${interest}`,
          message: details,
          company_website: String(data.get('company_website') ?? ''),
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { errors?: Record<string, string> } | null;
        setError(Object.values(body?.errors ?? {})[0] ?? 'That did not send. Try again, or email us directly.');
        return;
      }

      setSentName(name.split(' ')[0] || 'there');
      setSent(true);
      form.reset();
    } catch {
      setError('That did not send. Try again, or email us directly.');
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Fx as="section" s="position:relative;z-index:1;padding:40px 20px 80px;overflow:hidden">
        <Fx
          className="two"
          s="max-width:1260px;margin:0 auto;position:relative;display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:44px;align-items:start"
        >
          <Fx>
            <Fx s="display:inline-flex;align-items:center;gap:10px;background:#fff;border-radius:999px;padding:8px 18px 8px 10px;box-shadow:0 10px 22px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9);font-size:13px;font-weight:700;color:#E8480F;animation:pop .7s cubic-bezier(.34,1.4,.64,1) both">
              <Fx
                as="span"
                s="width:26px;height:26px;border-radius:50%;background:#FFEDE3;display:flex;align-items:center;justify-content:center;font-size:12px"
              >
                ✉️
              </Fx>
              Contact
            </Fx>
            <Fx
              as="h1"
              s="font-size:clamp(38px,5vw,64px);margin-top:22px;max-width:14ch;animation:pop .8s ease-out .1s both"
            >
              Tell us what&apos;s slipping through.
            </Fx>
            <Fx
              as="p"
              s="font-size:18px;line-height:1.68;color:rgba(36,26,22,.66);max-width:42ch;margin:22px 0 0;animation:pop .8s ease-out .2s both;text-wrap:pretty"
            >
              Products, services, or a class for your child — say a little about it and the right person replies,
              usually within a few hours.
            </Fx>

            <Fx s="display:flex;flex-direction:column;gap:12px;margin-top:32px;animation:pop .8s ease-out .3s both">
              {channels.map((channel) => (
                <Fx
                  key={channel.label}
                  as="a"
                  href={channel.href}
                  className="clay"
                  s="display:flex;align-items:center;gap:15px;text-decoration:none;color:#241A16;background:#fff;border-radius:26px;padding:20px 22px;box-shadow:0 14px 30px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9)"
                >
                  <Fx
                    as="span"
                    s={`width:48px;height:48px;flex:none;border-radius:18px;background:${channel.tint};display:flex;align-items:center;justify-content:center;font-size:21px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)`}
                  >
                    {channel.icon}
                  </Fx>
                  <Fx as="span" s="line-height:1.4;min-width:0">
                    <Fx
                      as="span"
                      s="display:block;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(36,26,22,.42)"
                    >
                      {channel.label}
                    </Fx>
                    <Fx as="span" s="display:block;font-weight:700;font-size:16px;margin-top:4px">
                      {channel.value}
                    </Fx>
                  </Fx>
                  <Fx
                    as="span"
                    s="margin-left:auto;width:30px;height:30px;flex:none;border-radius:50%;background:#FFF0E7;color:#E8480F;display:flex;align-items:center;justify-content:center;font-size:13px"
                  >
                    →
                  </Fx>
                </Fx>
              ))}
            </Fx>

            <Fx s="margin-top:26px;background:linear-gradient(150deg,#EEEBFE,#F6F2FF);border-radius:30px;padding:26px 28px;box-shadow:inset 0 2px 4px rgba(255,255,255,.9), 0 14px 30px rgba(120,90,220,.14);animation:pop .8s ease-out .4s both">
              <Fx s="display:flex;align-items:center;gap:12px">
                <Fx
                  as="span"
                  s="width:42px;height:42px;border-radius:16px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:19px;box-shadow:0 8px 16px rgba(120,90,220,.18)"
                >
                  🕒
                </Fx>
                <Fx as="h2" s="font-size:20px">
                  When we&apos;re around
                </Fx>
              </Fx>
              <Fx s="display:flex;flex-direction:column;gap:9px;margin-top:18px">
                {hours.map((entry) => (
                  <Fx
                    key={entry.day}
                    s="display:flex;align-items:center;justify-content:space-between;gap:14px;font-size:14px"
                  >
                    <Fx as="span" s="color:rgba(36,26,22,.66)">
                      {entry.day}
                    </Fx>
                    <Fx as="span" s="font-weight:700">
                      {entry.time}
                    </Fx>
                  </Fx>
                ))}
              </Fx>
              <Fx as="p" s="font-size:13.5px;line-height:1.6;color:rgba(36,26,22,.58);margin:16px 0 0">
                Outside these hours our own calling agent picks up — the same one we&apos;d build for you.
              </Fx>
            </Fx>
          </Fx>

          <Fx s="animation:pop .9s cubic-bezier(.34,1.3,.64,1) .25s both">
            {sent ? (
              <Fx role="status" s="background:#fff;border-radius:42px;padding:56px 44px;text-align:center;box-shadow:0 30px 62px rgba(196,120,74,.22), inset 0 3px 4px rgba(255,255,255,.95)">
                <Fx
                  as="span"
                  s="width:74px;height:74px;margin:0 auto;border-radius:28px;background:linear-gradient(150deg,#FFA46A,#EF5A1F);color:#fff;display:flex;align-items:center;justify-content:center;font-size:32px;box-shadow:0 18px 34px rgba(226,78,23,.36), inset 0 2px 3px rgba(255,255,255,.45)"
                >
                  ✓
                </Fx>
                <Fx as="h2" s="font-size:30px;margin-top:24px">
                  Message on its way.
                </Fx>
                <Fx
                  as="p"
                  s="font-size:16px;line-height:1.68;color:rgba(36,26,22,.64);margin:14px auto 0;max-width:34ch;text-wrap:pretty"
                >
                  Thanks {sentName} — we&apos;ve got it. Expect a reply from a real person within a few hours.
                </Fx>
                <Fx s="display:flex;gap:12px;justify-content:center;margin-top:30px;flex-wrap:wrap">
                  <Fx
                    as="a"
                    href={contactPoints.demoCall}
                    s="display:flex;align-items:center;gap:10px;text-decoration:none;color:#fff;font-weight:700;font-size:15px;padding:15px 24px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 16px 30px rgba(226,78,23,.36), inset 0 2px 3px rgba(255,255,255,.45);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                    hover="transform:translateY(-3px)"
                  >
                    Book the call now
                  </Fx>
                  <Fx
                    as="button"
                    type="button"
                    onClick={() => {
                      setSent(false);
                      setSentName('');
                    }}
                    s="border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:15px;padding:15px 24px;border-radius:999px;background:#FFF0E7;color:#241A16;box-shadow:inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                    hover="transform:translateY(-3px)"
                  >
                    Send another
                  </Fx>
                </Fx>
              </Fx>
            ) : (
              <Fx
                as="form"
                onSubmit={submit}
                s="background:#fff;border-radius:42px;padding:34px 32px 36px;box-shadow:0 30px 62px rgba(196,120,74,.22), inset 0 3px 4px rgba(255,255,255,.95)"
              >
                <Fx as="h2" s="font-size:26px">
                  Send us a message
                </Fx>
                <Fx as="p" s="font-size:14.5px;line-height:1.6;color:rgba(36,26,22,.6);margin:8px 0 0">
                  No forms-to-nowhere. This lands in a real inbox.
                </Fx>

                <Fx s="margin-top:26px">
                  <Fx as="span" s={labelStyle}>
                    What&apos;s this about?
                  </Fx>
                  <Fx s="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px">
                    {topics.map((label, index) => (
                      <Fx
                        key={label}
                        as="button"
                        type="button"
                        onClick={() => setTopic(index)}
                        s={`border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:13px;padding:11px 17px;border-radius:999px;background:${
                          index === topic ? 'linear-gradient(180deg,#FF8149,#EF5A1F)' : '#FFF6F1'
                        };color:${index === topic ? '#fff' : 'rgba(36,26,22,.62)'};box-shadow:${
                          index === topic
                            ? '0 10px 20px rgba(226,78,23,.3), inset 0 2px 3px rgba(255,255,255,.4)'
                            : 'inset 0 2px 4px rgba(196,120,74,.14)'
                        };transition:background .3s, color .3s, transform .25s cubic-bezier(.34,1.56,.64,1)`}
                        hover="transform:translateY(-2px)"
                      >
                        {label}
                      </Fx>
                    ))}
                  </Fx>
                </Fx>

                <Fx className="pair" s="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:20px">
                  <Fx>
                    <Fx as="label" htmlFor="c-name" s={labelStyle}>
                      Your name
                    </Fx>
                    <Fx
                      as="input"
                      id="c-name"
                      name="name"
                      autoComplete="name"
                      placeholder="Amir Rahman"
                      required
                      s={fieldStyle}
                    />
                  </Fx>
                  <Fx>
                    <Fx as="label" htmlFor="c-business" s={labelStyle}>
                      Business or school
                    </Fx>
                    <Fx as="input" id="c-business" name="business" placeholder="Rahman Auto Care" s={fieldStyle} />
                  </Fx>
                </Fx>

                <Fx className="pair" s="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px">
                  <Fx>
                    <Fx as="label" htmlFor="c-email" s={labelStyle}>
                      Email
                    </Fx>
                    <Fx
                      as="input"
                      id="c-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@business.com"
                      required
                      s={fieldStyle}
                    />
                  </Fx>
                  <Fx>
                    <Fx as="label" htmlFor="c-phone" s={labelStyle}>
                      Phone or WhatsApp
                    </Fx>
                    <Fx
                      as="input"
                      id="c-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+1 917 000 0000"
                      s={fieldStyle}
                    />
                  </Fx>
                </Fx>

                <Fx s="margin-top:16px">
                  <Fx as="label" htmlFor="c-interest" s={labelStyle}>
                    Interested in
                  </Fx>
                  <Fx as="select" id="c-interest" name="interest" defaultValue={interests[0]} s={fieldStyle}>
                    {interests.map((interest) => (
                      <option key={interest} value={interest}>
                        {interest}
                      </option>
                    ))}
                  </Fx>
                </Fx>

                <Fx s="margin-top:16px">
                  <Fx as="label" htmlFor="c-message" s={labelStyle}>
                    What&apos;s going on?
                  </Fx>
                  <Fx
                    as="textarea"
                    id="c-message"
                    name="message"
                    rows={4}
                    required
                    placeholder="We miss calls most evenings and I think we're losing jobs to it."
                    s={`${fieldStyle};resize:vertical`}
                  />
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
                  s={`width:100%;margin-top:24px;border:0;cursor:${
                    pending ? 'wait' : 'pointer'
                  };font-family:inherit;font-weight:700;font-size:16px;color:#fff;padding:18px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 18px 34px rgba(226,78,23,.38), inset 0 2px 3px rgba(255,255,255,.45), inset 0 -6px 12px rgba(150,40,0,.22);transition:transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s;opacity:${
                    pending ? 0.7 : 1
                  }`}
                  hover="transform:translateY(-3px);box-shadow:0 26px 44px rgba(226,78,23,.46)"
                  active="transform:translateY(2px) scale(.99)"
                >
                  {pending ? 'Sending…' : 'Send message'}
                </Fx>
                <Fx
                  as="p"
                  s="font-size:12.5px;line-height:1.6;color:rgba(36,26,22,.48);margin:14px 0 0;text-align:center"
                >
                  We only use this to reply. No lists, no sharing, ever.
                </Fx>
              </Fx>
            )}
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 96px">
        <Fx className="pad-xl" s="max-width:1260px;margin:0 auto;background:linear-gradient(150deg,#FFEDE3,#FFF6F1 52%,#E9FBF3);border-radius:44px;padding:48px 44px;box-shadow:inset 0 2px 4px rgba(255,255,255,.9), 0 20px 44px rgba(196,120,74,.14);display:flex;align-items:center;justify-content:space-between;gap:32px;flex-wrap:wrap">
          <Fx>
            <Fx as="h2" s="font-size:clamp(28px,3.4vw,42px);max-width:20ch">
              Prefer to just see it working?
            </Fx>
            <Fx
              as="p"
              s="font-size:16px;line-height:1.65;color:rgba(36,26,22,.64);max-width:46ch;margin:14px 0 0;text-wrap:pretty"
            >
              Book the demo instead of writing a message — twenty minutes, and you&apos;ll watch a bot and a calling
              agent handle your own awkward questions.
            </Fx>
          </Fx>
          <Fx
            as="a"
            href={contactPoints.demoCall}
            className="cta-block"
            s="flex:none;display:flex;align-items:center;gap:12px;text-decoration:none;color:#fff;font-weight:700;font-size:16px;padding:18px 26px 18px 30px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 18px 34px rgba(226,78,23,.4), inset 0 2px 3px rgba(255,255,255,.45);transition:transform .3s cubic-bezier(.34,1.56,.64,1);animation:floaty 5s ease-in-out infinite"
            hover="transform:translateY(-4px) scale(1.02)"
          >
            Book a demo call
            <Fx
              as="span"
              s="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:13px"
            >
              →
            </Fx>
          </Fx>
        </Fx>
      </Fx>
    </>
  );
}
