'use client';

import Link from 'next/link';

import { Fx } from '@/components/ui/Fx';
import { comingSoonProducts } from '@/lib/coming-soon';
import { contactPoints, routes } from '@/lib/routes';

const columns = [
  {
    title: 'Products — in build',
    items: comingSoonProducts.map((product) => ({ label: product.name, href: product.page })),
  },
  {
    title: 'Services',
    items: [
      { label: 'Websites', href: routes.websites },
      { label: 'Chatbots', href: routes.chatbots },
      { label: 'AI Calling Agents', href: routes.callingAgents },
      { label: 'Automations', href: routes.automations },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'Academy', href: routes.academy },
      { label: 'Applied AI Engineering', href: routes.appliedAi },
      { label: 'Examples', href: routes.examples },
      { label: 'Pricing', href: routes.pricing },
      { label: 'FAQ', href: routes.faq },
      { label: 'Contact', href: routes.contact },
      { label: 'Place an order', href: routes.order },
      { label: 'Sign in', href: routes.login },
    ],
  },
];

const legalLinks = [
  { label: 'Privacy', href: `${routes.legal}#privacy` },
  { label: 'Terms & refunds', href: `${routes.legal}#terms` },
  { label: 'Cookies', href: `${routes.legal}#cookies` },
  { label: 'Data processing', href: `${routes.legal}#dpa` },
  { label: 'Accessibility', href: `${routes.legal}#accessibility` },
];

