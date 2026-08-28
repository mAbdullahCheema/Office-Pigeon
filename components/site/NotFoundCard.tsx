import Link from 'next/link';

import { Fx } from '@/components/ui/Fx';
import { routes } from '@/lib/routes';

/**
 * The 404 screen, shared by both of the routes that can show one:
 * `app/not-found.tsx` for a `notFound()` thrown inside a segment, and
 * `app/global-not-found.tsx` for a URL that matches no route at all.
 */
export function NotFoundCard() {
  return (
    <Fx
      as="main"
      s="min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:40px 20px;background:#FFF7F1"
    >
      <Fx s="width:min(620px,100%);background:#fff;border-radius:42px;padding:48px 44px;text-align:center;box-shadow:0 26px 54px rgba(196,120,74,.2), inset 0 2px 4px rgba(255,255,255,.95);animation:pop .6s cubic-bezier(.34,1.4,.64,1) both">
        <Fx
          as="span"
          s="width:64px;height:64px;margin:0 auto;border-radius:24px;background:#FFEDE3;display:flex;align-items:center;justify-content:center;font-size:28px"
        >
          🕊️
        </Fx>
        <Fx s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#E8480F;margin-top:22px">
          404
        </Fx>
        <Fx as="h1" s="font-size:clamp(30px,4vw,44px);margin-top:12px">
          That page flew off.
        </Fx>
        <Fx
          as="p"
          s="font-size:16.5px;line-height:1.66;color:rgba(36,26,22,.64);margin:14px auto 0;max-width:44ch;text-wrap:pretty"
        >
          The link is wrong or the page has moved. The main sections are all one click away.
        </Fx>
        <Fx s="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:30px">
          <Fx
            as={Link}
            href={routes.home}
            className="cta-block"
            s="display:flex;align-items:center;gap:10px;text-decoration:none;color:#fff;font-weight:700;font-size:15.5px;padding:16px 26px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 16px 30px rgba(226,78,23,.36), inset 0 2px 3px rgba(255,255,255,.45);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
            hover="transform:translateY(-3px)"
          >
            Back to the homepage
          </Fx>
          <Fx
            as={Link}
            href={routes.contact}
            className="cta-block"
            s="display:flex;align-items:center;justify-content:center;text-decoration:none;color:#241A16;font-weight:700;font-size:15.5px;padding:16px 24px;border-radius:999px;background:#FFF0E7;box-shadow:inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
            hover="transform:translateY(-3px)"
          >
            Tell us what you were looking for
          </Fx>
        </Fx>
        <Fx s="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:26px">
          {[
            { label: 'Products', href: routes.products },
            { label: 'Services', href: routes.pricing },
            { label: 'Academy', href: routes.academy },
            { label: 'Examples', href: routes.examples },
            { label: 'FAQ', href: routes.faq },
            { label: 'Contact', href: routes.contact },
          ].map((entry) => (
            <Fx
              key={entry.label}
              as={Link}
              href={entry.href}
              s="font-size:13.5px;font-weight:700;color:rgba(36,26,22,.55);text-decoration:none;transition:color .25s"
              hover="color:#E8480F"
            >
              {entry.label}
            </Fx>
          ))}
        </Fx>
      </Fx>
    </Fx>
  );
}
