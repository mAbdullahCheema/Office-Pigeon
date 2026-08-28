'use client';

import { useEffect, useState } from 'react';

import { Fx } from '@/components/ui/Fx';
import { legalDocs } from '@/lib/legal-content';
import { contactPoints } from '@/lib/routes';

export function LegalView() {
  const [active, setActive] = useState(legalDocs[0].id);

  // The footer links straight to #privacy, #terms and friends.
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.replace('#', '');
      if (legalDocs.some((doc) => doc.id === id)) setActive(id);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  const doc = legalDocs.find((entry) => entry.id === active) ?? legalDocs[0];

  return (
    <>
      <Fx as="section" s="position:relative;z-index:1;padding:40px 20px 34px">
        <Fx s="max-width:1260px;margin:0 auto">
          <Fx s="display:inline-flex;align-items:center;gap:10px;background:#fff;border-radius:999px;padding:8px 18px 8px 10px;box-shadow:0 10px 22px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9);font-size:13px;font-weight:700;color:#E8480F;animation:pop .7s cubic-bezier(.34,1.4,.64,1) both">
            <Fx
              as="span"
              s="width:26px;height:26px;border-radius:50%;background:#FFEDE3;display:flex;align-items:center;justify-content:center;font-size:12px"
            >
              §
            </Fx>
            Legal centre
          </Fx>
          <Fx as="h1" s="font-size:clamp(38px,5vw,62px);margin:22px 0 0;max-width:20ch;animation:pop .8s ease-out .1s both">
            The plain-language rules we hold ourselves to.
          </Fx>
          <Fx
            as="p"
            s="font-size:18px;line-height:1.66;color:rgba(36,26,22,.66);max-width:58ch;margin:20px 0 0;animation:pop .8s ease-out .2s both;text-wrap:pretty"
          >
            Privacy, terms, refunds, cookies and data rights — written to be read, not skimmed past. Questions about any
            of it go to <a href={contactPoints.emailHref}>{contactPoints.email}</a> or{' '}
            <a href={contactPoints.phoneHref}>{contactPoints.phone}</a>.
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" s="position:relative;z-index:1;padding:0 20px 96px">
        <Fx
          className="lg-wrap"
          s="max-width:1260px;margin:0 auto;display:grid;grid-template-columns:290px minmax(0,1fr);gap:36px;align-items:start"
        >
          <Fx as="aside" className="lg-side" s="position:sticky;top:26px;display:flex;flex-direction:column;gap:10px">
            {legalDocs.map((entry) => {
              const on = entry.id === active;
              return (
                <Fx
                  key={entry.id}
                  as="button"
                  type="button"
                  onClick={() => {
                    history.replaceState(null, '', `#${entry.id}`);
                    setActive(entry.id);
                  }}
                  s={`border:0;cursor:pointer;font-family:inherit;text-align:left;display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:22px;background:${
                    on ? '#241A16' : '#fff'
                  };color:${on ? '#fff' : '#241A16'};box-shadow:${
                    on
                      ? '0 16px 32px rgba(36,26,22,.24)'
                      : '0 12px 26px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9)'
                  };transition:transform .25s cubic-bezier(.34,1.56,.64,1), background .3s`}
                  hover="transform:translateX(3px)"
                >
                  <Fx
                    as="span"
                    s={`width:34px;height:34px;flex:none;border-radius:13px;background:${
                      on ? 'rgba(255,239,229,.14)' : '#FFF3EB'
                    };color:${on ? '#FFB58A' : '#E8480F'};display:flex;align-items:center;justify-content:center;font-size:15px`}
                  >
                    {entry.icon}
                  </Fx>
                  <Fx as="span" s="flex:1;min-width:0">
                    <Fx as="span" s="display:block;font-weight:700;font-size:15px">
                      {entry.label}
                    </Fx>
                    <Fx
                      as="span"
                      s={`display:block;font-size:12px;font-weight:500;color:${
                        on ? 'rgba(255,239,229,.6)' : 'rgba(36,26,22,.5)'
                      };margin-top:2px`}
                    >
                      {entry.sub}
                    </Fx>
                  </Fx>
                </Fx>
              );
            })}
            <Fx s="background:#fff;border-radius:22px;padding:18px;box-shadow:0 12px 26px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9);margin-top:6px">
              <Fx s="font-size:10px;font-weight:800;letter-spacing:.19em;text-transform:uppercase;color:#B4795A">
                Cookies
              </Fx>
              <Fx as="p" s="font-size:13.5px;line-height:1.6;color:rgba(36,26,22,.64);margin:8px 0 14px">
                Change what you allow us to store on your device, any time.
              </Fx>
              <Fx
                as="button"
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('op-cookie-settings'))}
                s="width:100%;border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:14px;padding:13px 16px;border-radius:16px;background:#241A16;color:#fff;transition:transform .25s cubic-bezier(.34,1.56,.64,1)"
                hover="transform:translateY(-2px)"
              >
                Cookie settings
              </Fx>
            </Fx>
          </Fx>

          <Fx
            as="article"
            s="background:#fff;border-radius:34px;padding:44px 46px 48px;box-shadow:0 20px 44px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9);min-width:0"
          >
            <Fx s="display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;padding-bottom:24px;border-bottom:1px solid rgba(36,26,22,.09)">
              <Fx as="h2" s="font-size:clamp(27px,3vw,38px);margin:0">
                {doc.title}
              </Fx>
              <Fx
                as="span"
                s="font-size:12px;font-weight:700;color:#B4795A;background:#FFF3EB;padding:8px 14px;border-radius:999px;white-space:nowrap"
              >
                Updated {doc.updated}
              </Fx>
            </Fx>
            <Fx
              as="p"
              s="font-size:16.5px;line-height:1.72;color:rgba(36,26,22,.7);margin:22px 0 0;max-width:70ch;text-wrap:pretty"
            >
              {doc.intro}
            </Fx>

            <Fx s="display:flex;flex-direction:column;gap:30px;margin-top:34px">
              {doc.sections.map((section) => (
                <Fx key={section.h}>
                  <Fx as="h3" s="font-size:20px;letter-spacing:-0.02em">
                    {section.h}
                  </Fx>
                  <Fx s="display:flex;flex-direction:column;gap:12px;margin-top:12px">
                    {section.ps.map((paragraph, index) => (
                      <Fx
                        key={index}
                        as="p"
                        s="font-size:15.5px;line-height:1.74;color:rgba(36,26,22,.7);margin:0;max-width:76ch;text-wrap:pretty"
                      >
                        {paragraph}
                      </Fx>
                    ))}
                  </Fx>
                  {section.list && section.list.length > 0 ? (
                    <Fx s="display:flex;flex-direction:column;gap:9px;margin-top:14px">
                      {section.list.map((item, index) => (
                        <Fx key={index} s="display:flex;gap:11px;align-items:flex-start">
                          <Fx
                            as="span"
                            s="width:19px;height:19px;flex:none;border-radius:50%;background:#FFEDE3;color:#E8480F;display:flex;align-items:center;justify-content:center;font-size:10px;margin-top:3px"
                          >
                            •
                          </Fx>
                          <Fx as="span" s="font-size:15px;line-height:1.7;color:rgba(36,26,22,.72);max-width:74ch">
                            {item}
                          </Fx>
                        </Fx>
                      ))}
                    </Fx>
                  ) : null}
                </Fx>
              ))}
            </Fx>

            <Fx s="margin-top:40px;padding:26px 28px;border-radius:26px;background:#FFF7F1;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap">
              <Fx>
                <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:18px;letter-spacing:-0.02em">
                  Something here unclear?
                </Fx>
                <Fx s="font-size:14.5px;color:rgba(36,26,22,.62);margin-top:4px">
                  A person replies within one business day.
                </Fx>
              </Fx>
              <Fx s="display:flex;gap:10px;flex-wrap:wrap">
                <Fx
                  as="a"
                  href={contactPoints.emailHref}
                  s="display:flex;align-items:center;gap:9px;text-decoration:none;color:#fff;font-weight:700;font-size:14.5px;padding:14px 20px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 14px 26px rgba(226,78,23,.34);transition:transform .28s cubic-bezier(.34,1.56,.64,1)"
                  hover="transform:translateY(-3px)"
                >
                  Email us
                </Fx>
                <Fx
                  as="a"
                  href={contactPoints.whatsapp}
                  s="display:flex;align-items:center;gap:9px;text-decoration:none;color:#241A16;font-weight:700;font-size:14.5px;padding:14px 20px;border-radius:999px;background:#fff;box-shadow:0 12px 24px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .28s cubic-bezier(.34,1.56,.64,1)"
                  hover="transform:translateY(-3px)"
                >
                  WhatsApp
                </Fx>
              </Fx>
            </Fx>
          </Fx>
        </Fx>
      </Fx>
    </>
  );
}
