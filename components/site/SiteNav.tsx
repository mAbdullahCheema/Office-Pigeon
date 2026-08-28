'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Fx } from '@/components/ui/Fx';
import { comingSoonProducts } from '@/lib/coming-soon';
import { contactPoints, routes } from '@/lib/routes';

export type NavKey =
  | 'home'
  | 'products'
  | 'services'
  | 'websites'
  | 'chatbots'
  | 'calling'
  | 'automations'
  | 'academy'
  | 'examples'
  | 'pricing'
  | 'faq'
  | 'contact'
  | 'order'
  | 'login'
  | 'dashboard'
  | 'admin';

export type NavAccount = { name: string; role: 'admin' | 'customer' } | null;

// None of the products are open yet, so the panel names them, says so, and
// links to the coming-soon page for each rather than into a section or a trial.
const products = comingSoonProducts.map((product) => ({
  icon: product.icon,
  tint: product.tint,
  title: product.name,
  tagline: 'in build',
  body: product.line,
  href: product.page,
}));

const services = [
  {
    icon: '🌐',
    tint: '#FFEDE3',
    title: 'Websites',
    tagline: 'from $500',
    body: 'Responsive builds with lead capture — starter site live in one day.',
    href: routes.websites,
  },
  {
    icon: '💬',
    tint: '#E9FBF3',
    title: 'Chatbots',
    tagline: 'from $300',
    body: 'Answers 80%+ of repeat questions on your site and WhatsApp.',
    href: routes.chatbots,
  },
  {
    icon: '📞',
    tint: '#EEEBFE',
    title: 'AI Calling Agents',
    tagline: 'from $600',
    body: 'Picks up every call, captures leads and takes bookings.',
    href: routes.callingAgents,
  },
  {
    icon: '⚙️',
    tint: '#FFF4D8',
    title: 'Automations',
    tagline: 'from $100',
    body: 'Follow-ups, reminders, CRM and sheets kept in sync.',
    href: routes.automations,
  },
];

const rawLinks = [
  { id: 'academy', label: 'Academy', href: routes.academy },
  { id: 'examples', label: 'Examples', href: routes.examples },
  { id: 'pricing', label: 'Pricing', href: routes.pricing },
  { id: 'faq', label: 'FAQ', href: routes.faq },
  { id: 'contact', label: 'Contact', href: routes.contact },
];

const allLinks = [
  { label: 'Home', href: routes.home, icon: '🏠', tint: '#FFF0E7' },
  ...products.map((p) => ({ label: p.title, href: p.href, icon: p.icon, tint: p.tint })),
  ...services.map((s) => ({ label: s.title, href: s.href, icon: s.icon, tint: s.tint })),
  { label: 'Academy', href: routes.academy, icon: '📚', tint: '#EEEBFE' },
  { label: 'Applied AI Engineering', href: routes.appliedAi, icon: '🤖', tint: '#EEEBFE' },
  { label: 'Examples', href: routes.examples, icon: '🖼️', tint: '#FFF4D8' },
  { label: 'Pricing', href: routes.pricing, icon: '💳', tint: '#FFF4D8' },
  { label: 'FAQ', href: routes.faq, icon: '❓', tint: '#E9FBF3' },
  { label: 'Contact', href: routes.contact, icon: '✉️', tint: '#FFEDE3' },
];

const pillHover = 'background:#FFEDE3;color:#E8480F';

