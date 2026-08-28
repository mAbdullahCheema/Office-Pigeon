'use client';

import Link from 'next/link';
import { useState } from 'react';

import { PriceNote } from '@/components/site/PriceNote';
import { Fx } from '@/components/ui/Fx';
import { comingSoonProducts } from '@/lib/coming-soon';
import { coursePath, courses } from '@/lib/courses';
import { contactPoints, routes } from '@/lib/routes';

type Skin = {
  bg: string;
  fg: string;
  rule: string;
  tick: string;
  tickFg: string;
  shadow: string;
  btnBg: string;
  btnFg: string;
  btnShadow: string;
  iconBg: string;
};

const light: Skin = {
  bg: '#fff',
  fg: '#241A16',
  rule: '#F6E7DC',
  tick: '#E9FBF3',
  tickFg: '#0F9C6E',
  shadow: '0 16px 34px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9)',
  btnBg: '#FFF0E7',
  btnFg: '#241A16',
  btnShadow: 'inset 0 2px 3px rgba(255,255,255,.9)',
  iconBg: '#FFF0E7',
};

const hot: Skin = {
  bg: 'linear-gradient(160deg,#FF9A5E,#EF5A1F 62%,#D9350B)',
  fg: '#fff',
  rule: 'rgba(255,255,255,.24)',
  tick: 'rgba(255,255,255,.24)',
  tickFg: '#fff',
  shadow: '0 26px 52px rgba(226,78,23,.44), inset 0 2px 3px rgba(255,255,255,.4)',
  btnBg: '#fff',
  btnFg: '#E8480F',
  btnShadow: '0 12px 24px rgba(0,0,0,.14)',
  iconBg: 'rgba(255,255,255,.22)',
};

const violet: Skin = {
  bg: 'linear-gradient(160deg,#8F7CFF,#5A48D6)',
  fg: '#fff',
  rule: 'rgba(255,255,255,.24)',
  tick: 'rgba(255,255,255,.24)',
  tickFg: '#fff',
  shadow: '0 26px 52px rgba(90,72,214,.4), inset 0 2px 3px rgba(255,255,255,.35)',
  btnBg: '#fff',
  btnFg: '#5A48D6',
  btnShadow: '0 12px 24px rgba(0,0,0,.14)',
  iconBg: 'rgba(255,255,255,.22)',
};

