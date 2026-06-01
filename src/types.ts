/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PageId =
  | 'home'
  | 'websites'
  | 'chatbots'
  | 'calling-agents'
  | 'automations'
  | 'examples'
  | 'about'
  | 'contact'
  | 'faq'
  | 'privacy'
  | 'terms'
  | 'refund'
  | 'fair-usage';

export interface Package {
  id: string;
  name: string;
  price: string;
  badge?: string;
  timeline: string;
  revision: string;
  renewal?: string;
  support?: string;
  bestFor: string;
  includes: string[];
  note?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'websites' | 'chatbots' | 'automations' | 'calling';
}

export interface ExampleBuild {
  id: string;
  title: string;
  industry: string;
  caption: string;
  type: 'website' | 'chatbot' | 'automation';
  badge: string;
  details: string[];
}

export interface ContactSubmission {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  serviceInterest: string;
  existingWebsite?: string;
  industry?: string;
  timeline?: string;
  mainProblem?: string;
  preferredContact: 'email' | 'phone' | 'whatsapp';
  budgetRange: string;
  message?: string;
}

export interface PackageInquiry {
  packageName: string;
  packageType: 'website' | 'chatbot' | 'automation' | 'calling_agent' | 'general';
  name: string;
  businessName: string;
  email: string;
  phone: string;
  answers: Record<string, string>;
  whatsappMessage?: string;
}

export interface PipLeads {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  needHelpWith: string;
  consent: boolean;
}

export interface CallingInterest {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  callType: string;
  expectedVolume: string;
  message?: string;
}
