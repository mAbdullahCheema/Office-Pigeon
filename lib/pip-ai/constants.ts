export const PIP_AI_DEFAULTS = {
  geminiModel: 'gemini-2.5-flash',
  openRouterModel: 'google/gemini-2.5-flash',
  cerebrasModel: 'llama-4-scout-17b-16e-instruct',
  groqModel: 'llama-3.1-8b-instant',
  cohereModel: 'command-r-plus',
  confidenceThreshold: 0.55,
  maxContextChunks: 6,
  maxHistoryMessages: 12,
  providerTimeoutMs: 20000,
  fallbackMessage:
    "I want to make sure you get the correct answer, so I'll connect you with the Office Pigeon team.\n\nYou can continue on WhatsApp or book a free consultation."
} as const;

export const OFFICE_PIGEON = {
  brand: 'Office Pigeon',
  slogan: 'We Automate Your Success',
  email: 'contactus@officepigeon.com',
  supportEmail: 'help@officepigeon.com',
  phone: '+1 917 672 6764',
  whatsappNumber: '19176726764',
  calComUrl: 'https://cal.com/office-pigeon/demo-call',
  hours: 'Monday-Friday, 8:00 AM-4:00 PM Eastern Time'
} as const;

export const QUICK_ACTIONS = {
  bookCall: { type: 'book_call', label: 'Book Free Consultation' },
  whatsapp: { type: 'whatsapp', label: 'Continue on WhatsApp' },
  viewPackages: { type: 'view_packages', label: 'View Packages' },
  humanHandoff: { type: 'human_handoff', label: 'Send My Details' },
  recommendService: { type: 'recommend_service', label: 'Recommend a Service' }
} as const;