export function SiteFooter() {
  return (
    <Fx
      as="footer"
      s="font-family:var(--font-jakarta),system-ui,sans-serif;padding:0 20px 20px;background:#FFF7F1"
    >
      <Fx s="max-width:1260px;margin:0 auto;background:linear-gradient(160deg,#2A1A12,#3D2317 52%,#241A16);color:#FFEFE5;border-radius:44px;position:relative;overflow:hidden">
        <Fx s="position:absolute;top:-160px;right:-120px;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(255,129,73,.28),rgba(255,129,73,0) 68%);pointer-events:none;animation:ftFloat 14s ease-in-out infinite" />
        <Fx s="position:absolute;bottom:-220px;left:-140px;width:540px;height:540px;border-radius:50%;background:radial-gradient(circle,rgba(143,124,255,.22),rgba(143,124,255,0) 70%);pointer-events:none;animation:ftFloat 18s ease-in-out infinite reverse" />

        <Fx className="ft-pad" s="position:relative;padding:60px 48px 0">
          <Fx s="display:flex;align-items:center;justify-content:space-between;gap:28px;flex-wrap:wrap;padding-bottom:44px;border-bottom:1px solid rgba(255,239,229,.14)">
            <Fx
              as="h2"
              s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:clamp(28px,3.4vw,44px);letter-spacing:-0.03em;line-height:1.08;margin:0;max-width:18ch"
            >
              Let&apos;s get your front desk working while you sleep.
            </Fx>
            <Fx
              as="a"
              href={contactPoints.demoCall}
              className="cta-block"
              s="flex:none;display:flex;align-items:center;gap:12px;text-decoration:none;color:#fff;font-weight:700;font-size:16px;padding:18px 28px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 18px 34px rgba(226,78,23,.42), inset 0 2px 3px rgba(255,255,255,.45), inset 0 -6px 12px rgba(150,40,0,.24);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
              hover="transform:translateY(-4px) scale(1.02)"
            >
              Book a free demo
              <Fx
                as="span"
                s="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:13px"
              >
                →
              </Fx>
            </Fx>
          </Fx>

          <Fx
            className="ft-grid"
            s="display:grid;grid-template-columns:minmax(0,1.5fr) repeat(3, minmax(0,1fr));gap:44px;align-items:start;padding:48px 0 0"
          >
            <Fx>
              <Fx s="display:flex;align-items:center;gap:11px">
                <Fx as="span" s="width:46px;height:46px;flex:none;display:flex;align-items:center;justify-content:center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/pigeon-clay.svg" alt="Office Pigeon" style={{ width: 46, height: 46, display: 'block' }} />
                </Fx>
                <Fx
                  as="span"
                  s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:20px;letter-spacing:-0.025em;line-height:1;white-space:nowrap"
                >
                  Office Pigeon
                </Fx>
              </Fx>
              <Fx s="font-size:9.5px;font-weight:700;letter-spacing:.19em;text-transform:uppercase;color:#FFB58A;margin-top:14px">
                We automate your success
              </Fx>
              <Fx
                as="p"
                s="font-size:14.5px;line-height:1.7;color:rgba(255,239,229,.62);max-width:32ch;margin:12px 0 0;text-wrap:pretty"
              >
                Services we build and run for you, an academy teaching students in sixteen countries, and four AI
                products on the way.
              </Fx>
              <Fx s="display:flex;flex-direction:column;gap:10px;margin-top:24px">
                <Fx
                  as="a"
                  href={contactPoints.phoneHref}
                  s="display:flex;align-items:center;gap:10px;text-decoration:none;color:#FFEFE5;font-size:14.5px;font-weight:700;transition:opacity .25s"
                  hover="opacity:.7"
                >
                  <Fx
                    as="span"
                    s="width:32px;height:32px;border-radius:12px;background:rgba(255,239,229,.12);display:flex;align-items:center;justify-content:center;font-size:13px"
                  >
                    📞
                  </Fx>
                  {contactPoints.phone}
                </Fx>
                <Fx
                  as="a"
                  href={contactPoints.emailHref}
                  s="display:flex;align-items:center;gap:10px;text-decoration:none;color:#FFEFE5;font-size:14.5px;font-weight:700;transition:opacity .25s"
                  hover="opacity:.7"
                >
                  <Fx
                    as="span"
                    s="width:32px;height:32px;border-radius:12px;background:rgba(255,239,229,.12);display:flex;align-items:center;justify-content:center;font-size:13px"
                  >
                    ✉️
                  </Fx>
                  {contactPoints.email}
                </Fx>
              </Fx>
            </Fx>

            {columns.map((column) => (
              <Fx key={column.title}>
                <Fx s="font-size:10px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#FFB58A">
                  {column.title}
                </Fx>
                <Fx className="ft-col" s="display:flex;flex-direction:column;gap:12px;margin-top:20px">
                  {column.items.map((item) => (
                    <Fx
                      key={item.label}
                      as={Link}
                      href={item.href}
                      className="ft-link"
                      s="text-decoration:none;color:rgba(255,239,229,.82);font-size:14.5px;font-weight:500;transition:color .25s, transform .25s;width:fit-content"
                      hover="color:#fff;transform:translateX(4px)"
                    >
                      {item.label}
                    </Fx>
                  ))}
                </Fx>
              </Fx>
            ))}
          </Fx>

          <Fx s="margin-top:52px;padding:28px 0;border-top:1px solid rgba(255,239,229,.14);display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap">
            <Fx as="span" s="font-size:13px;color:rgba(255,239,229,.5)">
              © {new Date().getFullYear()} Office Pigeon. All rights reserved.
            </Fx>
            <Fx s="display:flex;align-items:center;gap:18px;flex-wrap:wrap">
              {legalLinks.map((link) => (
                <Fx
                  key={link.label}
                  as={Link}
                  href={link.href}
                  className="ft-link"
                  s="text-decoration:none;color:rgba(255,239,229,.62);font-size:13px;font-weight:600;transition:color .25s"
                  hover="color:#fff"
                >
                  {link.label}
                </Fx>
              ))}
              <Fx
                as="button"
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('op-cookie-settings'))}
                s="border:0;cursor:pointer;font-family:inherit;font-size:13px;font-weight:700;color:#FFEFE5;background:rgba(255,239,229,.12);padding:9px 15px;border-radius:999px;transition:background .25s"
                hover="background:rgba(255,239,229,.22)"
              >
                Cookie settings
              </Fx>
            </Fx>
          </Fx>
        </Fx>
      </Fx>
    </Fx>
  );
}