const groups = [
  {
    label: 'Services',
    plans: [
      {
        ...light,
        icon: '🌐',
        title: 'Starter',
        body: 'Get found and stop losing the easy enquiries.',
        price: '$500',
        unit: 'one-off + $49/mo',
        featured: false,
        items: [
          '1-page website, live in a day',
          'Lead form + WhatsApp button',
          'Hosting, backups and edits',
          'Google Business setup',
          'Email support',
        ],
        cta: 'Start here',
        href: `${routes.order}?item=website`,
      },
      {
        ...hot,
        icon: '⚡',
        title: 'Front Desk',
        body: 'The full front office: site, bot and calling agent together.',
        price: '$1,400',
        unit: 'one-off + $249/mo',
        featured: true,
        items: [
          'Up to 6-page website',
          'Website + WhatsApp chatbot',
          'AI calling agent, 24/7',
          '3 automation workflows',
          'Monthly numbers report',
          'Priority support',
        ],
        cta: 'Most businesses pick this',
        href: `${routes.order}?item=calling-agent`,
      },
      {
        ...light,
        icon: '🚀',
        title: 'Growth',
        body: 'For teams booking more work than they can currently track.',
        price: '$2,900',
        unit: 'one-off + $449/mo',
        featured: false,
        items: [
          'Everything in Front Desk',
          'Bookings and payments online',
          'Unlimited automations',
          'CRM setup and migration',
          'Quarterly strategy call',
        ],
        cta: 'Talk to us',
        href: `${routes.order}?item=automation`,
      },
    ],
  },
  {
    label: 'Products',
    // Nothing here is priced yet — the products are in build, so each card says
    // what it will do and links to its coming-soon page rather than the order
    // form.
    plans: comingSoonProducts.map((product) => ({
      ...light,
      icon: product.icon,
      title: product.name,
      body: product.line,
      price: 'Soon',
      unit: 'in build',
      featured: false,
      items: [] as string[],
      cta: 'See what is coming',
      href: product.page,
    })),
  },
  {
    label: 'Academy',
    plans: [
      {
        ...light,
        icon: '👥',
        title: 'Group classes',
        body: 'Live lessons in groups of up to six students.',
        price: '$59',
        unit: '/subject/month',
        featured: false,
        items: [
          '4 live classes a week',
          'Recordings and notes',
          'Monthly progress report',
          'Doubt-clearing chat',
          'Free trial class',
        ],
        cta: 'Book a trial class',
        href: `${routes.order}?item=academy-group`,
      },
      {
        ...violet,
        icon: '🎯',
        title: 'One-to-one',
        body: 'A dedicated tutor working at your child’s pace.',
        price: '$149',
        unit: '/subject/month',
        featured: true,
        items: [
          '4 private classes a week',
          'Custom term plan',
          'Weekly parent check-in',
          'Exam and paper practice',
          'Priority rescheduling',
        ],
        cta: 'Book a trial class',
        href: `${routes.order}?item=academy-121`,
      },
      {
        ...light,
        icon: '🏆',
        title: 'Board year',
        body: 'Class 10 and 12 support through the exam season.',
        price: '$449',
        unit: '/subject/term',
        featured: false,
        items: [
          'Everything in one-to-one',
          'Past-paper marathons',
          'Mock tests with marking',
          'Revision bootcamps',
          'Second subject 15% off',
        ],
        cta: 'Talk to us',
        href: routes.contact,
      },
    ],
  },
  {
    // The professional track bills by the hour, so its cards come straight from
    // the course data rather than being restated here.
    label: 'Courses',
    plans: courses.flatMap((course) =>
      course.tiers.map((tier, index) => ({
        ...(tier.featured ? violet : light),
        icon: ['📘', '⚡', '🧭'][index] ?? course.badgeIcon,
        title: tier.name,
        body: tier.summary,
        price: `$${tier.price}`,
        unit: '/hour',
        featured: tier.featured,
        items: tier.items,
        cta: `Choose ${tier.name}`,
        href: `${routes.order}?item=${course.itemId}&plan=${tier.planId}`,
      })),
    ),
  },
];

const rows = [
  {
    icon: '🌐',
    tint: '#FFEDE3',
    title: 'Website',
    body: 'One-page starter build, live in a working day.',
    price: 'from $500',
    href: routes.websites,
  },
  {
    icon: '💬',
    tint: '#E9FBF3',
    title: 'Chatbot',
    body: 'Website and WhatsApp bot trained on your business.',
    price: 'from $300',
    href: routes.chatbots,
  },
  {
    icon: '📞',
    tint: '#EEEBFE',
    title: 'AI Calling Agent',
    body: 'Answers, qualifies and books — day or night.',
    price: 'from $600',
    href: routes.callingAgents,
  },
  {
    icon: '⚙️',
    tint: '#FFF4D8',
    title: 'Automation workflow',
    body: 'One workflow built, tested and monitored.',
    price: 'from $100',
    href: routes.automations,
  },
  {
    icon: '📚',
    tint: '#EEEBFE',
    title: 'Academy class',
    body: 'Live tutoring, per subject per month.',
    price: 'from $59/mo',
    href: routes.academy,
  },
  {
    icon: '🤖',
    tint: '#E9FBF3',
    title: 'Applied AI Engineering',
    body: 'A 16-week one-to-one AI engineering program. First session free.',
    price: 'from $25/hr',
    href: routes.appliedAi,
  },
];

const assurances = [
  {
    icon: '🚫',
    tint: '#FFEDE3',
    title: 'No long contracts',
    body: 'Monthly plans you can pause or cancel with thirty days’ notice. We keep you by being useful.',
  },
  {
    icon: '🔑',
    tint: '#E9FBF3',
    title: 'You own everything',
    body: 'Domain, content, phone numbers and data are yours. If you leave, you leave with all of it.',
  },
  {
    icon: '💬',
    tint: '#EEEBFE',
    title: 'A real person replies',
    body: 'Support goes to someone who knows your setup, not a queue of first-line scripts.',
  },
  {
    icon: '📈',
    tint: '#FFF4D8',
    title: 'Priced for small teams',
    body: 'Set-up fees stay flat and monthly costs stay predictable, so the math is easy to check.',
  },
];

