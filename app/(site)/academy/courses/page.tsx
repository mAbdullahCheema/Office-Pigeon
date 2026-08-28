import type { Metadata } from 'next';
import Link from 'next/link';

import { Shell } from '@/components/site/Shell';
import { Fx } from '@/components/ui/Fx';
import { JsonLd } from '@/components/ui/JsonLd';
import { coursePath, courses } from '@/lib/courses';
import { contactPoints, routes } from '@/lib/routes';
import { abs, breadcrumbs, graph, webPage } from '@/lib/schema';
import { pageMeta } from '@/lib/seo';

const description =
  'The Academy’s professional track: practical technology courses taught one-to-one, starting with Applied AI Engineering — Python, AI applications, RAG, automation and AI agents.';

export const metadata: Metadata = pageMeta({
  path: routes.courses,
  title: 'Professional courses',
  description,
});

const schema = graph(
  webPage({
    path: routes.courses,
    name: 'Professional courses — Office Pigeon Academy',
    description,
    type: 'CollectionPage',
  }),
  breadcrumbs([
    { name: 'Academy', path: routes.academy },
    { name: 'Professional courses', path: routes.courses },
  ]),
  {
    '@type': 'ItemList',
    name: 'Office Pigeon Academy professional courses',
    numberOfItems: courses.length,
    itemListElement: courses.map((course, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: course.name,
      url: abs(coursePath(course)),
    })),
  },
);

const lift = 'transform:translateY(-4px)';

export default function CoursesPage() {
  return (
    <Shell active="academy">
      <JsonLd data={schema} />
      <Fx as="section" s="position:relative;z-index:1;padding:56px 20px 72px">
        <Fx s="max-width:1060px;margin:0 auto;text-align:center">
          <Fx s="display:inline-flex;align-items:center;gap:10px;background:#fff;border-radius:999px;padding:8px 18px 8px 10px;box-shadow:0 10px 22px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9);font-size:13px;font-weight:700;color:#5A48D6">
            <Fx
              as="span"
              s="width:26px;height:26px;border-radius:50%;background:#EEEBFE;display:flex;align-items:center;justify-content:center;font-size:12px"
            >
              🤖
            </Fx>
            Professional track
          </Fx>
          <Fx as="h1" s="font-size:clamp(38px,5vw,64px);margin:22px auto 0;max-width:18ch">
            Technology courses, taught one-to-one.
          </Fx>
          <Fx
            as="p"
            s="font-size:18px;line-height:1.66;color:rgba(36,26,22,.64);max-width:56ch;margin:20px auto 0;text-wrap:pretty"
          >
            Separate from school tutoring: practical, project-driven programs for students, career changers and
            founders who want to build with the technology rather than read about it. Every course starts with a free
            introductory session.
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 96px">
        <Fx className="two" s="max-width:1060px;margin:0 auto;display:grid;grid-template-columns:repeat(2,1fr);gap:18px;align-items:start">
          {courses.map((course) => (
            <Fx
              key={course.slug}
              as={Link}
              href={coursePath(course)}
              className="clay"
              s={`display:block;text-decoration:none;color:#241A16;background:${course.wash};border-radius:36px;padding:34px 32px 36px;box-shadow:0 18px 38px rgba(196,120,74,.15), inset 0 2px 4px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)`}
              hover={lift}
            >
              <Fx s="display:flex;align-items:center;gap:12px">
                <Fx
                  as="span"
                  s="width:48px;height:48px;border-radius:18px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 10px 20px rgba(196,120,74,.16)"
                >
                  {course.badgeIcon}
                </Fx>
                <Fx s={`font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:${course.accent}`}>
                  {course.badge}
                </Fx>
              </Fx>

              <Fx as="h2" s="font-size:30px;margin-top:20px">
                {course.name}
              </Fx>
              <Fx as="p" s="font-size:15.5px;line-height:1.65;color:rgba(36,26,22,.64);margin:12px 0 0;text-wrap:pretty">
                {course.cardBlurb}
              </Fx>

              <Fx s="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px">
                {course.heroStats.map((stat) => (
                  <Fx key={stat.label} s="background:#fff;border-radius:18px;padding:12px 16px">
                    <Fx s={`font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:20px;color:${course.accent}`}>
                      {stat.value}
                    </Fx>
                    <Fx s="font-size:11.5px;color:rgba(36,26,22,.55);margin-top:2px">{stat.label}</Fx>
                  </Fx>
                ))}
              </Fx>

              <Fx s="display:inline-flex;align-items:center;gap:10px;margin-top:24px;font-weight:700;font-size:15px;color:#E8480F">
                See the curriculum →
              </Fx>
            </Fx>
          ))}

          <Fx s="background:#fff;border-radius:36px;padding:34px 32px 36px;box-shadow:0 16px 34px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9)">
            <Fx
              as="span"
              s="width:48px;height:48px;border-radius:18px;background:#FFF4D8;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)"
            >
              🧭
            </Fx>
            <Fx as="h2" s="font-size:26px;margin-top:20px;max-width:16ch">
              Not sure which track fits?
            </Fx>
            <Fx as="p" s="font-size:15px;line-height:1.65;color:rgba(36,26,22,.62);margin:12px 0 0;text-wrap:pretty">
              School tutoring and the professional track are taught by different people for different goals. A short
              call sorts out which one you actually want — and the first session either way is free.
            </Fx>
            <Fx
              as="a"
              href={contactPoints.demoCall}
              s="display:inline-flex;align-items:center;gap:10px;margin-top:24px;text-decoration:none;color:#fff;font-weight:700;font-size:15.5px;padding:15px 24px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 14px 28px rgba(226,78,23,.34), inset 0 2px 3px rgba(255,255,255,.45);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
              hover={lift}
            >
              Book a free session
            </Fx>
          </Fx>
        </Fx>
      </Fx>
    </Shell>
  );
}
