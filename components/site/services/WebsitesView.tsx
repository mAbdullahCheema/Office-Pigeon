import { PriceNote } from '@/components/site/PriceNote';
import { Fx } from '@/components/ui/Fx';
import { ImageSlot } from '@/components/ui/ImageSlot';

import { ClosingCta, FeatureGrid, PanelKicker, ServiceHero, SplitPanel, StepGrid } from './parts';

const heroStats = [
  { value: '1 day', label: 'starter site live' },
  { value: '$500', label: 'flat, no surprises' },
  { value: '100%', label: 'mobile-first builds' },
];

const features = [
  {
    icon: '📱',
    tint: '#FFEDE3',
    title: 'Mobile-first design',
    body: 'Most of your visitors are on a phone at a traffic light. We design for them first.',
  },
  {
    icon: '⚡',
    tint: '#FFF4D8',
    title: 'Fast on any network',
    body: 'Sub-second loads on 4G. Slow sites lose half their visitors before they see you.',
  },
  {
    icon: '🎯',
    tint: '#E9FBF3',
    title: 'Built to capture leads',
    body: 'Call, WhatsApp and quote-request buttons wherever the decision actually happens.',
  },
  {
    icon: '🔍',
    tint: '#EEEBFE',
    title: 'Local SEO set up',
    body: 'Google Business, schema and location pages so you show up in “near me” searches.',
  },
  {
    icon: '🛠️',
    tint: '#FFEDE3',
    title: 'Hosting & edits included',
    body: 'We host it, back it up and make your text changes. No agency ticket queue.',
  },
  {
    icon: '📊',
    tint: '#E9FBF3',
    title: 'Analytics that matter',
    body: 'A simple monthly note: visitors, calls, forms. Not a dashboard you never open.',
  },
];

const packages = [
  {
    title: 'Starter',
    price: '$500',
    body: 'A single high-converting page with everything a small service business needs.',
    tags: ['1 page', 'Live in a day', 'Lead form + WhatsApp'],
  },
  {
    title: 'Business',
    price: '$1,200',
    body: 'Up to six pages — services, gallery, about, area pages and contact.',
    tags: ['6 pages', 'Local SEO', 'Photo gallery'],
  },
  {
    title: 'Growth',
    price: '$2,500',
    body: 'Bookings, payments and a blog, wired into your chatbot and automations.',
    tags: ['Bookings', 'Payments', 'Blog & CMS'],
  },
];

const steps = [
  { n: '1', title: 'Demo call', body: 'Twenty minutes on what you sell and who you sell it to.' },
  { n: '2', title: 'We build it', body: 'Copy, design and setup done for you — no homework beyond photos.' },
  { n: '3', title: 'You review', body: 'One round of changes, then it goes live on your domain.' },
  { n: '4', title: 'We maintain it', body: 'Hosting, backups, edits and monitoring included every month.' },
];

function BrowserMockup() {
  return (
    <Fx s="background:#fff;border-radius:42px;padding:16px;box-shadow:0 34px 68px rgba(196,120,74,.26), inset 0 3px 4px rgba(255,255,255,.95)">
      <Fx s="display:flex;align-items:center;gap:8px;padding:4px 8px 14px">
        <Fx as="span" s="width:10px;height:10px;border-radius:50%;background:#FFC8B4" />
        <Fx as="span" s="width:10px;height:10px;border-radius:50%;background:#FFE0B4" />
        <Fx as="span" s="width:10px;height:10px;border-radius:50%;background:#C4EFDD" />
        <Fx
          as="span"
          s="margin-left:10px;flex:1;height:26px;border-radius:999px;background:#FFF3EC;display:flex;align-items:center;padding:0 14px;font-size:11.5px;color:rgba(36,26,22,.45)"
        >
          yourbusiness.com
        </Fx>
      </Fx>
      <Fx s="border-radius:30px;overflow:hidden;aspect-ratio:4/3.1;background:#FFEDE3">
        <ImageSlot id="web-hero" placeholder="Screenshot of a website you built" sizes="(max-width: 1000px) 92vw, 600px" priority />
      </Fx>
    </Fx>
  );
}

export function WebsitesView() {
  return (
    <>
      <ServiceHero
        badge="Websites · from $500"
        badgeIcon="🌐"
        badgeTint="#FFEDE3"
        accent="#E8480F"
        title="A site that sells while you're on a job."
        lede="Fast, mobile-first pages built around one thing: turning a visitor into a booked job. Written, designed, hosted and maintained by us."
        stats={heroStats}
        visual={<BrowserMockup />}
        float={{ kicker: 'Load target', value: 'Under 1s', valueColor: '#0F9C6E', note: 'on 4G mobile' }}
      />

      <FeatureGrid kicker="What you get" title="Everything, in one flat price." features={features} />

      <SplitPanel
        wash="linear-gradient(150deg,#FFEDE3,#FFF6F1 50%,#E9FBF3)"
        slot="web-gallery"
        photo="A mobile mockup of one of your sites"
      >
        <PanelKicker color="#E8480F">Packages</PanelKicker>
        <Fx as="h2" s="font-size:clamp(30px,3.8vw,46px);margin-top:14px;max-width:14ch">
          Start small. Grow when it pays off.
        </Fx>
        <Fx s="display:flex;flex-direction:column;gap:12px;margin-top:26px">
          {packages.map((pack) => (
            <Fx
              key={pack.title}
              s="background:#fff;border-radius:26px;padding:22px 24px;box-shadow:0 12px 26px rgba(196,120,74,.12), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .35s cubic-bezier(.34,1.4,.64,1)"
              hover="transform:translateX(6px)"
            >
              <Fx s="display:flex;align-items:baseline;justify-content:space-between;gap:12px">
                <Fx as="h3" s="font-size:21px">
                  {pack.title}
                </Fx>
                <Fx
                  as="span"
                  s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:24px;color:#E8480F"
                >
                  {pack.price}
                </Fx>
              </Fx>
              <Fx as="p" s="font-size:14px;line-height:1.6;color:rgba(36,26,22,.62);margin:8px 0 0;text-wrap:pretty">
                {pack.body}
              </Fx>
              <Fx s="display:flex;flex-wrap:wrap;gap:7px;margin-top:14px">
                {pack.tags.map((tag) => (
                  <Fx
                    key={tag}
                    as="span"
                    s="font-size:12px;font-weight:600;color:rgba(36,26,22,.58);background:#FFF6F1;border-radius:999px;padding:6px 12px"
                  >
                    {tag}
                  </Fx>
                ))}
              </Fx>
            </Fx>
          ))}
        </Fx>
      </SplitPanel>

      <StepGrid kicker="How it runs" title="Live in a day, not a quarter." steps={steps} />

      <ClosingCta
        title="Want to see it before you pay a rupee?"
        body="We'll mock up your homepage on the demo call so you can judge the real thing, not a promise."
      />

      <Fx as="section" s="position:relative;z-index:1;padding:0 20px 90px">
        <Fx s="max-width:1260px;margin:0 auto">
          <PriceNote />
        </Fx>
      </Fx>
    </>
  );
}