export function PricingView() {
  const [tab, setTab] = useState(0);
  const plans = groups[tab].plans;

  return (
    <>
      <Fx as="section" s="position:relative;z-index:1;padding:40px 20px 72px;overflow:hidden">
        <Fx s="max-width:1260px;margin:0 auto;position:relative;text-align:center">
          <Fx s="display:inline-flex;align-items:center;gap:10px;background:#fff;border-radius:999px;padding:8px 18px 8px 10px;box-shadow:0 10px 22px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9);font-size:13px;font-weight:700;color:#E8480F;animation:pop .7s cubic-bezier(.34,1.4,.64,1) both">
            <Fx
              as="span"
              s="width:26px;height:26px;border-radius:50%;background:#FFEDE3;display:flex;align-items:center;justify-content:center;font-size:12px"
            >
              💳
            </Fx>
            Pricing
          </Fx>
          <Fx
            as="h1"
            s="font-size:clamp(40px,5.4vw,72px);margin:22px auto 0;max-width:16ch;animation:pop .8s ease-out .1s both"
          >
            Flat prices. No retainers you can&apos;t leave.
          </Fx>
          <Fx
            as="p"
            s="font-size:18.5px;line-height:1.66;color:rgba(36,26,22,.66);max-width:52ch;margin:22px auto 0;animation:pop .8s ease-out .2s both;text-wrap:pretty"
          >
            Pick a service bundle, join the Academy, or take a one-to-one course — all three are open today. The
            products are still in build. Everything is month-to-month, and every price here is a starting guide we are
            happy to talk through.
          </Fx>

          <Fx s="display:inline-flex;gap:6px;background:#fff;padding:6px;border-radius:999px;margin-top:34px;box-shadow:0 12px 26px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9);animation:pop .8s ease-out .3s both">
            {groups.map((group, index) => (
              <Fx
                key={group.label}
                as="button"
                type="button"
                onClick={() => setTab(index)}
                s={`border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:13.5px;padding:12px 22px;border-radius:999px;background:${
                  index === tab ? 'linear-gradient(180deg,#FF8149,#EF5A1F)' : 'transparent'
                };color:${index === tab ? '#fff' : 'rgba(36,26,22,.62)'};box-shadow:${
                  index === tab ? '0 10px 20px rgba(226,78,23,.3), inset 0 2px 3px rgba(255,255,255,.4)' : 'none'
                };transition:background .3s, color .3s, transform .25s cubic-bezier(.34,1.56,.64,1)`}
                hover="transform:translateY(-2px)"
              >
                {group.label}
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx
          className="three"
          s="max-width:1260px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;align-items:start"
        >
          {plans.map((plan) => (
            <Fx
              key={`${groups[tab].label}-${plan.title}`}
              className="clay"
              s={`background:${plan.bg};color:${plan.fg};border-radius:38px;padding:36px 32px 38px;box-shadow:${plan.shadow};position:relative;animation:pop .55s cubic-bezier(.34,1.4,.64,1) both`}
            >
              {plan.featured ? (
                <Fx
                  as="span"
                  s="position:absolute;top:24px;right:26px;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;background:rgba(255,255,255,.24);padding:7px 12px;border-radius:999px"
                >
                  Most popular
                </Fx>
              ) : null}
              <Fx
                as="span"
                s={`width:52px;height:52px;border-radius:20px;background:${plan.iconBg};display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:inset 0 2px 3px rgba(255,255,255,.6)`}
              >
                {plan.icon}
              </Fx>
              <Fx as="h2" s="font-size:26px;margin-top:20px">
                {plan.title}
              </Fx>
              <Fx as="p" s="font-size:14.5px;line-height:1.6;opacity:.72;margin:10px 0 0;text-wrap:pretty">
                {plan.body}
              </Fx>
              <Fx s="display:flex;align-items:baseline;gap:8px;margin-top:22px">
                <Fx
                  as="span"
                  s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:46px;letter-spacing:-0.04em"
                >
                  {plan.price}
                </Fx>
                <Fx as="span" s="font-size:14px;opacity:.66">
                  {plan.unit}
                </Fx>
              </Fx>
              {/* A card with nothing to list yet skips its rule as well. */}
              <Fx
                s={`height:1px;background:${plan.rule};margin:24px 0;display:${
                  plan.items.length > 0 ? 'block' : 'none'
                }`}
              />
              <Fx s="display:flex;flex-direction:column;gap:11px">
                {plan.items.map((item) => (
                  <Fx key={item} s="display:flex;align-items:flex-start;gap:10px;font-size:14.5px;line-height:1.5">
                    <Fx
                      as="span"
                      s={`width:20px;height:20px;flex:none;border-radius:50%;background:${plan.tick};color:${plan.tickFg};display:flex;align-items:center;justify-content:center;font-size:11px;margin-top:1px`}
                    >
                      ✓
                    </Fx>
                    {item}
                  </Fx>
                ))}
              </Fx>
              <Fx
                as={Link}
                href={plan.href}
                s={`display:flex;align-items:center;justify-content:center;gap:10px;margin-top:30px;text-decoration:none;color:${plan.btnFg};font-weight:700;font-size:15.5px;padding:16px;border-radius:999px;background:${plan.btnBg};box-shadow:${plan.btnShadow};transition:transform .3s cubic-bezier(.34,1.56,.64,1)`}
                hover="transform:translateY(-3px)"
              >
                {plan.cta}
              </Fx>
            </Fx>
          ))}
        </Fx>

        {groups[tab].label === 'Courses' ? (
          <Fx s="max-width:1260px;margin:22px auto 0;display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
            {courses.map((course) => (
              <Fx
                key={course.slug}
                as={Link}
                href={coursePath(course)}
                s="display:inline-flex;align-items:center;gap:10px;text-decoration:none;color:#5A48D6;font-weight:700;font-size:14.5px;padding:14px 22px;border-radius:999px;background:#fff;box-shadow:0 12px 24px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                hover="transform:translateY(-3px)"
              >
                {course.name} — {course.badge}, first session free →
              </Fx>
            ))}
          </Fx>
        ) : null}
      </Fx>

      {/* The founding-client offer. Two of the ten places are taken by builds
          already in progress, so the counter is a fact rather than a scarcity
          trick — keep it accurate as work lands. */}
      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx
          className="pad-xl"
          s="max-width:1260px;margin:0 auto;background:linear-gradient(150deg,#FFEDE3,#FFF6F1 55%,#FFF4D8);border-radius:44px;padding:46px 42px;box-shadow:inset 0 2px 4px rgba(255,255,255,.9), 0 20px 44px rgba(196,120,74,.15);display:flex;align-items:center;justify-content:space-between;gap:32px;flex-wrap:wrap"
        >
          <Fx s="flex:1;min-width:min(300px,100%)">
            <Fx s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#E8480F">
              Founding clients · 2 of 10 taken
            </Fx>
            <Fx as="h2" s="font-size:clamp(28px,3.4vw,42px);margin-top:14px;max-width:20ch">
              30% off the build fee for our first ten service clients.
            </Fx>
            <Fx
              as="p"
              s="font-size:16px;line-height:1.65;color:rgba(36,26,22,.64);max-width:56ch;margin:14px 0 0;text-wrap:pretty"
            >
              We are new under this name and we would rather earn the case studies than claim them. Take a website,
              chatbot, calling agent or automation build at 30% off the one-off fee; in return we write the project up
              and quote you on it. Monthly fees are unchanged, and you can still leave with thirty days’ notice.
            </Fx>
          </Fx>
          <Fx
            as={Link}
            href={routes.order}
            className="cta-block"
            s="flex:none;display:flex;align-items:center;gap:12px;text-decoration:none;color:#fff;font-weight:700;font-size:16px;padding:18px 26px 18px 30px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 18px 34px rgba(226,78,23,.4), inset 0 2px 3px rgba(255,255,255,.45);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
            hover="transform:translateY(-4px) scale(1.02)"
          >
            Claim a founding spot
            <Fx
              as="span"
              s="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:13px"
            >
              →
            </Fx>
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:1260px;margin:0 auto">
          <Fx s="text-align:center">
            <Fx s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#E8480F">
              À la carte
            </Fx>
            <Fx as="h2" s="font-size:clamp(32px,4.2vw,52px);margin-top:14px">
              Or just buy the one piece you need.
            </Fx>
          </Fx>
          <Fx s="background:#fff;border-radius:38px;margin-top:32px;padding:12px;box-shadow:0 20px 44px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9)">
            {rows.map((row) => (
              <Fx
                key={row.title}
                as={Link}
                className="rowline"
                href={row.href}
                s="display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;gap:20px;align-items:center;text-decoration:none;color:#241A16;padding:20px 22px;border-radius:26px;transition:background .3s, transform .3s cubic-bezier(.34,1.4,.64,1)"
                hover="background:#FFF6F1;transform:translateX(5px)"
              >
                <Fx
                  as="span"
                  s={`width:46px;height:46px;flex:none;border-radius:18px;background:${row.tint};display:flex;align-items:center;justify-content:center;font-size:21px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)`}
                >
                  {row.icon}
                </Fx>
                <Fx as="span" s="line-height:1.45">
                  <Fx as="span" s="display:block;font-weight:700;font-size:16px">
                    {row.title}
                  </Fx>
                  <Fx as="span" s="display:block;font-size:13.5px;color:rgba(36,26,22,.58);margin-top:2px">
                    {row.body}
                  </Fx>
                </Fx>
                <Fx
                  as="span"
                  s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:21px;color:#E8480F;white-space:nowrap"
                >
                  {row.price}
                </Fx>
                <Fx
                  as="span"
                  s="width:32px;height:32px;border-radius:50%;background:#FFEDE3;color:#E8480F;display:flex;align-items:center;justify-content:center;font-size:14px"
                >
                  →
                </Fx>
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx className="two" s="max-width:1260px;margin:0 auto;display:grid;grid-template-columns:repeat(2,1fr);gap:20px">
          {assurances.map((assurance) => (
            <Fx
              key={assurance.title}
              className="clay"
              s="display:flex;gap:16px;background:#fff;border-radius:30px;padding:26px 28px;box-shadow:0 16px 34px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9)"
            >
              <Fx
                as="span"
                s={`width:48px;height:48px;flex:none;border-radius:18px;background:${assurance.tint};display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)`}
              >
                {assurance.icon}
              </Fx>
              <Fx as="span">
                <Fx
                  as="span"
                  s="display:block;font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:19px"
                >
                  {assurance.title}
                </Fx>
                <Fx
                  as="span"
                  s="display:block;font-size:14px;line-height:1.6;color:rgba(36,26,22,.62);margin-top:7px"
                >
                  {assurance.body}
                </Fx>
              </Fx>
            </Fx>
          ))}
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 96px">
        <Fx className="pad-xl" s="max-width:1260px;margin:0 auto;background:#fff;border-radius:44px;padding:52px 46px;box-shadow:0 24px 50px rgba(196,120,74,.18), inset 0 2px 4px rgba(255,255,255,.95);display:flex;align-items:center;justify-content:space-between;gap:32px;flex-wrap:wrap">
          <Fx>
            <Fx as="h2" s="font-size:clamp(28px,3.4vw,42px);max-width:18ch">
              Still not sure what you need?
            </Fx>
            <Fx
              as="p"
              s="font-size:16px;line-height:1.65;color:rgba(36,26,22,.62);max-width:44ch;margin:14px 0 0;text-wrap:pretty"
            >
              Twenty minutes on a call and we&apos;ll tell you the smallest thing that will move your numbers — even if
              it&apos;s nothing.
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

      <Fx as="section" s="position:relative;z-index:1;padding:0 20px 90px">
        <Fx s="max-width:1260px;margin:0 auto">
          <PriceNote />
        </Fx>
      </Fx>
    </>
  );
}
