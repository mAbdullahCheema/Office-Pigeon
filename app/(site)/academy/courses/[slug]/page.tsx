import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CourseView } from '@/components/site/academy/CourseView';
import { Shell } from '@/components/site/Shell';
import { JsonLd } from '@/components/ui/JsonLd';
import { courseBySlug, coursePath, courses } from '@/lib/courses';
import { routes } from '@/lib/routes';
import { abs, breadcrumbs, educationalOrganization, graph, webPage } from '@/lib/schema';
import { siteUrl } from '@/lib/supabase/config';

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = courseBySlug(slug);
  if (!course) return {};

  const url = `${siteUrl}${coursePath(course)}`;

  return {
    title: course.metaTitle,
    description: course.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: `${course.metaTitle} | Office Pigeon Academy`,
      description: course.metaDescription,
      images: [{ url: `${siteUrl}/images/course-ai-banner.webp`, width: 1600, height: 914, alt: course.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${course.metaTitle} | Office Pigeon Academy`,
      description: course.metaDescription,
      images: [`${siteUrl}/images/course-ai-banner.webp`],
    },
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = courseBySlug(slug);
  if (!course) notFound();

  const cheapest = course.tiers.reduce((low, tier) => (tier.price < low.price ? tier : low), course.tiers[0]);

  // Course structured data, kept to what the page actually states — an hourly
  // rate and a sixteen-week program, with no outcome claim attached.
  const schema = graph(
    webPage({
      path: coursePath(course),
      name: `${course.name} — Office Pigeon Academy`,
      description: course.metaDescription,
    }),
    breadcrumbs([
      { name: 'Academy', path: routes.academy },
      { name: 'Professional courses', path: routes.courses },
      { name: course.name, path: coursePath(course) },
    ]),
    {
      '@type': 'Course',
      '@id': `${abs(coursePath(course))}#course`,
      name: course.name,
      description: course.metaDescription,
      url: abs(coursePath(course)),
      provider: { '@id': `${abs(routes.academy)}#academy` },
      educationalLevel: 'Beginner',
      teaches: course.skills,
      inLanguage: 'en',
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'online',
        courseWorkload: 'P16W',
        offers: {
          '@type': 'Offer',
          price: cheapest.price,
          priceCurrency: 'USD',
          category: 'per hour',
          availability: 'https://schema.org/InStock',
          url: abs(routes.order),
        },
      },
    },
    educationalOrganization(),
  );

  return (
    <Shell active="academy">
      <JsonLd data={schema} />
      <CourseView course={course} />
    </Shell>
  );
}
