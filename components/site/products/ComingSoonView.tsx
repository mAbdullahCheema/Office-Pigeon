import Link from 'next/link';

import { Fx } from '@/components/ui/Fx';
import { comingSoonProducts, type ComingSoonProduct } from '@/lib/coming-soon';
import { contactPoints, routes } from '@/lib/routes';

/**
 * What the site says about the products until they ship: the name, who each
 * one is for, one line, and nothing to buy. Passing `focus` puts one product
 * at the top — that is what the four product routes render.
 */
export function ComingSoonView({ focus }: { focus?: ComingSoonProduct }) {
  const rest = focus ? comingSoonProducts.filter((product) => product.itemId !== focus.itemId) : comingSoonProducts;

  return (
    <>
      <Fx as="section" s="position:relative;z-index:1;padding:56px 20px 64px;overflow:hidden">
        <Fx s="max-width:900px;margin:0 auto;position:relative;text-align:center">
          <Fx s="display:inline-flex;align-items:center;gap:10px;background:#fff;border-radius:999px;padding:8px 18px 8px 10px;box-shadow:0 10px 22px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9);font-size:13px;font-weight:700;color:#E8480F;animation:pop .7s cubic-bezier(.34,1.4,.64,1) both">
            <Fx
              as="span"
              s="width:26px;height:26px;border-radius:50%;background:#FFEDE3;display:flex;align-items:center;justify-content:center;font-size:12px"
            >
              🚧
            </Fx>
            Coming soon
          </Fx>

          <Fx
            as="h1"
            s="font-size:clamp(38px,5vw,64px);margin:22px auto 0;max-width:16ch;animation:pop .8s ease-out .1s both"
          >
            {focus ? `${focus.name} is on the way.` : 'Our products are still in build.'}
          </Fx>

          <Fx
            as="p"
            s="font-size:18px;line-height:1.66;color:rgba(36,26,22,.66);max-width:52ch;margin:20px auto 0;animation:pop .8s ease-out .2s both;text-wrap:pretty"
          >
            {focus
              ? focus.line
              : 'Four tools for schools, kitchens, classrooms and books. None of them are open yet — we will announce each one the day it is ready.'}
          </Fx>

          <Fx s="display:flex;gap:12px;margin-top:30px;flex-wrap:wrap;justify-content:center;animation:pop .8s ease-out .3s both">
            <Fx
              as={Link}
              href={routes.contact}
              s="display:flex;align-items:center;gap:12px;text-decoration:none;color:#fff;font-weight:700;font-size:15.5px;padding:16px 22px 16px 26px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 18px 32px rgba(226,78,23,.36), inset 0 2px 3px rgba(255,255,255,.45);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
              hover="transform:translateY(-4px) scale(1.02)"
            >
              Tell us to let you know
              <Fx
                as="span"
                s="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:13px"
              >
                →
              </Fx>
            </Fx>
            <Fx
              as={Link}
              href={routes.pricing}
              s="display:flex;align-items:center;text-decoration:none;color:#241A16;font-weight:700;font-size:15.5px;padding:16px 24px;border-radius:999px;background:#fff;box-shadow:0 12px 24px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
              hover="transform:translateY(-4px)"
            >
              See what is live today
            </Fx>
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:1060px;margin:0 auto">
          {focus ? (
            <Fx
              as="p"
              s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:rgba(36,26,22,.4);margin:0 0 20px;text-align:center"
            >
              Also in build
            </Fx>
          ) : null}

          <Fx className="two" s="display:grid;grid-template-columns:repeat(2,1fr);gap:16px">
            {rest.map((product) => (
              <Fx
                key={product.itemId}
                as={Link}
                className="clay"
                href={product.page}
                s="text-decoration:none;color:#241A16;display:flex;gap:16px;background:#fff;border-radius:30px;padding:26px 28px;box-shadow:0 16px 34px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                hover="transform:translateY(-4px)"
              >
                <Fx
                  as="span"
                  s={`width:50px;height:50px;flex:none;border-radius:19px;background:${product.tint};display:flex;align-items:center;justify-content:center;font-size:23px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)`}
                >
                  {product.icon}
                </Fx>
                <Fx as="span" s="min-width:0">
                  <Fx s="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                    <Fx as="span" className="tt" s="font-weight:800;font-size:19px">
                      {product.name}
                    </Fx>
                    <Fx
                      as="span"
                      s={`font-size:10.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${product.accent};background:${product.tint};padding:5px 10px;border-radius:999px`}
                    >
                      In build
                    </Fx>
                  </Fx>
                  <Fx as="span" s="display:block;font-size:12.5px;color:rgba(36,26,22,.5);margin-top:4px">
                    {product.audience}
                  </Fx>
                  <Fx
                    as="span"
                    s="display:block;font-size:14px;line-height:1.6;color:rgba(36,26,22,.62);margin-top:9px;text-wrap:pretty"
                  >
                    {product.line}
                  </Fx>
                </Fx>
              </Fx>
            ))}
          </Fx>

          <Fx
            className="pad-xl"
            s="margin-top:22px;background:#fff;border-radius:34px;padding:32px 34px;box-shadow:0 16px 34px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9);display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap"
          >
            <Fx>
              <Fx as="h2" s="font-size:clamp(22px,2.6vw,30px);max-width:22ch">
                The services are open now.
              </Fx>
              <Fx
                as="p"
                s="font-size:15px;line-height:1.6;color:rgba(36,26,22,.62);max-width:48ch;margin:10px 0 0;text-wrap:pretty"
              >
                Websites, chatbots, calling agents and automations are all things we build and run for you today.
              </Fx>
            </Fx>
            <Fx
              as="a"
              href={contactPoints.demoCall}
              s="flex:none;display:flex;align-items:center;text-decoration:none;color:#241A16;font-weight:700;font-size:15px;padding:15px 24px;border-radius:999px;background:#FFF0E7;box-shadow:inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
              hover="transform:translateY(-3px)"
            >
              Book a demo call
            </Fx>
          </Fx>
        </Fx>
      </Fx>
    </>
  );
}
