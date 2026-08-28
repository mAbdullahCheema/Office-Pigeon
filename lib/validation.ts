import { z } from 'zod';

const name = z.string().trim().min(2, 'Please enter your name').max(128);
const email = z.email('Please enter a valid email address');
const phone = z.string().trim().max(32).optional().or(z.literal(''));

/** Hidden field that real people never fill in. */
const honeypot = z.string().max(0, 'Rejected').optional().or(z.literal(''));

/**
 * A lead needs one way to reply, not both: Pip asks for "phone, WhatsApp or
 * email" in a single field, so a lead can legitimately arrive without an email.
 */
export const leadSchema = z
  .object({
    name,
    email: email.optional().or(z.literal('')),
    phone,
    company: z.string().trim().max(128).optional().or(z.literal('')),
    website: z.string().trim().max(256).optional().or(z.literal('')),
    serviceSlug: z.string().trim().max(64).optional().or(z.literal('')),
    packageSlug: z.string().trim().max(64).optional().or(z.literal('')),
    budget: z.string().trim().max(64).optional().or(z.literal('')),
    message: z.string().trim().max(4000).optional().or(z.literal('')),
    source: z.enum(['website', 'chatbot', 'referral', 'manual']).default('website'),
    company_website: honeypot,
  })
  .refine((value) => Boolean(value.email || value.phone), {
    message: 'Leave an email address or a phone number',
    path: ['email'],
  });

export const contactSchema = z.object({
  name,
  email,
  subject: z.string().trim().max(256).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Tell us a little more').max(8000),
  company_website: honeypot,
});

export const bookingSchema = z.object({
  name,
  email,
  phone,
  company: z.string().trim().max(128).optional().or(z.literal('')),
  serviceSlug: z.string().trim().max(64).optional().or(z.literal('')),
  slotAt: z.iso.datetime({ message: 'Pick a slot' }),
  timezone: z.string().trim().max(64).default('Asia/Karachi'),
  channel: z.enum(['call', 'whatsapp', 'meet']).default('call'),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  company_website: honeypot,
});

export const subscribeSchema = z.object({
  email,
  name: z.string().trim().max(128).optional().or(z.literal('')),
  source: z.string().trim().max(64).default('footer'),
  company_website: honeypot,
});

export const orderSchema = z.object({
  itemId: z.string().trim().min(1).max(64),
  planId: z.string().trim().min(1).max(64),
  name,
  email,
  phone,
  company: z.string().trim().max(128).optional().or(z.literal('')),
  country: z.string().trim().max(64).optional().or(z.literal('')),
  timeline: z.string().trim().max(64).optional().or(z.literal('')),
  notes: z.string().trim().max(4000).optional().or(z.literal('')),
  consent: z.literal(true, { message: 'Please accept the terms to place an order' }),
  company_website: honeypot,
});

export const signInSchema = z.object({
  email,
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type OrderInput = z.infer<typeof orderSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type SubscribeInput = z.infer<typeof subscribeSchema>;

/** Flattens a ZodError into `{ field: message }` for form rendering. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