export function SiteNav({ active = 'home', account = null }: { active?: NavKey; account?: NavAccount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<'products' | 'services' | null>(null);
  const [scrolled, setScrolled] = useState(false);

  /*
   * Which of the two navs shows is decided by `.nav-wide` / `.nav-narrow` in
   * `globals.css`, not by a state flag.
   *
   * A flag can only be read after hydration, so the server had no way to know
   * the visitor was on a phone: every phone was served the desktop nav — eleven
   * pills laid out for 1300px — and swapped to the hamburger a beat later. Both
   * are in the markup now and CSS picks one before the first paint.
   */
  useEffect(() => {
    let isScrolled = false;

    const onScroll = () => {
      const next = window.scrollY > 12;
      if (next === isScrolled) return;
      isScrolled = next;
      setScrolled(next);
    };
    onScroll();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPanel(null);
        setMenuOpen(false);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const productActive = active === 'products' || panel === 'products';
  const serviceActive =
    ['websites', 'chatbots', 'calling', 'automations', 'services'].includes(active) || panel === 'services';
  const accountActive = ['login', 'dashboard', 'admin'].includes(active);

  // One dashboard serves both roles, so the destination no longer branches.
  const accountHref = account ? routes.dashboard : routes.login;
  const accountTitle = account ? 'My dashboard' : 'Sign in';
  const accountGlyph = account ? '🙂' : '👤';

  const panelItems = panel === 'services' ? services : products;

  const closeMenus = () => setPanel(null);

  return (
    <Fx s={`position:sticky;top:0;z-index:140;font-family:var(--font-jakarta),system-ui,sans-serif`}>
      <Fx s="padding:14px 20px">
        <Fx
          as="header"
          s={`max-width:1300px;margin:0 auto;position:relative;background:rgba(255,255,255,.94);backdrop-filter:blur(16px);border-radius:26px;box-shadow:${
            scrolled
              ? '0 18px 40px rgba(196,120,74,.24), inset 0 2px 3px rgba(255,255,255,.95)'
              : '0 10px 26px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9)'
          };padding:11px 11px 11px 14px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:18px;transition:box-shadow .35s`}
        >
          <Fx
            as={Link}
            href={routes.home}
            s="display:flex;align-items:center;gap:11px;text-decoration:none;color:#241A16;justify-self:start;white-space:nowrap"
          >
            <Fx
              as="span"
              s="width:44px;height:44px;flex:none;display:flex;align-items:center;justify-content:center"
              hover="animation:wob .6s ease-in-out"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/pigeon-clay.svg" alt="Office Pigeon" style={{ width: 44, height: 44, display: 'block' }} />
            </Fx>
            <Fx
              as="span"
              s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:20px;letter-spacing:-0.025em;line-height:1"
            >
              Office Pigeon
            </Fx>
          </Fx>

          <Fx
            as="nav"
            className="nav-wide"
            aria-label="Main"
            s="grid-column:2;display:flex;align-items:center;gap:2px;justify-self:center;background:#FFF7F1;border-radius:999px;padding:4px"
          >
            <Fx
              as={Link}
              href={routes.home}
              s={`display:flex;align-items:center;height:36px;padding:0 16px;border-radius:999px;text-decoration:none;color:${
                active === 'home' ? '#E8480F' : '#4A3A33'
              };background:${
                active === 'home' ? '#FFEDE3' : 'transparent'
              };font-size:14.5px;font-weight:600;white-space:nowrap;transition:background .25s, color .25s`}
              hover={pillHover}
            >
              Home
            </Fx>
            <Fx
              as="button"
              type="button"
              onClick={() => setPanel((current) => (current === 'products' ? null : 'products'))}
              s={`display:flex;align-items:center;gap:7px;height:36px;padding:0 16px;border:0;border-radius:999px;cursor:pointer;font-family:inherit;font-size:14.5px;font-weight:600;color:${
                productActive ? '#E8480F' : '#4A3A33'
              };background:${
                productActive ? '#FFEDE3' : 'transparent'
              };white-space:nowrap;transition:background .25s, color .25s`}
              hover={pillHover}
            >
              Products
              <Fx
                as="span"
                s={`font-size:7px;display:inline-block;transition:transform .3s cubic-bezier(.34,1.56,.64,1);transform:${
                  panel === 'products' ? 'rotate(180deg)' : 'rotate(0deg)'
                }`}
              >
                ▼
              </Fx>
            </Fx>
            <Fx
              as="button"
              type="button"
              onClick={() => setPanel((current) => (current === 'services' ? null : 'services'))}
              s={`display:flex;align-items:center;gap:7px;height:36px;padding:0 16px;border:0;border-radius:999px;cursor:pointer;font-family:inherit;font-size:14.5px;font-weight:600;color:${
                serviceActive ? '#E8480F' : '#4A3A33'
              };background:${
                serviceActive ? '#FFEDE3' : 'transparent'
              };white-space:nowrap;transition:background .25s, color .25s`}
              hover={pillHover}
            >
              Services
              <Fx
                as="span"
                s={`font-size:7px;display:inline-block;transition:transform .3s cubic-bezier(.34,1.56,.64,1);transform:${
                  panel === 'services' ? 'rotate(180deg)' : 'rotate(0deg)'
                }`}
              >
                ▼
              </Fx>
            </Fx>
            {rawLinks.map((link) => (
              <Fx
                key={link.id}
                as={Link}
                href={link.href}
                s={`display:flex;align-items:center;height:36px;padding:0 16px;border-radius:999px;text-decoration:none;color:${
                  link.id === active ? '#E8480F' : '#4A3A33'
                };background:${
                  link.id === active ? '#FFEDE3' : 'transparent'
                };font-size:14.5px;font-weight:600;white-space:nowrap;transition:background .25s, color .25s`}
                hover={pillHover}
              >
                {link.label}
              </Fx>
            ))}
          </Fx>

          <Fx className="nav-wide" s="grid-column:3;display:flex;align-items:center;gap:8px;justify-self:end">
            <Fx
              as="a"
              href={contactPoints.phoneHref}
              className="nav-tel"
              title={`Call ${contactPoints.phone}`}
              aria-label="Call us"
              s="width:44px;height:44px;flex:none;border-radius:50%;background:#FFF7F1;color:#241A16;display:flex;align-items:center;justify-content:center;font-size:16px;text-decoration:none;transition:background .25s, transform .3s cubic-bezier(.34,1.56,.64,1)"
              hover="background:#FFEDE3;transform:translateY(-2px)"
            >
              📞
            </Fx>
            <Fx
              as="a"
              href={contactPoints.whatsapp}
              title="WhatsApp us"
              aria-label="WhatsApp us"
              s="width:44px;height:44px;flex:none;border-radius:50%;background:#FFF7F1;color:#241A16;display:flex;align-items:center;justify-content:center;font-size:16px;text-decoration:none;transition:background .25s, transform .3s cubic-bezier(.34,1.56,.64,1)"
              hover="background:#E9FBF3;transform:translateY(-2px)"
            >
              💬
            </Fx>
            <Fx
              as={Link}
              href={accountHref}
              title={accountTitle}
              aria-label={accountTitle}
              s={`width:44px;height:44px;flex:none;border-radius:50%;background:${
                accountActive ? '#FFEDE3' : '#FFF7F1'
              };color:#241A16;display:flex;align-items:center;justify-content:center;font-size:16px;text-decoration:none;transition:background .25s, transform .3s cubic-bezier(.34,1.56,.64,1)`}
              hover="background:#FFEDE3;transform:translateY(-2px)"
            >
              {accountGlyph}
            </Fx>
            <Fx
              as={Link}
              href={routes.order}
              s="display:flex;align-items:center;height:44px;padding:0 22px;border-radius:999px;text-decoration:none;color:#fff;font-weight:700;font-size:14.5px;white-space:nowrap;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 12px 22px rgba(226,78,23,.34), inset 0 2px 3px rgba(255,255,255,.45), inset 0 -5px 10px rgba(150,40,0,.2);transition:transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s"
              hover="transform:translateY(-3px);box-shadow:0 20px 32px rgba(226,78,23,.42)"
              active="transform:translateY(1px) scale(.97)"
            >
              Place an Order
            </Fx>
          </Fx>

          <Fx
            className="nav-narrow"
            s="display:flex;align-items:center;gap:8px;justify-self:end;grid-column:3"
          >
            <Fx
              as={Link}
              href={routes.order}
              className="nav-order-sm"
              s="display:flex;align-items:center;height:44px;padding:0 20px;border-radius:999px;text-decoration:none;color:#fff;font-weight:700;font-size:14px;white-space:nowrap;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 12px 22px rgba(226,78,23,.34), inset 0 2px 3px rgba(255,255,255,.45)"
            >
              Order
            </Fx>
            <Fx
              as="button"
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              s="width:44px;height:44px;border:0;border-radius:50%;background:#FFF7F1;color:#241A16;font-size:16px;cursor:pointer;transition:background .25s, transform .2s"
              hover="background:#FFEDE3"
              active="transform:scale(.93)"
            >
              {menuOpen ? '✕' : '☰'}
            </Fx>
          </Fx>

          {panel !== null ? (
            <Fx
              className="nav-wide"
              onMouseLeave={closeMenus}
              s="position:absolute;top:calc(100% + 12px);left:50%;transform:translateX(-50%);width:min(760px, calc(100vw - 40px));background:#fff;border-radius:28px;padding:16px;box-shadow:0 30px 64px rgba(196,120,74,.26), inset 0 2px 3px rgba(255,255,255,.9);animation:navDrop .28s cubic-bezier(.34,1.4,.64,1) both;z-index:150"
            >
              <Fx s="display:grid;grid-template-columns:1fr 1fr;gap:6px">
                {panelItems.map((item) => (
                  <Fx
                    key={item.title}
                    as={Link}
                    href={item.href}
                    onClick={closeMenus}
                    s="display:flex;gap:14px;text-decoration:none;color:#241A16;padding:16px;border-radius:22px;transition:background .25s, transform .3s cubic-bezier(.34,1.4,.64,1)"
                    hover="background:#FFF6F1;transform:translateY(-2px)"
                  >
                    <Fx
                      as="span"
                      s={`width:44px;height:44px;flex:none;border-radius:50%;background:${item.tint};display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)`}
                    >
                      {item.icon}
                    </Fx>
                    <Fx as="span" s="min-width:0">
                      <Fx as="span" s="display:flex;align-items:center;gap:8px;font-weight:700;font-size:15px">
                        {item.title}
                        <Fx
                          as="span"
                          s="font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#E8480F;background:#FFEDE3;padding:4px 8px;border-radius:999px;white-space:nowrap"
                        >
                          {item.tagline}
                        </Fx>
                      </Fx>
                      <Fx
                        as="span"
                        s="display:block;font-size:13.5px;line-height:1.55;color:rgba(36,26,22,.6);margin-top:5px"
                      >
                        {item.body}
                      </Fx>
                    </Fx>
                  </Fx>
                ))}
              </Fx>
              <Fx
                as={Link}
                href={panel === 'services' ? routes.pricing : routes.products}
                onClick={closeMenus}
                s="display:flex;align-items:center;justify-content:space-between;margin-top:8px;padding:15px 20px;border-radius:22px;background:#FFF7F1;text-decoration:none;color:#241A16;font-size:14px;font-weight:600;transition:background .25s"
                hover="background:#FFEDE3"
              >
                {panel === 'services'
                  ? 'Compare the service packages side by side'
                  : 'See what is coming and when'}
                <Fx
                  as="span"
                  s="width:30px;height:30px;flex:none;border-radius:50%;background:#fff;color:#E8480F;display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 6px 12px rgba(196,120,74,.18)"
                >
                  →
                </Fx>
              </Fx>
            </Fx>
          ) : null}
        </Fx>

        {menuOpen ? (
          <Fx
            className="nav-narrow"
            s="max-width:1300px;margin:10px auto 0;background:#fff;border-radius:28px;box-shadow:0 22px 44px rgba(196,120,74,.22);padding:14px;display:flex;flex-direction:column;gap:2px;animation:navFade .25s ease-out both"
          >
            {allLinks.map((link) => (
              <Fx
                key={link.label}
                as={Link}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                s="display:flex;align-items:center;gap:12px;text-decoration:none;color:#241A16;font-size:15.5px;font-weight:600;padding:12px 14px;border-radius:18px;transition:background .25s"
                hover="background:#FFF6F1"
              >
                <Fx
                  as="span"
                  s={`width:36px;height:36px;flex:none;border-radius:50%;background:${link.tint};display:flex;align-items:center;justify-content:center;font-size:16px`}
                >
                  {link.icon}
                </Fx>
                {link.label}
              </Fx>
            ))}
            <Fx s="height:1px;background:#F6E7DC;margin:10px 6px" />
            <Fx s="display:flex;gap:8px;flex-wrap:wrap">
              <Fx
                as="a"
                href={contactPoints.phoneHref}
                s="flex:1;min-width:130px;display:flex;align-items:center;justify-content:center;gap:9px;height:46px;border-radius:999px;text-decoration:none;color:#241A16;font-weight:700;font-size:14px;background:#FFF7F1"
              >
                📞 Call
              </Fx>
              <Fx
                as="a"
                href={contactPoints.whatsapp}
                s="flex:1;min-width:130px;display:flex;align-items:center;justify-content:center;gap:9px;height:46px;border-radius:999px;text-decoration:none;color:#241A16;font-weight:700;font-size:14px;background:#E9FBF3"
              >
                💬 WhatsApp
              </Fx>
              <Fx
                as={Link}
                href={accountHref}
                s="flex:1;min-width:130px;display:flex;align-items:center;justify-content:center;gap:9px;height:46px;border-radius:999px;text-decoration:none;color:#241A16;font-weight:700;font-size:14px;background:#FFF0E7"
              >
                {accountGlyph} {accountTitle}
              </Fx>
            </Fx>
            <Fx
              as={Link}
              href={routes.order}
              s="margin-top:8px;display:flex;align-items:center;justify-content:center;height:52px;text-decoration:none;color:#fff;font-weight:700;font-size:15.5px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 12px 24px rgba(226,78,23,.34)"
            >
              Place an Order
            </Fx>
          </Fx>
        ) : null}
      </Fx>
    </Fx>
  );
}
