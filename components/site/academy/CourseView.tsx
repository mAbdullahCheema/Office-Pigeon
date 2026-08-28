'use client';

import Link from 'next/link';
import { useState } from 'react';

import { PriceNote } from '@/components/site/PriceNote';
import { Fx } from '@/components/ui/Fx';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { pairs } from '@/lib/content-defaults';
import type { Course } from '@/lib/courses';
import { contactPoints, routes } from '@/lib/routes';

/**
 * One professional-track course, rendered from its entry in `lib/courses.ts`.
 * Everything on this page is data, so a second course is a new object rather
 * than a new page.
 */

const lift = 'transform:translateY(-4px)';
const liftScale = 'transform:translateY(-4px) scale(1.02)';

const kicker = 'font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase';
const sectionHead = 'font-size:clamp(32px,4.2vw,52px);margin-top:14px';
const lede = 'font-size:16.5px;line-height:1.66;color:rgba(36,26,22,.62);margin:16px auto 0;text-wrap:pretty';

function bookHref(course: Course): string {
  return `${contactPoints.demoCall}?utm_source=site&utm_content=${course.slug}`;
}

export function CourseView({ course }: { course: Course }) {
  const [openPhase, setOpenPhase] = useState(0);
  const [openWeek, setOpenWeek] = useState('');

  const orderHref = `${routes.order}?item=${course.itemId}`;
  const formatRows = pairs(course.format, ['label', 'value']);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Fx as="section" s="position:relative;z-index:1;padding:64px 20px 84px;overflow:hidden">
        <Fx s="max-width:1060px;margin:0 auto;position:relative;text-align:center">
          <Fx
            s={`display:inline-flex;align-items:center;gap:10px;background:#fff;border-radius:999px;padding:8px 18px 8px 10px;box-shadow:0 10px 22px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9);font-size:13px;font-weight:700;color:${course.accent};animation:pop .7s cubic-bezier(.34,1.4,.64,1) both`}
          >
            <Fx
              as="span"
              s="width:26px;height:26px;border-radius:50%;background:#EEEBFE;display:flex;align-items:center;justify-content:center;font-size:12px"
            >
              {course.badgeIcon}
            </Fx>
            {course.badge}
          </Fx>

          <Fx
            as="h1"
            s="font-family:var(--font-bricolage),system-ui,sans-serif;font-size:clamp(38px,5.2vw,68px);margin:22px auto 0;max-width:17ch;animation:pop .8s ease-out .1s both"
          >
            {course.headline}
          </Fx>

          <Fx as="p" s={`${lede};font-size:18.5px;max-width:60ch;animation:pop .8s ease-out .2s both`}>
            {course.lede}
          </Fx>

          <Fx s="display:flex;gap:14px;margin-top:32px;flex-wrap:wrap;justify-content:center;animation:pop .8s ease-out .3s both">
            <Fx
              as="a"
              href={bookHref(course)}
              s="display:flex;align-items:center;gap:12px;text-decoration:none;color:#fff;font-weight:700;font-size:16px;padding:17px 22px 17px 28px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 18px 34px rgba(226,78,23,.38), inset 0 2px 3px rgba(255,255,255,.45);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
              hover={liftScale}
            >
              Book a free introductory session
              <Fx
                as="span"
                s="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:14px"
              >
                →
              </Fx>
            </Fx>
            <Fx
              as="a"
              href="#curriculum"
              s="display:flex;align-items:center;text-decoration:none;color:#241A16;font-weight:700;font-size:16px;padding:17px 26px;border-radius:999px;background:#fff;box-shadow:0 14px 26px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
              hover={lift}
            >
              View course curriculum
            </Fx>
          </Fx>

          <Fx s="display:flex;gap:12px;margin-top:34px;flex-wrap:wrap;justify-content:center;animation:pop .8s ease-out .4s both">
            {course.heroStats.map((stat) => (
              <Fx
                key={stat.label}
                s="background:#fff;border-radius:24px;padding:16px 24px;box-shadow:0 12px 26px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9)"
              >
                <Fx
                  s={`font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:27px;color:${course.accent}`}
                >
                  {stat.value}
                </Fx>
                <Fx s="font-size:12.5px;color:rgba(36,26,22,.55);margin-top:3px">{stat.label}</Fx>
              </Fx>
            ))}
          </Fx>

          <Fx s="font-size:13.5px;color:rgba(36,26,22,.5);margin-top:22px">
            One-to-one and live — not a prerecorded course and not a classroom.
          </Fx>
        </Fx>
      </Fx>

      {/* ── Free introductory session ────────────────────────────────── */}
      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx
          className="pad-xl"
          s={`max-width:1260px;margin:0 auto;background:${course.wash};border-radius:46px;padding:48px 44px;box-shadow:inset 0 2px 4px rgba(255,255,255,.9), 0 20px 44px rgba(196,120,74,.14)`}
        >
          <Fx className="two" s="display:grid;grid-template-columns:minmax(0,.95fr) minmax(0,1.05fr);gap:38px;align-items:center">
            <Fx>
              <Fx s={`${kicker};color:${course.accent}`}>Start here</Fx>
              <Fx as="h2" s="font-size:clamp(30px,3.8vw,46px);margin-top:14px;max-width:16ch">
                Your first session is free.
              </Fx>
              <Fx as="p" s={`${lede};margin-left:0;max-width:46ch`}>
                The first session is an introductory assessment and orientation. No payment is required for it, and
                there is nothing to commit to at the end of it.
              </Fx>
              <Fx
                as="a"
                href={bookHref(course)}
                s="display:inline-flex;align-items:center;gap:12px;margin-top:28px;text-decoration:none;color:#fff;font-weight:700;font-size:16px;padding:17px 22px 17px 28px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 18px 34px rgba(226,78,23,.38), inset 0 2px 3px rgba(255,255,255,.45);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                hover={liftScale}
              >
                Book my free introductory session
                <Fx
                  as="span"
                  s="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:14px"
                >
                  →
                </Fx>
              </Fx>
            </Fx>

            <Fx s="background:#fff;border-radius:34px;padding:32px 30px;box-shadow:0 18px 38px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9)">
              <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:19px;letter-spacing:-0.02em">
                What the first session covers
              </Fx>
              <Fx as="ul" s="list-style:none;padding:0;margin:18px 0 0;display:flex;flex-direction:column;gap:12px">
                {course.intro.map((line) => (
                  <Fx key={line} as="li" s="display:flex;align-items:flex-start;gap:12px">
                    <Fx
                      as="span"
                      s="width:24px;height:24px;flex:none;border-radius:9px;background:#E9FBF3;color:#0F9C6E;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;margin-top:1px"
                    >
                      ✓
                    </Fx>
                    <Fx as="span" s="font-size:15px;line-height:1.55;color:rgba(36,26,22,.72)">
                      {line}
                    </Fx>
                  </Fx>
                ))}
              </Fx>
            </Fx>
          </Fx>
        </Fx>
      </Fx>

      {/* ── Why ──────────────────────────────────────────────────────── */}
      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:1260px;margin:0 auto">
          <Fx s="text-align:center">
            <Fx s={`${kicker};color:#E8480F`}>Why {course.name}</Fx>
            <Fx as="h2" s={sectionHead}>
              Don’t just learn to use AI. Learn to build with it.
            </Fx>
          </Fx>
          <Fx className="three" s="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:34px">
            {course.why.map((item) => (
              <Fx
                key={item.title}
                className="clay"
                s="background:#fff;border-radius:30px;padding:26px 24px 28px;box-shadow:0 16px 34px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9)"
              >
                <Fx
                  as="span"
                  s="width:48px;height:48px;border-radius:18px;background:#EEEBFE;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)"
                >
                  {item.icon}
                </Fx>
                <Fx as="h3" s="font-size:19.5px;margin-top:16px">
                  {item.title}
                </Fx>
                <Fx as="p" s="font-size:14px;line-height:1.6;color:rgba(36,26,22,.62);margin:9px 0 0;text-wrap:pretty">
                  {item.body}
                </Fx>
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      {/* ── Who it is for ────────────────────────────────────────────── */}
      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:1260px;margin:0 auto">
          <Fx s="text-align:center">
            <Fx s={`${kicker};color:${course.accent}`}>Who is this for?</Fx>
            <Fx as="h2" s={sectionHead}>
              Built for people starting from scratch.
            </Fx>
          </Fx>
          <Fx className="three" s="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:34px">
            {course.audience.map((card) => (
              <Fx
                key={card.title}
                className="clay"
                s="background:#fff;border-radius:28px;padding:24px 22px 26px;box-shadow:0 14px 30px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9)"
              >
                <Fx
                  as="span"
                  s="width:44px;height:44px;border-radius:16px;background:#FFF0E7;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)"
                >
                  {card.icon}
                </Fx>
                <Fx as="h3" s="font-size:18.5px;margin-top:16px">
                  {card.title}
                </Fx>
                <Fx as="p" s="font-size:13.5px;line-height:1.6;color:rgba(36,26,22,.62);margin:8px 0 0;text-wrap:pretty">
                  {card.body}
                </Fx>
              </Fx>
            ))}
          </Fx>
          <Fx s="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:26px">
            {['No prior AI experience required', 'No advanced mathematics required', 'No computer science degree required', 'Basic computer literacy expected'].map(
              (chip) => (
                <Fx
                  key={chip}
                  s="font-size:13px;font-weight:700;color:rgba(36,26,22,.62);background:#fff;border-radius:999px;padding:10px 18px;box-shadow:0 10px 20px rgba(196,120,74,.12), inset 0 2px 3px rgba(255,255,255,.9)"
                >
                  {chip}
                </Fx>
              ),
            )}
          </Fx>
        </Fx>
      </Fx>

      {/* ── Meet your mentor ─────────────────────────────────────────── */}
      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:1260px;margin:0 auto;background:linear-gradient(150deg,#EEEBFE,#F6F2FF 52%,#FFF0E7);border-radius:46px;padding:14px;box-shadow:inset 0 2px 4px rgba(255,255,255,.9), 0 20px 44px rgba(196,120,74,.14)">
          <Fx
            className="two"
            s="display:grid;grid-template-columns:minmax(0,1.06fr) minmax(0,.94fr);gap:14px;align-items:stretch"
          >
            <Fx className="pad-xl" s="padding:44px 38px">
              <Fx s={`${kicker};color:${course.accent}`}>How it actually runs</Fx>
              <Fx as="h2" s="font-size:clamp(30px,3.8vw,46px);margin-top:14px;max-width:16ch">
                One mentor, start to finish.
              </Fx>
              <Fx
                as="p"
                s="font-size:16px;line-height:1.68;color:rgba(36,26,22,.64);max-width:42ch;margin:14px 0 0;text-wrap:pretty"
              >
                Every session is live and one-to-one. You build real applications alongside your mentor, at the pace
                that suits you, with the same person from your first line of Python to your final deployed project.
              </Fx>
              <Fx s="display:flex;flex-wrap:wrap;gap:10px;margin-top:26px">
                {['Live 1-on-1 sessions', 'Your own pace', 'Real deployed projects', 'Same mentor throughout'].map(
                  (chip) => (
                    <Fx
                      key={chip}
                      s="font-size:13px;font-weight:700;color:rgba(36,26,22,.64);background:#fff;border-radius:999px;padding:10px 18px;box-shadow:0 10px 20px rgba(196,120,74,.12), inset 0 2px 3px rgba(255,255,255,.9)"
                    >
                      {chip}
                    </Fx>
                  ),
                )}
              </Fx>
            </Fx>
            <Fx s="border-radius:36px;overflow:hidden;min-height:460px;background:#fff">
              <ImageSlot
                id="course-mentor"
                placeholder="A student in a one-to-one session with their mentor"
                sizes="(max-width: 1000px) 92vw, 600px"
              />
            </Fx>
          </Fx>
        </Fx>
      </Fx>

      {/* ── The journey ──────────────────────────────────────────────── */}
      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx
          className="pad-xl"
          s="max-width:1260px;margin:0 auto;background:linear-gradient(160deg,#2A1A12,#3D2317 55%,#241A16);color:#FFEFE5;border-radius:46px;padding:52px 44px;position:relative;overflow:hidden"
        >
          <Fx s="text-align:center;position:relative">
            <Fx s={`${kicker};color:#FFB98A`}>The transformation</Fx>
            <Fx as="h2" s="font-size:clamp(30px,3.8vw,48px);margin-top:14px;color:#fff">
              From zero to applied AI engineer
            </Fx>
            <Fx as="p" s={`${lede};color:rgba(255,239,229,.7);max-width:56ch`}>
              {course.journeyNote}
            </Fx>
          </Fx>

          <Fx s="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px;margin-top:34px;position:relative">
            {course.journey.map((step, index) => (
              <Fx key={step} s="display:flex;align-items:center;gap:10px">
                <Fx
                  s={`display:flex;align-items:center;gap:10px;background:${
                    index === course.journey.length - 1 ? 'linear-gradient(180deg,#FF8149,#EF5A1F)' : 'rgba(255,255,255,.08)'
                  };border-radius:999px;padding:11px 18px;font-size:14px;font-weight:700;color:#fff;box-shadow:${
                    index === course.journey.length - 1 ? '0 14px 28px rgba(226,78,23,.4)' : 'inset 0 1px 1px rgba(255,255,255,.12)'
                  }`}
                >
                  <Fx
                    as="span"
                    s="font-family:var(--font-bricolage),system-ui,sans-serif;font-size:11.5px;font-weight:800;color:rgba(255,255,255,.55)"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </Fx>
                  {step}
                </Fx>
                {index < course.journey.length - 1 ? (
                  <Fx as="span" s="color:rgba(255,239,229,.32);font-size:15px">
                    ↓
                  </Fx>
                ) : null}
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      {/* ── Curriculum ───────────────────────────────────────────────── */}
      <Fx as="section" id="curriculum" className="rv" s="position:relative;z-index:1;padding:0 20px 92px;scroll-margin-top:96px">
        <Fx s="max-width:960px;margin:0 auto">
          <Fx s="text-align:center">
            <Fx s={`${kicker};color:#E8480F`}>Curriculum</Fx>
            <Fx as="h2" s={sectionHead}>
              16 weeks. One complete AI engineering journey.
            </Fx>
          </Fx>

          <Fx s="display:flex;flex-direction:column;gap:12px;margin-top:34px">
            {course.phases.map((phase, phaseIndex) => {
              const phaseOpen = openPhase === phaseIndex;
              return (
                <Fx
                  key={phase.name}
                  s="background:#fff;border-radius:28px;box-shadow:0 14px 30px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9);overflow:hidden"
                >
                  <Fx
                    as="button"
                    type="button"
                    aria-expanded={phaseOpen}
                    onClick={() => setOpenPhase(phaseOpen ? -1 : phaseIndex)}
                    s="width:100%;border:0;background:transparent;cursor:pointer;font-family:inherit;text-align:left;display:flex;align-items:center;gap:16px;padding:22px 26px;color:#241A16"
                  >
                    <Fx
                      as="span"
                      s="flex:1;font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:18.5px;letter-spacing:-0.02em"
                    >
                      {phase.name}
                    </Fx>
                    <Fx as="span" s="font-size:12.5px;color:rgba(36,26,22,.45);font-weight:700">
                      {phase.weeks.length === 1 ? '1 week' : `${phase.weeks.length} weeks`}
                    </Fx>
                    <Fx
                      as="span"
                      s={`width:34px;height:34px;flex:none;border-radius:13px;background:${
                        phaseOpen ? 'linear-gradient(150deg,#FFA46A,#EF5A1F)' : '#FFF0E7'
                      };color:${
                        phaseOpen ? '#fff' : '#E8480F'
                      };display:flex;align-items:center;justify-content:center;font-size:16px;transition:transform .35s cubic-bezier(.34,1.56,.64,1), background .3s;transform:${
                        phaseOpen ? 'rotate(135deg)' : 'rotate(0deg)'
                      }`}
                    >
                      +
                    </Fx>
                  </Fx>

                  {phaseOpen ? (
                    <Fx s="padding:0 20px 20px;display:flex;flex-direction:column;gap:10px">
                      {phase.weeks.map((week) => {
                        const key = `${phaseIndex}-${week.label}`;
                        const weekOpen = openWeek === key;
                        return (
                          <Fx key={key} s="background:#FFF9F5;border-radius:22px;overflow:hidden">
                            <Fx
                              as="button"
                              type="button"
                              aria-expanded={weekOpen}
                              onClick={() => setOpenWeek(weekOpen ? '' : key)}
                              s="width:100%;border:0;background:transparent;cursor:pointer;font-family:inherit;text-align:left;display:flex;align-items:center;gap:14px;padding:16px 20px;color:#241A16"
                            >
                              <Fx
                                as="span"
                                s={`flex:none;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${course.accent}`}
                              >
                                {week.label}
                              </Fx>
                              <Fx as="span" s="flex:1;font-weight:700;font-size:16px">
                                {week.title}
                              </Fx>
                              <Fx as="span" s={`font-size:15px;color:rgba(36,26,22,.4);transition:transform .3s;transform:${weekOpen ? 'rotate(180deg)' : 'rotate(0deg)'}`}>
                                ⌄
                              </Fx>
                            </Fx>

                            {weekOpen ? (
                              <Fx s="padding:0 20px 20px">
                                <Fx s="display:flex;flex-wrap:wrap;gap:8px">
                                  {week.topics.map((topic) => (
                                    <Fx
                                      key={topic}
                                      s="font-size:13px;color:rgba(36,26,22,.66);background:#fff;border-radius:999px;padding:8px 14px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9), 0 6px 12px rgba(196,120,74,.08)"
                                    >
                                      {topic}
                                    </Fx>
                                  ))}
                                </Fx>
                                {week.project ? (
                                  <Fx s="display:flex;align-items:center;gap:10px;margin-top:16px;background:#EEEBFE;border-radius:16px;padding:12px 16px">
                                    <Fx as="span" s="font-size:15px">
                                      🛠️
                                    </Fx>
                                    <Fx as="span" s="font-size:14px;font-weight:700;color:#4A39B8">
                                      Project — {week.project}
                                    </Fx>
                                  </Fx>
                                ) : null}
                                {week.outcome ? (
                                  <Fx s="display:flex;align-items:center;gap:10px;margin-top:10px;background:#E9FBF3;border-radius:16px;padding:12px 16px">
                                    <Fx as="span" s="font-size:15px">
                                      🎯
                                    </Fx>
                                    <Fx as="span" s="font-size:14px;font-weight:700;color:#0F9C6E">
                                      Outcome — {week.outcome}
                                    </Fx>
                                  </Fx>
                                ) : null}
                                {week.note ? (
                                  <Fx as="p" s="font-size:13.5px;line-height:1.6;color:rgba(36,26,22,.55);margin:14px 0 0;text-wrap:pretty">
                                    {week.note}
                                  </Fx>
                                ) : null}
                              </Fx>
                            ) : null}
                          </Fx>
                        );
                      })}
                    </Fx>
                  ) : null}
                </Fx>
              );
            })}
          </Fx>
        </Fx>
      </Fx>

      {/* ── Projects ─────────────────────────────────────────────────── */}
      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:1260px;margin:0 auto">
          <Fx s="text-align:center">
            <Fx s={`${kicker};color:${course.accent}`}>Projects</Fx>
            <Fx as="h2" s={sectionHead}>
              You don’t just learn. You build.
            </Fx>
            <Fx as="p" s={`${lede};max-width:54ch`}>
              {course.projectsNote}
            </Fx>
          </Fx>
          <Fx className="four" s="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:34px">
            {course.projects.map((project, index) => (
              <Fx
                key={project}
                className="clay"
                s="background:#fff;border-radius:26px;padding:22px 20px 24px;box-shadow:0 14px 30px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9)"
              >
                <Fx
                  as="span"
                  s="width:36px;height:36px;border-radius:13px;background:linear-gradient(150deg,#A79BFF,#5A48D6);color:#fff;font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:15px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 16px rgba(90,72,214,.28)"
                >
                  {index + 1}
                </Fx>
                <Fx as="h3" s="font-size:17px;margin-top:14px">
                  {project}
                </Fx>
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      {/* ── Skills ───────────────────────────────────────────────────── */}
      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx
          className="pad-xl"
          s="max-width:1260px;margin:0 auto;background:#fff;border-radius:46px;padding:48px 44px;box-shadow:0 20px 44px rgba(196,120,74,.14), inset 0 2px 4px rgba(255,255,255,.95)"
        >
          <Fx s="text-align:center">
            <Fx s={`${kicker};color:#E8480F`}>Skills</Fx>
            <Fx as="h2" s={sectionHead}>
              What you will actually learn
            </Fx>
          </Fx>
          <Fx s="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:30px">
            {course.skills.map((skill) => (
              <Fx
                key={skill}
                s="font-size:14px;font-weight:700;color:rgba(36,26,22,.72);background:#FFF9F5;border-radius:999px;padding:11px 18px;box-shadow:inset 0 2px 5px rgba(196,120,74,.12);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                hover="transform:translateY(-3px)"
              >
                {skill}
              </Fx>
            ))}
          </Fx>
          <Fx as="p" s={`${lede};text-align:center;max-width:58ch`}>
            {course.skillsNote}
          </Fx>
        </Fx>
      </Fx>

      {/* ── One-to-one advantage ─────────────────────────────────────── */}
      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:1260px;margin:0 auto">
          <Fx s="text-align:center">
            <Fx s={`${kicker};color:${course.accent}`}>The 1-on-1 advantage</Fx>
            <Fx as="h2" s={sectionHead}>
              Learn AI your way.
            </Fx>
            <Fx as="p" s={`${lede};max-width:52ch`}>
              Everyone starts from a different place. That is why {course.name} is taught one-to-one.
            </Fx>
          </Fx>
          <Fx s="margin-top:32px;border-radius:38px;overflow:hidden;height:clamp(240px,34vw,420px);background:#fff;box-shadow:0 20px 44px rgba(196,120,74,.16)">
            <ImageSlot
              id="course-applied-ai"
              placeholder="A student in a one-to-one session, building an AI application"
              sizes="(max-width: 1300px) 94vw, 1220px"
            />
          </Fx>
          <Fx className="three" s="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:34px">
            {course.advantages.map((item) => (
              <Fx
                key={item.title}
                className="clay"
                s="background:#fff;border-radius:28px;padding:24px 22px 26px;box-shadow:0 14px 30px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9)"
              >
                <Fx
                  as="span"
                  s="width:44px;height:44px;border-radius:16px;background:#E9FBF3;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)"
                >
                  {item.icon}
                </Fx>
                <Fx as="h3" s="font-size:18.5px;margin-top:16px">
                  {item.title}
                </Fx>
                <Fx as="p" s="font-size:13.5px;line-height:1.6;color:rgba(36,26,22,.62);margin:8px 0 0;text-wrap:pretty">
                  {item.body}
                </Fx>
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      {/* ── What makes it different ──────────────────────────────────── */}
      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:1060px;margin:0 auto">
          <Fx s="text-align:center">
            <Fx s={`${kicker};color:#E8480F`}>The difference</Fx>
            <Fx as="h2" s={sectionHead}>
              This isn’t another “AI tools” course.
            </Fx>
            <Fx as="p" s={`${lede};max-width:54ch`}>
              Learn the technology behind AI applications — not just how to use AI tools.
            </Fx>
          </Fx>

          <Fx className="two" s="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:34px;align-items:start">
            <Fx s="background:#fff;border-radius:32px;padding:30px 28px;box-shadow:0 14px 30px rgba(196,120,74,.12), inset 0 2px 3px rgba(255,255,255,.9)">
              <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:19px;color:rgba(36,26,22,.5)">
                A typical AI course
              </Fx>
              <Fx as="ul" s="list-style:none;padding:0;margin:18px 0 0;display:flex;flex-direction:column;gap:11px">
                {course.typicalCourse.map((line) => (
                  <Fx key={line} as="li" s="display:flex;align-items:center;gap:12px">
                    <Fx
                      as="span"
                      s="width:22px;height:22px;flex:none;border-radius:8px;background:#F1EFE8;color:rgba(36,26,22,.4);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800"
                    >
                      ✕
                    </Fx>
                    <Fx as="span" s="font-size:14.5px;color:rgba(36,26,22,.55)">
                      {line}
                    </Fx>
                  </Fx>
                ))}
              </Fx>
            </Fx>

            <Fx s="background:linear-gradient(160deg,#8F7CFF,#5A48D6);color:#fff;border-radius:32px;padding:30px 28px;box-shadow:0 26px 52px rgba(90,72,214,.4), inset 0 2px 3px rgba(255,255,255,.35)">
              <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:19px">
                {course.name}
              </Fx>
              <Fx as="ul" s="list-style:none;padding:0;margin:18px 0 0;display:flex;flex-direction:column;gap:11px">
                {course.thisCourse.map((line) => (
                  <Fx key={line} as="li" s="display:flex;align-items:center;gap:12px">
                    <Fx
                      as="span"
                      s="width:22px;height:22px;flex:none;border-radius:8px;background:rgba(255,255,255,.24);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800"
                    >
                      ✓
                    </Fx>
                    <Fx as="span" s="font-size:14.5px">
                      {line}
                    </Fx>
                  </Fx>
                ))}
              </Fx>
            </Fx>
          </Fx>
        </Fx>
      </Fx>

      {/* ── Career directions ────────────────────────────────────────── */}
      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:1060px;margin:0 auto;text-align:center">
          <Fx s={`${kicker};color:${course.accent}`}>Career directions</Fx>
          <Fx as="h2" s={sectionHead}>
            Where these skills can take you
          </Fx>
          <Fx s="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:28px">
            {course.careers.map((career) => (
              <Fx
                key={career}
                s="font-size:14px;font-weight:700;color:#241A16;background:#fff;border-radius:999px;padding:12px 20px;box-shadow:0 12px 24px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9)"
              >
                {career}
              </Fx>
            ))}
          </Fx>
          <Fx as="p" s={`${lede};max-width:58ch`}>
            {course.careersNote}
          </Fx>
        </Fx>
      </Fx>

      {/* ── Pricing ──────────────────────────────────────────────────── */}
      <Fx as="section" id="pricing" className="rv" s="position:relative;z-index:1;padding:0 20px 92px;scroll-margin-top:96px">
        <Fx s="max-width:1260px;margin:0 auto">
          <Fx s="text-align:center">
            <Fx s={`${kicker};color:#E8480F`}>Pricing</Fx>
            <Fx as="h2" s={sectionHead}>
              Personalised training, priced by the hour.
            </Fx>
            <Fx as="p" s={`${lede};max-width:56ch`}>
              A typical sixteen-week program runs about 32 sessions — roughly $800 in total at the Standard rate. The
              first introductory session is free.
            </Fx>
          </Fx>

          <Fx className="three" s="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:34px;align-items:start">
            {course.tiers.map((tier) => (
              <Fx
                key={tier.planId}
                s={`background:${
                  tier.featured ? 'linear-gradient(160deg,#8F7CFF,#5A48D6)' : '#fff'
                };color:${tier.featured ? '#fff' : '#241A16'};border-radius:34px;padding:30px 28px 32px;box-shadow:${
                  tier.featured
                    ? '0 26px 52px rgba(90,72,214,.4), inset 0 2px 3px rgba(255,255,255,.35)'
                    : '0 16px 34px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9)'
                };position:relative`}
              >
                {tier.featured ? (
                  <Fx s="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#fff;color:#5A48D6;font-size:11.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;border-radius:999px;padding:7px 16px;box-shadow:0 10px 20px rgba(0,0,0,.14);white-space:nowrap">
                    Most popular
                  </Fx>
                ) : null}

                <Fx s={`${kicker};color:${tier.featured ? 'rgba(255,255,255,.75)' : course.accent}`}>{tier.name}</Fx>
                <Fx s="display:flex;align-items:baseline;gap:6px;margin-top:12px">
                  <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:44px;letter-spacing:-0.03em">
                    ${tier.price}
                  </Fx>
                  <Fx s={`font-size:15px;color:${tier.featured ? 'rgba(255,255,255,.7)' : 'rgba(36,26,22,.5)'}`}>
                    /hour
                  </Fx>
                </Fx>
                <Fx
                  as="p"
                  s={`font-size:14.5px;line-height:1.6;margin:10px 0 0;color:${
                    tier.featured ? 'rgba(255,255,255,.82)' : 'rgba(36,26,22,.62)'
                  };text-wrap:pretty`}
                >
                  {tier.summary}
                </Fx>

                <Fx
                  s={`height:1px;margin:22px 0;background:${tier.featured ? 'rgba(255,255,255,.24)' : '#F6E7DC'}`}
                />

                <Fx as="ul" s="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:11px">
                  {tier.items.map((item) => (
                    <Fx key={item} as="li" s="display:flex;align-items:flex-start;gap:11px">
                      <Fx
                        as="span"
                        s={`width:22px;height:22px;flex:none;border-radius:8px;background:${
                          tier.featured ? 'rgba(255,255,255,.24)' : '#E9FBF3'
                        };color:${
                          tier.featured ? '#fff' : '#0F9C6E'
                        };display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;margin-top:1px`}
                      >
                        ✓
                      </Fx>
                      <Fx as="span" s="font-size:14.5px;line-height:1.5">
                        {item}
                      </Fx>
                    </Fx>
                  ))}
                </Fx>

                <Fx
                  as={Link}
                  href={`${orderHref}&plan=${tier.planId}`}
                  s={`display:flex;align-items:center;justify-content:center;margin-top:26px;text-decoration:none;font-weight:700;font-size:15.5px;padding:15px 22px;border-radius:999px;background:${
                    tier.featured ? '#fff' : '#FFF0E7'
                  };color:${tier.featured ? '#5A48D6' : '#241A16'};box-shadow:${
                    tier.featured ? '0 12px 24px rgba(0,0,0,.14)' : 'inset 0 2px 3px rgba(255,255,255,.9)'
                  };transition:transform .3s cubic-bezier(.34,1.56,.64,1)`}
                  hover={lift}
                >
                  Choose {tier.name}
                </Fx>
              </Fx>
            ))}
          </Fx>

          <Fx s="margin-top:22px">
            <PriceNote />
          </Fx>
        </Fx>
      </Fx>

      {/* ── Format & prerequisites ───────────────────────────────────── */}
      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx className="two" s="max-width:1260px;margin:0 auto;display:grid;grid-template-columns:repeat(2,1fr);gap:18px;align-items:start">
          <Fx s="background:#fff;border-radius:36px;padding:36px 32px;box-shadow:0 16px 34px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9)">
            <Fx s={`${kicker};color:${course.accent}`}>Course format</Fx>
            <Fx as="h2" s="font-size:28px;margin-top:12px">
              How it runs
            </Fx>
            <Fx s="display:flex;flex-direction:column;margin-top:20px">
              {formatRows.map((row, index) => (
                <Fx
                  key={row.label}
                  s={`display:flex;gap:18px;justify-content:space-between;align-items:baseline;padding:13px 0;${
                    index === 0 ? '' : 'border-top:1px solid #F6E7DC'
                  }`}
                >
                  <Fx s="font-size:13.5px;font-weight:700;color:rgba(36,26,22,.45);flex:none">{row.label}</Fx>
                  <Fx s="font-size:14.5px;color:#241A16;text-align:right;text-wrap:pretty">{row.value}</Fx>
                </Fx>
              ))}
            </Fx>
          </Fx>

          <Fx s="background:linear-gradient(150deg,#E9FBF3,#F2FFFA 55%,#FFF4D8);border-radius:36px;padding:36px 32px;box-shadow:inset 0 2px 4px rgba(255,255,255,.9), 0 16px 34px rgba(196,120,74,.14)">
            <Fx s={`${kicker};color:#0F9C6E`}>Prerequisites</Fx>
            <Fx as="h2" s="font-size:28px;margin-top:12px;max-width:16ch">
              No technical background required.
            </Fx>

            <Fx s="font-size:12.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:rgba(36,26,22,.42);margin-top:24px">
              What you need
            </Fx>
            <Fx as="ul" s="list-style:none;padding:0;margin:12px 0 0;display:flex;flex-direction:column;gap:9px">
              {course.requirements.map((item) => (
                <Fx key={item} as="li" s="display:flex;align-items:center;gap:11px">
                  <Fx
                    as="span"
                    s="width:22px;height:22px;flex:none;border-radius:8px;background:#fff;color:#0F9C6E;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800"
                  >
                    ✓
                  </Fx>
                  <Fx as="span" s="font-size:14.5px;color:#241A16">
                    {item}
                  </Fx>
                </Fx>
              ))}
            </Fx>

            <Fx s="font-size:12.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:rgba(36,26,22,.42);margin-top:24px">
              What you don’t
            </Fx>
            <Fx s="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
              {course.notRequired.map((item) => (
                <Fx
                  key={item}
                  s="font-size:13px;color:rgba(36,26,22,.5);background:rgba(255,255,255,.7);border-radius:999px;padding:8px 14px;text-decoration:line-through"
                >
                  {item}
                </Fx>
              ))}
            </Fx>
          </Fx>
        </Fx>
      </Fx>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:860px;margin:0 auto">
          <Fx s="text-align:center">
            <Fx s={`${kicker};color:#E8480F`}>Questions</Fx>
            <Fx as="h2" s={sectionHead}>
              Before you book
            </Fx>
          </Fx>
          <Fx s="display:flex;flex-direction:column;gap:12px;margin-top:32px">
            {course.faqs.map((faq) => (
              <Fx
                key={faq.question}
                as="details"
                s="background:#fff;border-radius:26px;padding:20px 24px;box-shadow:0 14px 30px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9)"
              >
                <Fx
                  as="summary"
                  s="cursor:pointer;font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:17.5px;letter-spacing:-0.02em;color:#241A16;list-style:none"
                >
                  {faq.question}
                </Fx>
                <Fx
                  as="p"
                  s="font-size:15px;line-height:1.7;color:rgba(36,26,22,.66);margin:12px 0 0;max-width:62ch;text-wrap:pretty"
                >
                  {faq.answer}
                </Fx>
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      {/* ── Closing CTA ──────────────────────────────────────────────── */}
      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 96px">
        <Fx
          className="pad-xl"
          s="max-width:1260px;margin:0 auto;background:linear-gradient(160deg,#2A1A12,#3D2317 55%,#241A16);color:#FFEFE5;border-radius:46px;padding:56px 46px;text-align:center"
        >
          <Fx as="h2" s="font-size:clamp(30px,3.8vw,48px);color:#fff;max-width:18ch;margin:0 auto">
            {course.closing.title}
          </Fx>
          <Fx as="p" s={`${lede};color:rgba(255,239,229,.72);max-width:56ch`}>
            {course.closing.body}
          </Fx>
          <Fx s="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:30px">
            <Fx
              as="a"
              href={bookHref(course)}
              s="display:flex;align-items:center;gap:12px;text-decoration:none;color:#fff;font-weight:700;font-size:16px;padding:18px 24px 18px 30px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 18px 34px rgba(226,78,23,.4), inset 0 2px 3px rgba(255,255,255,.45);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
              hover={liftScale}
            >
              Book my free session
              <Fx
                as="span"
                s="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:13px"
              >
                →
              </Fx>
            </Fx>
            <Fx
              as={Link}
              href={routes.contact}
              s="display:flex;align-items:center;text-decoration:none;color:#241A16;font-weight:700;font-size:16px;padding:18px 26px;border-radius:999px;background:#fff;box-shadow:0 14px 26px rgba(0,0,0,.2);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
              hover={lift}
            >
              Ask a question first
            </Fx>
          </Fx>
          <Fx s="font-size:13.5px;color:rgba(255,239,229,.55);margin-top:20px">{course.closing.footnote}</Fx>
        </Fx>
      </Fx>
    </>
  );
}
