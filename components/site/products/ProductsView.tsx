import Link from 'next/link';

import { PriceNote } from '@/components/site/PriceNote';
import { Fx } from '@/components/ui/Fx';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { pairs } from '@/lib/content-defaults';
import { contactPoints, routes } from '@/lib/routes';
import type { CatalogEntry } from '@/lib/site-content';

const lift = 'transform:translateY(-4px)';
const liftScale = 'transform:translateY(-4px) scale(1.02)';

export function ProductsView({ products }: { products: CatalogEntry[] }) {
  return (
    <>
      <Fx as="section" s="position:relative;z-index:1;padding:40px 20px 72px;overflow:hidden">
        <Fx s="max-width:1260px;margin:0 auto;position:relative;text-align:center">
          <Fx s="display:inline-flex;align-items:center;gap:10px;background:#fff;border-radius:999px;padding:8px 18px 8px 10px;box-shadow:0 10px 22px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9);font-size:13px;font-weight:700;color:#E8480F;animation:pop .7s cubic-bezier(.34,1.4,.64,1) both">
            <Fx
              as="span"
              s="width:26px;height:26px;border-radius:50%;background:#FFEDE3;display:flex;align-items:center;justify-content:center;font-size:12px"
            >
              ✨
            </Fx>
            Our products
          </Fx>
          <Fx
            as="h1"
            s="font-size:clamp(40px,5.4vw,72px);margin:22px auto 0;max-width:16ch;animation:pop .8s ease-out .1s both"
          >
            AI tools built for real working days.
          </Fx>
          <Fx
            as="p"
            s="font-size:18.5px;line-height:1.66;color:rgba(36,26,22,.66);max-width:56ch;margin:22px auto 0;animation:pop .8s ease-out .2s both;text-wrap:pretty"
          >
            Each one takes a job that quietly eats hours every week — school operations, money, teaching, kitchens — and
            hands it back done. Use one on its own, or let them share the same data.
          </Fx>
          <Fx
            className="four"
            s="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:38px;text-align:left;animation:pop .9s ease-out .3s both"
          >
            {products.map((product) => (
              <Fx
                key={product.itemId}
                as={Link}
                className="clay"
                href={product.page ?? `#${product.itemId}`}
                s="display:flex;align-items:center;gap:12px;text-decoration:none;color:#241A16;background:#fff;border-radius:24px;padding:16px 18px;box-shadow:0 14px 28px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9)"
              >
                <Fx
                  as="span"
                  s={`width:42px;height:42px;flex:none;border-radius:16px;background:${product.tint};display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)`}
                >
                  {product.icon}
                </Fx>
                <Fx as="span" s="line-height:1.3">
                  <Fx as="span" className="tt" s="display:block;font-weight:800;font-size:14.5px">
                    {product.name}
                  </Fx>
                  <Fx as="span" s="display:block;font-size:12px;color:rgba(36,26,22,.55)">
                    {(product.audience ?? '').replace('For ', '')}
                  </Fx>
                </Fx>
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      {products.map((product, index) => {
        const flipped = index % 2 === 1;
        const features = pairs(product.features, ['title', 'body']);
        const stats = pairs(product.stats, ['value', 'label']);

        return (
          <Fx
            key={product.itemId}
            as="section"
            id={product.itemId}
            className="rv"
            s="padding:0 20px 88px;scroll-margin-top:120px"
          >
            <Fx
              s={`max-width:1260px;margin:0 auto;background:${
                product.wash ?? '#fff'
              };border-radius:46px;padding:14px;box-shadow:inset 0 2px 4px rgba(255,255,255,.9), 0 20px 44px rgba(196,120,74,.14)`}
            >
              <Fx
                className="two"
                s={`display:grid;grid-template-columns:${
                  flipped ? 'minmax(0,.95fr) minmax(0,1.05fr)' : 'minmax(0,1.05fr) minmax(0,.95fr)'
                };gap:14px;align-items:stretch;direction:${flipped ? 'rtl' : 'ltr'}`}
              >
                <Fx s="direction:ltr;padding:46px 40px">
                  <Fx s="display:flex;align-items:center;gap:12px">
                    <Fx
                      as="span"
                      s="width:54px;height:54px;border-radius:20px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:25px;box-shadow:0 12px 24px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9)"
                    >
                      {product.icon}
                    </Fx>
                    <Fx
                      as="span"
                      s={`font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:${
                        product.accent ?? '#E8480F'
                      }`}
                    >
                      {product.audience}
                    </Fx>
                  </Fx>
                  <Fx as="h2" s="font-size:clamp(30px,3.8vw,48px);margin-top:20px;max-width:15ch">
                    {product.name}
                  </Fx>
                  <Fx
                    as="p"
                    s="font-size:16.5px;line-height:1.68;color:rgba(36,26,22,.66);max-width:44ch;margin:16px 0 0;text-wrap:pretty"
                  >
                    {product.detailBody ?? product.body}
                  </Fx>

                  <Fx s="display:flex;flex-direction:column;gap:10px;margin-top:26px">
                    {features.map((feature) => (
                      <Fx
                        key={feature.title}
                        s="display:flex;align-items:flex-start;gap:12px;background:#fff;border-radius:20px;padding:14px 18px;box-shadow:0 10px 20px rgba(196,120,74,.1), inset 0 2px 3px rgba(255,255,255,.9)"
                      >
                        <Fx
                          as="span"
                          s="width:24px;height:24px;flex:none;border-radius:50%;background:#E9FBF3;color:#0F9C6E;display:flex;align-items:center;justify-content:center;font-size:12px;margin-top:1px"
                        >
                          ✓
                        </Fx>
                        <Fx as="span" s="line-height:1.5">
                          <Fx as="span" s="display:block;font-weight:700;font-size:14.5px">
                            {feature.title}
                          </Fx>
                          <Fx
                            as="span"
                            s="display:block;font-size:13.5px;color:rgba(36,26,22,.6);margin-top:2px"
                          >
                            {feature.body}
                          </Fx>
                        </Fx>
                      </Fx>
                    ))}
                  </Fx>

                  <Fx s="display:flex;gap:12px;margin-top:28px;flex-wrap:wrap">
                    <Fx
                      as={Link}
                      href={product.page ?? routes.products}
                      s="display:flex;align-items:center;gap:12px;text-decoration:none;color:#fff;font-weight:700;font-size:15.5px;padding:16px 22px 16px 26px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 18px 32px rgba(226,78,23,.36), inset 0 2px 3px rgba(255,255,255,.45);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                      hover={liftScale}
                    >
                      Full details &amp; free trial
                      <Fx
                        as="span"
                        s="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:13px"
                      >
                        →
                      </Fx>
                    </Fx>
                    <Fx
                      as="a"
                      href={contactPoints.demoCall}
                      s="display:flex;align-items:center;text-decoration:none;color:#241A16;font-weight:700;font-size:15.5px;padding:16px 24px;border-radius:999px;background:#fff;box-shadow:0 12px 24px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                      hover={lift}
                    >
                      See a live demo
                    </Fx>
                    <Fx
                      as={Link}
                      href={routes.contact}
                      s="display:flex;align-items:center;text-decoration:none;color:#241A16;font-weight:700;font-size:15.5px;padding:16px 24px;border-radius:999px;background:#fff;box-shadow:0 12px 24px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                      hover={lift}
                    >
                      Ask a question
                    </Fx>
                  </Fx>
                </Fx>

                <Fx s="direction:ltr;position:relative;border-radius:36px;overflow:hidden;min-height:420px;background:#fff">
                  <ImageSlot
                    id={product.detailSlot ?? product.slot}
                    placeholder={product.detailPhoto ?? product.photo}
                    sizes="(max-width: 1000px) 92vw, 600px"
                  />
                </Fx>
              </Fx>

              <Fx s="direction:ltr;display:flex;gap:12px;flex-wrap:wrap;padding:6px 40px 34px">
                {stats.map((stat) => (
                  <Fx
                    key={stat.label}
                    s="background:#fff;border-radius:22px;padding:16px 22px;box-shadow:0 12px 24px rgba(196,120,74,.12), inset 0 2px 3px rgba(255,255,255,.9);min-width:min(150px, 100%)"
                  >
                    <Fx
                      s={`font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:26px;color:${
                        product.accent ?? '#E8480F'
                      }`}
                    >
                      {stat.value}
                    </Fx>
                    <Fx s="font-size:12.5px;color:rgba(36,26,22,.55);margin-top:3px">{stat.label}</Fx>
                  </Fx>
                ))}
              </Fx>
            </Fx>
          </Fx>
        );
      })}

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 96px">
        <Fx className="pad-xl" s="max-width:1260px;margin:0 auto;background:#fff;border-radius:44px;padding:52px 46px;box-shadow:0 24px 50px rgba(196,120,74,.18), inset 0 2px 4px rgba(255,255,255,.95);display:flex;align-items:center;justify-content:space-between;gap:32px;flex-wrap:wrap">
          <Fx>
            <Fx as="h2" s="font-size:clamp(28px,3.4vw,42px);max-width:20ch">
              Not sure which product fits? We&apos;ll tell you honestly.
            </Fx>
            <Fx
              as="p"
              s="font-size:16px;line-height:1.65;color:rgba(36,26,22,.62);max-width:46ch;margin:14px 0 0;text-wrap:pretty"
            >
              A twenty-minute call, a look at how you work today, and a straight recommendation — even if that&apos;s
              &ldquo;you don&apos;t need this yet&rdquo;.
            </Fx>
          </Fx>
          <Fx
            as="a"
            href={contactPoints.demoCall}
            className="cta-block"
            s="flex:none;display:flex;align-items:center;gap:12px;text-decoration:none;color:#fff;font-weight:700;font-size:16px;padding:18px 26px 18px 30px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 18px 34px rgba(226,78,23,.4), inset 0 2px 3px rgba(255,255,255,.45);transition:transform .3s cubic-bezier(.34,1.56,.64,1);animation:floaty 5s ease-in-out infinite"
            hover={liftScale}
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
