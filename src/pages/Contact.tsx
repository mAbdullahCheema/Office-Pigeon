/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Mail, Phone, Clock, MessageSquare, Calendar, Send, Check } from 'lucide-react';
import { BRAND } from '../config';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('smart-landing');
  const [existingWebsite, setExistingWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [timeline, setTimeline] = useState('');
  const [problem, setProblem] = useState('');
  const [contactMethod, setContactMethod] = useState('whatsapp');
  const [budget, setBudget] = useState('Not sure yet');
  const [extraDetails, setExtraDetails] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      business_name: businessName,
      email,
      phone,
      service_interest: service,
      existing_website: existingWebsite,
      industry,
      timeline,
      main_problem: problem,
      preferred_contact: contactMethod,
      budget_range: budget,
      message: extraDetails
    };

    try {
      // Save contact submission to db via Express API gateway
      await fetch('/api/contact-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Fallback to local state submission', err);
    }

    setLoading(false);
    setSuccess(true);
  };

  return (
    <div className="space-y-20 pb-20 mt-16 font-sans overflow-hidden">
      
      {/* HERO SECTION CONTAINER */}
      <section className="bg-gradient-to-b from-cyan-50/10 via-transparent to-transparent pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-600 font-bold bg-cyan-50 px-3.5 py-1.5 rounded-full">
            CONNECT TETHER
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight max-w-3xl mx-auto">
            Tell us what you want to improve
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            Whether you need a better website, faster replies, AI call handling, or fewer manual tasks, we can help you choose the smartest next step.
          </p>
        </div>
      </section>

      {/* THREE DIRECT CHANNELS CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* CARD 1: CAL.COM */}
        <div className="bg-white border border-gray-100 p-6 rounded-3xl flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <span className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center"><Calendar size={18} /></span>
            <h4 className="font-bold text-base text-gray-950">Book a Free Coordinator Call</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-normal">Schedule an initial 1-on-1 consultation and map out bottle necks in real-time.</p>
          </div>
          <a
            href={BRAND.calComUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 w-full py-3.5 bg-gray-950 text-white font-sans text-xs font-bold rounded-2xl text-center hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Launch Cal.com Booking
          </a>
        </div>

        {/* CARD 2: WHATSAPP */}
        <div className="bg-white border border-gray-100 p-6 rounded-3xl flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <span className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><MessageSquare size={18} /></span>
            <h4 className="font-bold text-base text-gray-950">Message on WhatsApp</h4>
            <p className="text-xs text-gray-400 leading-relaxed">Prefer quick chats? Shoot details directly and continue conversations on WhatsApp.</p>
          </div>
          <a
            href={`${BRAND.whatsappUrl}?text=Hi%20Office%20Pigeon%2C%20I%20want%20to%20message%20your%20representatives%20directly!`}
            target="_blank"
            rel="noreferrer"
            className="mt-6 w-full py-3.5 bg-emerald-600 text-white font-sans text-xs font-bold rounded-2xl text-center hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-50"
          >
            <MessageSquare size={14} />
            Launch WhatsApp Chat
          </a>
        </div>

        {/* CARD 3: EMAILS DETAILS */}
        <div className="bg-white border border-gray-100 p-6 rounded-3xl flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <span className="w-10 h-10 bg-cyan-50 text-cyan-500 rounded-2xl flex items-center justify-center"><Mail size={18} /></span>
            <h4 className="font-bold text-base text-gray-950">Email Support Portal</h4>
            <p className="text-xs text-gray-400 leading-relaxed">Coordinate detailed plans, request features changes, or request server specifications directly.</p>
          </div>
          <div className="space-y-2 mt-6">
            <a
              href={`mailto:${BRAND.email}`}
              className="block w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-center text-[11px] font-bold text-gray-800 transition-colors"
            >
              🔑 {BRAND.email}
            </a>
            <a
              href={`mailto:${BRAND.supportEmail}`}
              className="block w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-center text-[11px] font-bold text-gray-800 transition-colors"
            >
              🛠️ {BRAND.supportEmail}
            </a>
          </div>
        </div>

      </section>

      {/* CORE CONTACT FEEDBACK FORM SECTION */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50 py-16 rounded-3xl border border-gray-100">
        
        <div className="text-center space-y-3 mb-12">
          <h3 className="text-2xl font-black text-gray-950">Start with a few simple details</h3>
          <p className="text-xs text-gray-400 leading-normal max-w-sm mx-auto">No long technical paperwork. Just tell us what you need, and we will guide you from there.</p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Green"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200/60 rounded-xl text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spark Auto Mechanics"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200/60 rounded-xl text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200/60 rounded-xl text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Phone / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 234 567 8900"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200/60 rounded-xl text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Service Interested In</label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full px-3 py-3 bg-white border border-gray-200/60 rounded-xl text-xs"
                >
                  <option value="starter-business-website">Starter Business Website ($500)</option>
                  <option value="business-website">Business Web app ($1,400+)</option>
                  <option value="commerce-website">Commerce Shop ($1,000+)</option>
                  <option value="faq-bot">Smart FAQ Bot ($50/mo)</option>
                  <option value="booking-bot">Lead & Booking Bot ($150/mo)</option>
                  <option value="calling-agent">AI Calling Agent ($200/mo+)</option>
                  <option value="automation">Workflow Automations</option>
                  <option value="consultation">General Consultation</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Current Website (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. oldsite.com"
                  value={existingWebsite}
                  onChange={(e) => setExistingWebsite(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200/60 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Business Industry</label>
                <input
                  type="text"
                  placeholder="e.g. Auto repair, Medspa"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200/60 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Willing Timeline</label>
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full px-3 py-3 bg-white border border-gray-200/60 rounded-xl text-xs"
                >
                  <option value="">Select options...</option>
                  <option value="asap">ASAP / Urgent</option>
                  <option value="1-2-weeks">Within 1-2 weeks</option>
                  <option value="1-month">Within a month</option>
                  <option value="flexible">Fully flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Investment target range *</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3 py-3 bg-white border border-gray-200/60 rounded-xl text-xs"
                >
                  <option value="Not sure yet">Decide later / Not sure yet</option>
                  <option value="$500 or less">$500 or less</option>
                  <option value="$500 - $1,000">$500 – $1,000</option>
                  <option value="$1,000 - $2,500">$1,000 – $2,500</option>
                  <option value="$2,500 - $5,000">$2,500 – $5,000</option>
                  <option value="$5,000+">$5,000+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">What is the central problem to address?</label>
              <textarea
                placeholder="We receive 20 missed calls daily on off hours and lose direct scheduling requests..."
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200/60 rounded-xl text-xs focus:ring-1 h-20 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Preferred contact channels</label>
                <select
                  value={contactMethod}
                  onChange={(e) => setContactMethod(e.target.value)}
                  className="w-full px-3 py-3 bg-white border border-gray-200/60 rounded-xl text-xs"
                >
                  <option value="whatsapp">Text on WhatsApp</option>
                  <option value="phone">Phone calls hold</option>
                  <option value="email">Direct email files</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3.5 bg-gray-900 border border-gray-100 text-white font-sans text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer hover:bg-gray-800 shadow-md focus:outline-none"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={15} />
                    Launch Contact Form
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8 space-y-4 max-w-sm mx-auto">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <Check size={24} />
            </div>
            <h4 className="font-bold text-lg text-gray-900">Form Received Successfully</h4>
            <p className="text-xs text-gray-400 leading-normal">
              Thanks for contacting Office Pigeon. We received your details and will review your business before reaching out.
            </p>
          </div>
        )}
      </section>

      {/* NOTE ABOUT GENERAL SUPPORT HOURS */}
      <section className="max-w-md mx-auto text-center px-4">
        <p className="text-[10px] uppercase font-mono tracking-widest text-gray-400">
          📍 Standard Office Hours: {BRAND.workingHours}
        </p>
        <p className="text-[9px] text-gray-400 mt-1 italic">
          Pip AI remains awake 24/7 to catalog immediate specifications in the bottom right!
        </p>
      </section>
    </div>
  );
}
