import Link from 'next/link';

import { Fx } from '@/components/ui/Fx';
import { mailtoLink, routes, whatsappLink } from '@/lib/routes';

const lift = 'transform:translateY(-3px)';

export function PriceNote() {
  return (
    <Fx s="font-family:var(--font-jakarta),system-ui,sans-serif;background:#fff;border-radius:32px;padding:26px 28px;box-shadow:0 16px 34px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9);display:flex;align-items:center;gap:24px;flex-wrap:wrap">
      <Fx
        as="span"
        s="width:52px;height:52px;flex:none;border-radius:50%;background:#FFF4D8;display:flex;align-items:center;justify-content:center;font-size:23px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)"
      >
        🏷️
      </Fx>
      <Fx s="flex:1;min-width:min(260px, 100%)">
        <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:19px;letter-spacing:-0.02em">
          Prices shown are a starting guide
        </Fx>
        <Fx
          as="p"
          s="font-size:14.5px;line-height:1.62;color:rgba(36,26,22,.62);margin:8px 0 0;max-width:64ch;text-wrap:pretty"
        >
          Your final price can vary with region, currency, team size, scope and how much setup is involved. Confirm with
          us first, or place an order and we will reach out with a firm quote as soon as possible — usually within a few
          hours.
        </Fx>
      </Fx>
      <Fx s="display:flex;gap:10px;flex-wrap:wrap">
        <Fx
          as={Link}
          href={routes.order}
          s="display:flex;align-items:center;gap:10px;text-decoration:none;color:#fff;font-weight:700;font-size:14.5px;padding:14px 22px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 14px 26px rgba(226,78,23,.34), inset 0 2px 3px rgba(255,255,255,.45);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
          hover={lift}
        >
          Place an order
        </Fx>
        <Fx
          as="a"
          href={whatsappLink('Hi Office Pigeon — I would like to confirm pricing.')}
          s="display:flex;align-items:center;gap:9px;text-decoration:none;color:#241A16;font-weight:700;font-size:14.5px;padding:14px 20px;border-radius:999px;background:#E9FBF3;box-shadow:inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
          hover={lift}
        >
          <Fx as="span" s="font-size:15px">
            💬
          </Fx>
          WhatsApp
        </Fx>
        <Fx
          as="a"
          href={mailtoLink('Pricing confirmation')}
          s="display:flex;align-items:center;gap:9px;text-decoration:none;color:#241A16;font-weight:700;font-size:14.5px;padding:14px 20px;border-radius:999px;background:#FFF0E7;box-shadow:inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
          hover={lift}
        >
          <Fx as="span" s="font-size:15px">
            ✉️
          </Fx>
          Email us
        </Fx>
      </Fx>
    </Fx>
  );
}
