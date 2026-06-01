export interface PackageRecommendation {
  recommendedService: string;
  reason: string;
  cta: string;
  secondaryCta: string;
}

export function recommendPackage(input: string): PackageRecommendation {
  const text = input.toLowerCase();

  if (/(sell|shop|store|commerce|checkout|cart|products online|ecommerce)/.test(text)) {
    return {
      recommendedService: 'Smart Commerce Website',
      reason: 'You want to sell online, so a commerce setup with product pages, cart, checkout, payments, and order handling is the right lane.',
      cta: 'Book Free Consultation',
      secondaryCta: 'Continue on WhatsApp'
    };
  }

  if (/(booking|payment|login|dashboard|database|portal|account|web app|custom system)/.test(text)) {
    return {
      recommendedService: 'Smart Business Website',
      reason: 'You need more than a simple page: bookings, logins, dashboards, payments, or database features fit the Smart Business Website package.',
      cta: 'Book Free Consultation',
      secondaryCta: 'Continue on WhatsApp'
    };
  }

  if (/(instagram|facebook|multi-channel|multichannel|workflow trigger|connected assistant|all channels)/.test(text)) {
    return {
      recommendedService: 'AI Business Assistant',
      reason: 'You want a connected assistant across multiple channels with workflow support, which matches the AI Business Assistant tier.',
      cta: 'Book Free Consultation',
      secondaryCta: 'Continue on WhatsApp'
    };
  }

  if (/(lead capture|appointment|chat booking|qualify|booking bot)/.test(text)) {
    return {
      recommendedService: 'Lead & Booking Bot',
      reason: 'You want chat to capture leads and support booking, so the Lead & Booking Bot is the best fit.',
      cta: 'Book Free Consultation',
      secondaryCta: 'Continue on WhatsApp'
    };
  }

  if (/(same questions|faq|repeated questions|customer questions|support questions|chatbot|whatsapp bot)/.test(text)) {
    return {
      recommendedService: 'Smart FAQ Bot',
      reason: 'You want faster answers for repeated customer questions, which is exactly what the Smart FAQ Bot is for.',
      cta: 'Book Free Consultation',
      secondaryCta: 'Continue on WhatsApp'
    };
  }

  if (/(manual|automation|spreadsheet|sheet|crm|follow up|reminder|invoice|workflow|copy paste|reduce work)/.test(text)) {
    return {
      recommendedService: 'Workflow Automation',
      reason: 'You want to reduce manual tasks and connect tools, so a workflow automation audit is the most useful next step.',
      cta: 'Book Free Consultation',
      secondaryCta: 'Continue on WhatsApp'
    };
  }

  if (/(simple website|online presence|landing|look professional|credibility|one page|google maps)/.test(text)) {
    return {
      recommendedService: 'Starter Business Website',
      reason: 'You need a clean, professional online presence that builds trust quickly, so the $500 Starter Business Website is the best starter package.',
      cta: 'Book Free Consultation',
      secondaryCta: 'Continue on WhatsApp'
    };
  }

  return {
    recommendedService: 'Free AI Consultation',
    reason: 'You are still exploring options, so a free consultation is the safest way to choose the right website, chatbot, or automation setup.',
    cta: 'Book Free Consultation',
    secondaryCta: 'Continue on WhatsApp'
  };
}
