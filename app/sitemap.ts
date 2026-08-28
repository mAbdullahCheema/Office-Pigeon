import type { MetadataRoute } from 'next';

import { coursePath, courses } from '@/lib/courses';
import { siteUrl } from '@/lib/supabase/config';
import { routes } from '@/lib/routes';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths: { path: string; priority: number }[] = [
    { path: routes.home, priority: 1 },
    { path: routes.products, priority: 0.9 },
    { path: routes.pricing, priority: 0.9 },
    { path: routes.websites, priority: 0.8 },
    { path: routes.chatbots, priority: 0.8 },
    { path: routes.callingAgents, priority: 0.8 },
    { path: routes.automations, priority: 0.8 },
    { path: routes.academy, priority: 0.8 },
    { path: routes.courses, priority: 0.8 },
    ...courses.map((course) => ({ path: coursePath(course), priority: 0.8 })),
    { path: routes.smartSchool, priority: 0.7 },
    { path: routes.aiFinance, priority: 0.7 },
    { path: routes.aiRecipes, priority: 0.7 },
    { path: routes.whiteboard, priority: 0.7 },
    { path: routes.examples, priority: 0.7 },
    { path: routes.faq, priority: 0.6 },
    { path: routes.contact, priority: 0.6 },
    { path: routes.order, priority: 0.6 },
    { path: routes.legal, priority: 0.3 },
  ];

  const lastModified = new Date();

  return paths.map(({ path, priority }) => ({
    url: `${siteUrl}${path === '/' ? '' : path}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority,
  }));
}
