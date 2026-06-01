import { z } from 'zod';

export const leadSchema = z.object({
  name: z.string().trim().min(1).max(200),
  businessName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(5).max(50),
  needHelpWith: z.string().trim().min(1).max(120),
  consent: z.literal(true),
  sourcePage: z.string().trim().max(500).optional()
});

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().trim().min(1).max(6000)
});

export const chatRequestSchema = z.object({
  leadId: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
  message: z.string().trim().min(1).max(4000),
  history: z.array(chatMessageSchema).default([]),
  sourcePage: z.string().trim().max(500).optional()
});

export const handoffRequestSchema = z.object({
  leadId: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
  reason: z.string().trim().min(1).max(500),
  userQuestion: z.string().trim().max(4000).optional(),
  conversationSummary: z.string().trim().max(8000).optional(),
  recommendedService: z.string().trim().max(200).optional(),
  sourcePage: z.string().trim().max(500).optional()
});

export const recommendRequestSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  needHelpWith: z.string().trim().max(120).optional()
});

export const whatsappRequestSchema = z.object({
  type: z.enum(['general', 'package', 'human_fallback', 'workflow_audit', 'website', 'chatbot', 'calling_agent']).default('general'),
  name: z.string().trim().max(200).optional(),
  businessName: z.string().trim().max(200).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().max(50).optional(),
  question: z.string().trim().max(4000).optional(),
  summary: z.string().trim().max(8000).optional(),
  recommendedService: z.string().trim().max(200).optional(),
  packageName: z.string().trim().max(200).optional()
});

export type LeadInput = z.infer<typeof leadSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type HandoffRequest = z.infer<typeof handoffRequestSchema>;
