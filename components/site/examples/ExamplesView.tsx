'use client';

import { useState } from 'react';

import { EmptyPanel } from '@/components/ui/EmptyPanel';
import { Fx } from '@/components/ui/Fx';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { exampleFilters, exampleQuotes } from '@/lib/page-content';
import { contactPoints } from '@/lib/routes';
import type { Example } from '@/lib/site-content';

export function ExamplesView({ examples }: { examples: Example[] }) {
  const [filter, setFilter] = useState(0);

  const key = exampleFilters[filter].key;
  const shown = key === 'all' ? examples : examples.filter((example) => example.group === key);

  return (
    <>
      <Fx as="section" s="position:relative;z-index:1;padding:40px 20px 72px;overflow:hidden">
        <Fx s="max-width:1260px;margin:0 auto;position:relative;text-align:center">
          <Fx s="display:inline-flex;align-items:center;gap:10px;background:#fff;border-radius:999px;padding:8px 18px 8px 10px;box-shadow:0 10px 22px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9);font-size:13px;font-weight:700;color:#E8480F;animation:pop .7s cubic-bezier(.34,1.4,.64,1) both">
            <Fx
              as="span"
              s="width:26px;height:26px;border-radius:50%;background:#FFEDE3;display:flex;align-items:center;justify-content:center;font-size:12px"
            >
              🖼️
            </Fx>
            Examples
          </Fx>
          <Fx
            as="h1"
            s="font-size:clamp(40px,5.4vw,70px);margin:22px auto 0;max-width:16ch;animation:pop .8s ease-out .1s both"
          >
            What we build, and how it works.
          </Fx>
          <Fx
            as="p"
            s="font-size:18.5px;line-height:1.66;color:rgba(36,26,22,.66);max-width:52ch;margin:22px auto 0;animation:pop .8s ease-out .2s both;text-wrap:pretty"
          >
            The builds we ship — sites, bots, calling agents, products and Academy classes — with the scope and
            turnaround we work to. The services side is new under this name, so these describe the work rather than
            claim someone else&apos;s results. Filter by what you&apos;re weighing up.
          </Fx>
          <Fx s="display:inline-flex;gap:6px;background:#fff;padding:6px;border-radius:999px;margin-top:32px;box-shadow:0 12px 26px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9);animation:pop .8s ease-out .3s both;flex-wrap:wrap;justify-content:center">
            {exampleFilters.map((entry, index) => (
              <Fx
                key={entry.key}
                as="button"
                type="button"
                onClick={() => setFilter(index)}
                s={`border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:13.5px;padding:12px 20px;border-radius:999px;background:${
                  index === filter ? 'linear-gradient(180deg,#FF8149,#EF5A1F)' : 'transparent'
                };color:${index === filter ? '#fff' : 'rgba(36,26,22,.62)'};box-shadow:${
                  index === filter ? '0 10px 20px rgba(226,78,23,.3), inset 0 2px 3px rgba(255,255,255,.4)' : 'none'
                };transition:background .3s, color .3s, transform .25s cubic-bezier(.34,1.56,.64,1)`}
                hover="transform:translateY(-2px)"
              >
                {entry.label}
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" s="position:relative;z-index:1;padding:0 20px 92px">
        {shown.length === 0 ? (
          <Fx s="max-width:640px;margin:0 auto">
            <EmptyPanel
              icon="🗂️"
              title="Nothing filed under this yet"
              body={`We have not published a ${exampleFilters[filter].label.toLowerCase()} build here yet. Everything we have is under “All”, and we are happy to walk you through work that is closer to yours.`}
              action={
                <Fx
                  as="button"
                  type="button"
                  onClick={() => setFilter(0)}
                  s="border:0;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:9px;color:#fff;font-weight:700;font-size:15px;padding:14px 24px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 14px 28px rgba(226,78,23,.34);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                  hover="transform:translateY(-3px)"
                >
                  Show every example
                </Fx>
              }
            />
          </Fx>
        ) : null}
        <Fx className="three" s="max-width:1260px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
          {shown.map((example) => (
            <Fx
              key={example.title}
              className="clay"
              s="background:#fff;border-radius:34px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 16px 34px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9);animation:pop .5s cubic-bezier(.34,1.4,.64,1) both"
            >
              <Fx s={`height:200px;background:${example.tint}`}>
                <ImageSlot
                  id={example.slot}
                  placeholder={example.photo}
                  sizes="(max-width: 620px) 92vw, (max-width: 900px) 46vw, 410px"
                />
              </Fx>
              <Fx s="padding:24px 26px 28px;display:flex;flex-direction:column;flex:1">
                <Fx s="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                  <Fx
                    as="span"
                    s="font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#E8480F;background:#FFEDE3;padding:6px 12px;border-radius:999px"
                  >
                    {example.kind}
                  </Fx>
                  <Fx as="span" s="font-size:12.5px;color:rgba(36,26,22,.5)">
                    {example.sector}
                  </Fx>
                </Fx>
                <Fx as="h3" s="font-size:22px;margin-top:14px">
                  {example.title}
                </Fx>
                <Fx
                  as="p"
                  s="font-size:14.5px;line-height:1.62;color:rgba(36,26,22,.62);margin:10px 0 18px;text-wrap:pretty"
                >
                  {example.body}
                </Fx>
                <Fx s="margin-top:auto;display:flex;gap:10px;flex-wrap:wrap">
                  {example.results.map((result) => {
                    const [value = '', label = '', color = '#241A16'] = result.split('|');
                    return (
                      <Fx
                        key={result}
                        s="background:#FFF6F1;border-radius:18px;padding:12px 16px;box-shadow:inset 0 2px 4px rgba(196,120,74,.12)"
                      >
                        <Fx
                          s={`font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:19px;color:${color}`}
                        >
                          {value}
                        </Fx>
                        <Fx s="font-size:11.5px;color:rgba(36,26,22,.55);margin-top:2px">{label}</Fx>
                      </Fx>
                    );
                  })}
                </Fx>
              </Fx>
            </Fx>
          ))}
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:1260px;margin:0 auto;background:linear-gradient(150deg,#FFEDE3,#FFF6F1 52%,#EEEBFE);border-radius:46px;padding:14px;box-shadow:inset 0 2px 4px rgba(255,255,255,.9), 0 20px 44px rgba(196,120,74,.14)">
          <Fx
            className="two"
            s="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.88fr);gap:14px;align-items:stretch"
          >
            <Fx className="pad-xl" s="padding:44px 38px">
              <Fx s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#E8480F">
                Academy reviews
              </Fx>
              <Fx as="h2" s="font-size:clamp(28px,3.6vw,42px);margin-top:14px;max-width:16ch">
                From the families we teach.
              </Fx>
              <Fx s="display:flex;flex-direction:column;gap:12px;margin-top:26px">
                {exampleQuotes.map((quote) => (
                  <Fx
                    key={quote.name}
                    s="background:#fff;border-radius:26px;padding:22px 24px;box-shadow:0 12px 26px rgba(196,120,74,.12), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .35s cubic-bezier(.34,1.4,.64,1)"
                    hover="transform:translateX(6px)"
                  >
                    <Fx as="p" s="font-size:15px;line-height:1.62;color:rgba(36,26,22,.74);margin:0;text-wrap:pretty">
                      {quote.text}
                    </Fx>
                    <Fx s="display:flex;align-items:center;gap:11px;margin-top:16px">
                      <Fx
                        as="span"
                        s={`width:36px;height:36px;flex:none;border-radius:50%;background:${quote.tint};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px`}
                      >
                        {quote.initials}
                      </Fx>
                      <Fx as="span" s="line-height:1.3">
                        <Fx as="span" s="display:block;font-weight:700;font-size:14px">
                          {quote.name}
                        </Fx>
                        <Fx as="span" s="display:block;font-size:12.5px;color:rgba(36,26,22,.52)">
                          {quote.role}
                        </Fx>
                      </Fx>
                    </Fx>
                  </Fx>
                ))}
              </Fx>
            </Fx>
            <Fx s="border-radius:36px;overflow:hidden;min-height:420px;background:#fff">
              <ImageSlot
                id="examples-collage"
                placeholder="A collage or photo of your best work"
                sizes="(max-width: 1000px) 92vw, 600px"
              />
            </Fx>
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 96px">
        <Fx className="pad-xl" s="max-width:1260px;margin:0 auto;background:#fff;border-radius:44px;padding:52px 46px;box-shadow:0 24px 50px rgba(196,120,74,.18), inset 0 2px 4px rgba(255,255,255,.95);display:flex;align-items:center;justify-content:space-between;gap:32px;flex-wrap:wrap">
          <Fx>
            <Fx as="h2" s="font-size:clamp(28px,3.4vw,42px);max-width:20ch">
              Want an example from your own trade?
            </Fx>
            <Fx
              as="p"
              s="font-size:16px;line-height:1.65;color:rgba(36,26,22,.62);max-width:46ch;margin:14px 0 0;text-wrap:pretty"
            >
              Tell us what you do and we&apos;ll show you the closest build we&apos;ve done — numbers included, no
              polish.
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
