'use client';

import Link from 'next/link';
import { useState } from 'react';

import { EmptyPanel } from '@/components/ui/EmptyPanel';
import { Fx } from '@/components/ui/Fx';
import { contactPoints, routes } from '@/lib/routes';
import type { Faq } from '@/lib/site-content';

export function FaqView({ faqs, categories }: { faqs: Faq[]; categories: string[] }) {
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(0);

  const category = categories[tab];
  const items = faqs.filter((faq) => faq.category === category);

  return (
    <>
      <Fx as="section" s="position:relative;z-index:1;padding:40px 20px 60px;overflow:hidden">
        <Fx s="max-width:1260px;margin:0 auto;position:relative;text-align:center">
          <Fx s="display:inline-flex;align-items:center;gap:10px;background:#fff;border-radius:999px;padding:8px 18px 8px 10px;box-shadow:0 10px 22px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9);font-size:13px;font-weight:700;color:#E8480F;animation:pop .7s cubic-bezier(.34,1.4,.64,1) both">
            <Fx
              as="span"
              s="width:26px;height:26px;border-radius:50%;background:#FFEDE3;display:flex;align-items:center;justify-content:center;font-size:12px"
            >
              ❓
            </Fx>
            Questions
          </Fx>
          <Fx
            as="h1"
            s="font-size:clamp(40px,5.4vw,68px);margin:22px auto 0;max-width:16ch;animation:pop .8s ease-out .1s both"
          >
            The things everyone asks us first.
          </Fx>
          <Fx
            as="p"
            s="font-size:18.5px;line-height:1.66;color:rgba(36,26,22,.66);max-width:50ch;margin:22px auto 0;animation:pop .8s ease-out .2s both;text-wrap:pretty"
          >
            If yours isn&apos;t here, ask Pip in the corner or send us a message — a person answers.
          </Fx>
          <Fx s="display:inline-flex;gap:6px;background:#fff;padding:6px;border-radius:999px;margin-top:32px;box-shadow:0 12px 26px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9);animation:pop .8s ease-out .3s both;flex-wrap:wrap;justify-content:center">
            {categories.map((label, index) => (
              <Fx
                key={label}
                as="button"
                type="button"
                onClick={() => {
                  setTab(index);
                  setOpen(0);
                }}
                s={`border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:13.5px;padding:12px 20px;border-radius:999px;background:${
                  index === tab ? 'linear-gradient(180deg,#FF8149,#EF5A1F)' : 'transparent'
                };color:${index === tab ? '#fff' : 'rgba(36,26,22,.62)'};box-shadow:${
                  index === tab ? '0 10px 20px rgba(226,78,23,.3), inset 0 2px 3px rgba(255,255,255,.4)' : 'none'
                };transition:background .3s, color .3s, transform .25s cubic-bezier(.34,1.56,.64,1)`}
                hover="transform:translateY(-2px)"
              >
                {label}
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:12px">
          {items.length === 0 ? (
            <EmptyPanel
              icon="💬"
              title="No questions here yet"
              body={`Nobody has asked us about ${category.toLowerCase()} often enough to write it up. Ask us directly and the answer usually lands within a few hours — and then it ends up on this page.`}
              action={
                <Fx
                  as={Link}
                  href={routes.contact}
                  s="display:inline-flex;align-items:center;gap:9px;text-decoration:none;color:#fff;font-weight:700;font-size:15px;padding:14px 24px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 14px 28px rgba(226,78,23,.34);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                  hover="transform:translateY(-3px)"
                >
                  Ask us your question
                </Fx>
              }
            />
          ) : null}
          {items.map((item, index) => {
            const isOpen = open === index;
            return (
              <Fx
                key={item.question}
                s="background:#fff;border-radius:28px;box-shadow:0 14px 30px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9);overflow:hidden;animation:pop .45s cubic-bezier(.34,1.4,.64,1) both"
              >
                <Fx
                  as="button"
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : index)}
                  s="width:100%;border:0;background:transparent;cursor:pointer;font-family:inherit;text-align:left;display:flex;align-items:center;gap:16px;padding:24px 26px;color:#241A16"
                >
                  <Fx
                    as="span"
                    s="flex:1;font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:18.5px;letter-spacing:-0.02em"
                  >
                    {item.question}
                  </Fx>
                  <Fx
                    as="span"
                    s={`width:34px;height:34px;flex:none;border-radius:13px;background:${
                      isOpen ? 'linear-gradient(150deg,#FFA46A,#EF5A1F)' : '#FFF0E7'
                    };color:${
                      isOpen ? '#fff' : '#E8480F'
                    };display:flex;align-items:center;justify-content:center;font-size:16px;transition:transform .35s cubic-bezier(.34,1.56,.64,1), background .3s;transform:${
                      isOpen ? 'rotate(135deg)' : 'rotate(0deg)'
                    }`}
                  >
                    +
                  </Fx>
                </Fx>
                {isOpen ? (
                  <Fx s="padding:0 26px 26px">
                    <Fx
                      as="p"
                      s="font-size:15.5px;line-height:1.7;color:rgba(36,26,22,.66);margin:0;max-width:62ch;text-wrap:pretty"
                    >
                      {item.answer}
                    </Fx>
                  </Fx>
                ) : null}
              </Fx>
            );
          })}
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 96px">
        <Fx className="two" s="max-width:1260px;margin:0 auto;display:grid;grid-template-columns:repeat(2,1fr);gap:20px">
          <Fx s="background:linear-gradient(150deg,#FFEDE3,#FFF6F1);border-radius:38px;padding:40px 36px;box-shadow:inset 0 2px 4px rgba(255,255,255,.9), 0 16px 34px rgba(196,120,74,.14)">
            <Fx
              as="span"
              s="width:52px;height:52px;border-radius:20px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 10px 20px rgba(196,120,74,.16)"
            >
              💬
            </Fx>
            <Fx as="h2" s="font-size:28px;margin-top:20px">
              Ask Pip anything
            </Fx>
            <Fx
              as="p"
              s="font-size:15px;line-height:1.65;color:rgba(36,26,22,.64);margin:12px 0 22px;max-width:38ch;text-wrap:pretty"
            >
              Our own chatbot is sitting in the bottom-right corner. It&apos;s the same thing we&apos;d build for you —
              try it.
            </Fx>
            <Fx
              as={Link}
              href={routes.chatbots}
              s="display:inline-flex;align-items:center;gap:10px;text-decoration:none;color:#241A16;font-weight:700;font-size:15px;padding:14px 22px;border-radius:999px;background:#fff;box-shadow:0 12px 24px rgba(196,120,74,.16);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
              hover="transform:translateY(-3px)"
            >
              See how chatbots work <Fx as="span" s="color:#E8480F">→</Fx>
            </Fx>
          </Fx>
          <Fx s="background:linear-gradient(150deg,#EEEBFE,#F6F2FF);border-radius:38px;padding:40px 36px;box-shadow:inset 0 2px 4px rgba(255,255,255,.9), 0 16px 34px rgba(120,90,220,.14)">
            <Fx
              as="span"
              s="width:52px;height:52px;border-radius:20px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 10px 20px rgba(120,90,220,.18)"
            >
              📞
            </Fx>
            <Fx as="h2" s="font-size:28px;margin-top:20px">
              Or just talk to us
            </Fx>
            <Fx
              as="p"
              s="font-size:15px;line-height:1.65;color:rgba(36,26,22,.64);margin:12px 0 22px;max-width:38ch;text-wrap:pretty"
            >
              Twenty minutes, no slides, no pressure. We&apos;ll tell you honestly whether we can help.
            </Fx>
            <Fx
              as="a"
              href={contactPoints.demoCall}
              s="display:inline-flex;align-items:center;gap:10px;text-decoration:none;color:#fff;font-weight:700;font-size:15px;padding:14px 22px;border-radius:999px;background:linear-gradient(180deg,#8F7CFF,#5A48D6);box-shadow:0 14px 28px rgba(90,72,214,.34);transition:transform .3s cubic-bezier(.34,1.56,.64,1);animation:floaty 5s ease-in-out infinite"
              hover="transform:translateY(-3px)"
            >
              Book a demo call →
            </Fx>
          </Fx>
        </Fx>
      </Fx>
    </>
  );
}
