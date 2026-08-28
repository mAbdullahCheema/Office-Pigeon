/**
 * Every path the redesigned site links to, in one place. The prototype linked
 * between `.dc.html` files; these are the routes those screens became.
 */
export const routes = {
  home: '/',
  products: '/products',
  smartSchool: '/products/smart-school-os',
  aiFinance: '/products/ai-finance',
  aiRecipes: '/products/ai-recipes',
  whiteboard: '/products/ai-whiteboard',
  websites: '/websites',
  chatbots: '/chatbots',
  callingAgents: '/calling-agents',
  automations: '/automations',
  academy: '/academy',
  /** The professional track: technical courses taught one-to-one by the team. */
  courses: '/academy/courses',
  appliedAi: '/academy/courses/applied-ai-engineering',
  examples: '/examples',
  pricing: '/pricing',
  faq: '/faq',
  contact: '/contact',
  legal: '/legal',
  order: '/order',
  login: '/login',
  dashboard: '/dashboard',
  /** Staff sections live inside the dashboard rather than a separate app. */
  manage: '/dashboard/manage',
  /** Only the free whiteboard runs inside this site. */
  apps: {
    whiteboard: '/apps/whiteboard',
  },
} as const;

/** Contact points the brand publishes. */
export const contactPoints = {
  phone: '+92 335 2229301',
  phoneHref: 'tel:+923352229301',
  whatsapp: 'https://wa.me/923352229301',
  email: 'help@officepigeon.com',
  emailHref: 'mailto:help@officepigeon.com',
  demoCall: 'https://cal.com/office-pigeon/demo-call',
} as const;

export function whatsappLink(text: string): string {
  return `${contactPoints.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function mailtoLink(subject: string): string {
  return `${contactPoints.emailHref}?subject=${encodeURIComponent(subject)}`;
}
