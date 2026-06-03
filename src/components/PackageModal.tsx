/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, MessageSquare, Send, Copy, Calendar, AlertCircle } from 'lucide-react';
import { Package } from '../types';
import { BRAND } from '../config';

interface PackageModalProps {
  packageData: Package | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PackageModal({ packageData, isOpen, onClose }: PackageModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  
  // Package-specific fields
  const [businessType, setBusinessType] = useState('I’m not sure yet');
  const [hasDomain, setHasDomain] = useState('I’m not sure yet');
  const [preferredDomain, setPreferredDomain] = useState('');
  const [websiteGoals, setWebsiteGoals] = useState('I’m not sure yet');
  const [servicesProducts, setServicesProducts] = useState('');
  const [preferredStyle, setPreferredStyle] = useState('I’m not sure yet');
  const [timeline, setTimeline] = useState('Not sure yet');

  // Chatbot specific
  const [channels, setChannels] = useState('Website');
  const [botQuestions, setBotQuestions] = useState('');
  const [collectDetails, setCollectDetails] = useState('Yes');
  const [humanHandoff, setHumanHandoff] = useState('Yes');
  const [botTone, setBotTone] = useState('Friendly and Simple');
  const [monthlyMessages, setMonthlyMessages] = useState('I’m not sure yet');

  // Calling agent specific
  const [callUseCase, setCallUseCase] = useState('Answer inbound calls');
  const [monthlyCallMinutes, setMonthlyCallMinutes] = useState('I am not sure yet');
  const [phoneNumberSetup, setPhoneNumberSetup] = useState('New Office Pigeon-managed Twilio-powered number');
  const [callingChannels, setCallingChannels] = useState('Phone calls');
  const [bookingFlow, setBookingFlow] = useState('Collect requests for human approval');

  // Automation specific
  const [manualTask, setManualTask] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [dataDestination, setDataDestination] = useState('');
  const [currentTools, setCurrentTools] = useState('');
  const [automationGoal, setAutomationGoal] = useState('');
  const [frequency, setFrequency] = useState('Multiple times per day');
  const [monitoring, setMonitoring] = useState('Yes, fully managed');
  const [urgency, setUrgency] = useState('Medium');

  // General consultation
  const [helpNeeded, setHelpNeeded] = useState('');
  const [budget, setBudget] = useState('Not sure yet');

  const [generatedMessage, setGeneratedMessage] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !packageData) return null;

  const isGeneral = packageData.id === 'general';
  const isWebsite = ['landing-page', 'business-website', 'commerce-website'].includes(packageData.id);
  const isChatbot = ['faq-bot', 'booking-bot', 'business-assistant'].includes(packageData.id);
  const isCalling = ['smart-call-starter', 'lead-booking-caller', 'ai-voice-operations-agent'].includes(packageData.id);
  const isAutomation = packageData.id === 'automation-audit' || packageData.id === 'automation';

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim() || !businessName.trim() || !email.trim() || !phone.trim()) {
        alert('Please fill out all contact fields to proceed.');
        return;
      }
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const buildWhatsAppMessage = () => {
    let msg = `Hi Office Pigeon, I’m interested in the ${packageData.name} package.\n\n`;
    msg += `My details:\n`;
    msg += `Name: ${name}\n`;
    msg += `Business Name: ${businessName}\n`;
    msg += `Email: ${email}\n`;
    msg += `Phone/WhatsApp: ${phone}\n\n`;

    if (isWebsite) {
      msg += `Website Request Details:\n`;
      msg += `Business Type: ${businessType}\n`;
      msg += `Already have Domain: ${hasDomain}\n`;
      msg += `Preferred Domain: ${preferredDomain || 'None Specified'}\n`;
      msg += `Main Goal: ${websiteGoals}\n`;
      msg += `Products/Services to show: ${servicesProducts || 'I am not sure yet'}\n`;
      msg += `Preferred style or colors: ${preferredStyle}\n`;
      msg += `Timeline: ${timeline}\n`;
    } else if (isChatbot) {
      msg += `Chatbot Request Details:\n`;
      msg += `Deployment Channels: ${channels}\n`;
      msg += `Primary Role & FAQs to Answer: ${botQuestions || 'Not sure yet'}\n`;
      msg += `Collect Leads: ${collectDetails}\n`;
      msg += `Human Handoff Needed: ${humanHandoff}\n`;
      msg += `Preferred Tone: ${botTone}\n`;
      msg += `Approx Monthly Messages: ${monthlyMessages}\n`;
    } else if (isCalling) {
      msg += `AI Calling Agent Request Details:\n`;
      msg += `Main call use case: ${callUseCase}\n`;
      msg += `Expected monthly call minutes: ${monthlyCallMinutes}\n`;
      msg += `Phone number setup: ${phoneNumberSetup}\n`;
      msg += `Channels wanted: ${callingChannels}\n`;
      msg += `Booking behavior: ${bookingFlow}\n`;
      msg += `Business Type: ${businessType}\n`;
      msg += `Timeline: ${timeline}\n`;
    } else if (isAutomation) {
      msg += `Workflow Automation Request details:\n`;
      msg += `Task taking too much time: ${manualTask || 'Not sure yet'}\n`;
      msg += `Information source: ${dataSource || 'Not sure yet'}\n`;
      msg += `Information target: ${dataDestination || 'Not sure yet'}\n`;
      msg += `Tools currently used: ${currentTools || 'Not sure yet'}\n`;
      msg += `Goal: ${automationGoal || 'Not sure yet'}\n`;
      msg += `Frequency: ${frequency}\n`;
      msg += `Monitoring included: ${monitoring}\n`;
      msg += `Urgency: ${urgency}\n`;
    } else {
      msg += `Consultation details:\n`;
      msg += `Need help with: ${helpNeeded || 'General AI advice'}\n`;
      msg += `Budget scope: ${budget}\n`;
    }

    msg += `\nI can also share complete business information, images, logo, website content, and anything else needed for the project.`;
    return msg;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const waMsg = buildWhatsAppMessage();
    setGeneratedMessage(waMsg);

    // Prepare submission object
    const payload = {
      packageId: packageData.id,
      packageName: packageData.name,
      price: packageData.price,
      packageType: isWebsite ? 'website' : isChatbot ? 'chatbot' : isCalling ? 'calling_agent' : isAutomation ? 'automation' : 'general',
      name,
      businessName,
      email,
      phone,
      answers: {
        businessType,
        hasDomain,
        preferredDomain,
        websiteGoals,
        servicesProducts,
        preferredStyle,
        timeline,
        channels,
        botQuestions,
        collectDetails,
        humanHandoff,
        botTone,
        monthlyMessages,
        callUseCase,
        monthlyCallMinutes,
        phoneNumberSetup,
        callingChannels,
        bookingFlow,
        manualTask,
        dataSource,
        dataDestination,
        currentTools,
        automationGoal,
        frequency,
        monitoring,
        urgency,
        helpNeeded,
        budget
      },
      whatsappMessage: waMsg
    };

    try {
      // API call to package-inquiry endpoint
      await fetch('/api/package-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Fallback to client routing - server API offline', err);
    }

    setLoading(false);
    setSuccess(true);

    // Automatically trigger WhatsApp window open
    setTimeout(() => {
      const encodedMsg = encodeURIComponent(waMsg);
      const whatsappLink = `https://wa.me/19176726764?text=${encodedMsg}`;
      window.open(whatsappLink, '_blank', 'noreferrer,noopener');
    }, 1800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const encodedMsg = encodeURIComponent(generatedMessage);
    window.open(`https://wa.me/19176726764?text=${encodedMsg}`, '_blank', 'noreferrer,noopener');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay backdrop */}
      <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-md" onClick={onClose} />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="relative bg-white/95 border border-cyan-100 shadow-2xl rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col focus:outline-none"
        id="package-induction-modal"
      >
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 rounded-t-3xl" />

        {/* Header content */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 mt-1">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-600 font-bold bg-cyan-50 px-2.5 py-1 rounded-full">
              {packageData.price || 'Free Audit'}
            </span>
            <h3 className="font-sans text-xl font-bold text-gray-900 mt-1">{packageData.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-2.5 py-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Wizard content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {!success ? (
            <form onSubmit={handleSubmit}>
              {/* STAGE COUNT BAR */}
              <div className="flex items-center gap-1.5 mb-6">
                <span className={`h-1.5 rounded-full flex-1 transition-all ${step >= 1 ? 'bg-cyan-500' : 'bg-gray-200'}`} />
                <span className={`h-1.5 rounded-full flex-1 transition-all ${step >= 2 ? 'bg-cyan-500' : 'bg-gray-200'}`} />
              </div>

              {/* STEP 1: UNIVERSAL CLIENT DETAILS */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="mb-4 text-sm text-gray-500">
                    Tell us a little about your business so we can understand your goals. Let's start with your contacts.
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Business Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Acme Repair"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="name@business.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+1 234 567 8900"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-cyan-50/30 border border-cyan-100/50 rounded-2xl text-xs text-gray-500 flex items-start gap-2.5 mt-8">
                    <AlertCircle size={15} className="text-cyan-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-cyan-800">Why are these required?</p>
                      <p className="mt-0.5">We use this to construct your pre-filled client profile and queue your priority review. No spam, ever.</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-3.5 bg-gray-900 text-white font-sans text-sm font-semibold rounded-2xl hover:bg-gray-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-gray-200"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: DYNAMIC SPECIFIC QUESTIONS */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* WEBSITE SPECIFIC QUESTIONS */}
                  {isWebsite && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Business Type</label>
                          <select
                            value={businessType}
                            onChange={(e) => setBusinessType(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none"
                          >
                            <option value="I’m not sure yet">I’m not sure yet</option>
                            <option value="Auto repair / mechanic">Auto repair / mechanic</option>
                            <option value="Beauty / med spa">Beauty / med spa</option>
                            <option value="Dental / healthcare">Dental / healthcare</option>
                            <option value="Cleaning service">Cleaning service</option>
                            <option value="Home service contractor">Home service contractor</option>
                            <option value="Gym / fitness">Gym / fitness</option>
                            <option value="Real estate">Real estate</option>
                            <option value="Restaurant / cafe">Restaurant / cafe</option>
                            <option value="Professional service">Professional service</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Own a website address?</label>
                          <select
                            value={hasDomain}
                            onChange={(e) => setHasDomain(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none"
                          >
                            <option value="I’m not sure yet">I’m not sure yet</option>
                            <option value="Yes, I have one already">Yes, I have one already</option>
                            <option value="No, I need one registered">No, I need one registered</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Preferred website address / domain idea</label>
                        <input
                          type="text"
                          placeholder="e.g. acmerepairs.com"
                          value={preferredDomain}
                          onChange={(e) => setPreferredDomain(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">What should this mainly help with?</label>
                        <select
                          value={websiteGoals}
                          onChange={(e) => setWebsiteGoals(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none"
                        >
                          <option value="I’m not sure yet">I’m not sure yet</option>
                          <option value="Look more professional online">Look more professional online</option>
                          <option value="Get more phone calls and manual contact">Get more phone calls and manual contact</option>
                          <option value="Show our services clearly">Show our services clearly</option>
                          <option value="Share business location & maps integration">Share business location & maps integration</option>
                          <option value="Book direct calendars & capture client files">Book direct calendars & capture client files</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">What products or services will you show?</label>
                        <textarea
                          placeholder="e.g., Brake fixes, custom engine tunes, diagnostics..."
                          value={servicesProducts}
                          onChange={(e) => setServicesProducts(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:outline-none h-20 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Preferred layout style</label>
                          <select
                            value={preferredStyle}
                            onChange={(e) => setPreferredStyle(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none"
                          >
                            <option value="I’m not sure yet">I’m not sure yet</option>
                            <option value="Clean and professional">Clean and professional</option>
                            <option value="Modern and premium">Modern and premium</option>
                            <option value="Friendly and simple">Friendly and simple</option>
                            <option value="Bold and eye-catching">Bold and eye-catching</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Timeline goal</label>
                          <select
                            value={timeline}
                            onChange={(e) => setTimeline(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none"
                          >
                            <option value="Not sure yet">Not sure yet</option>
                            <option value="Super urgent (Need ASAP)">Super urgent (Need ASAP)</option>
                            <option value="Within 1-2 weeks">Within 1-2 weeks</option>
                            <option value="Flexible (No rush)">Flexible (No rush)</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* CHATBOT SPECIFIC */}
                  {isChatbot && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Channels wanted</label>
                          <select
                            value={channels}
                            onChange={(e) => setChannels(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white"
                          >
                            <option value="Website only">Website only</option>
                            <option value="WhatsApp only">WhatsApp only</option>
                            <option value="Website + WhatsApp">Website + WhatsApp</option>
                            <option value="Website + WhatsApp + Instagram">Website + WhatsApp + Instagram & FB</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Monthly messages limit</label>
                          <select
                            value={monthlyMessages}
                            onChange={(e) => setMonthlyMessages(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white"
                          >
                            <option value="I’m not sure yet">I’m not sure yet</option>
                            <option value="Under 10,000 / month">Under 10,000 / month</option>
                            <option value="10,000 - 20,000 / month">10,000 - 20,000 / month</option>
                            <option value="20,000 - 50,000 / month">20,000 - 50,000 / month</option>
                            <option value="50,000+ messages">50,000+ messages</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">What should it answer / resolve?</label>
                        <textarea
                          placeholder="e.g. We get asked about our hours, service pricing, booking options, and location details..."
                          value={botQuestions}
                          onChange={(e) => setBotQuestions(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:outline-none h-20 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Collect Leads?</label>
                          <select
                            value={collectDetails}
                            onChange={(e) => setCollectDetails(e.target.value)}
                            className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs focus:bg-white"
                          >
                            <option value="Yes">Yes, save contacts</option>
                            <option value="No">No, just answers</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Human Hand-off?</label>
                          <select
                            value={humanHandoff}
                            onChange={(e) => setHumanHandoff(e.target.value)}
                            className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs focus:bg-white"
                          >
                            <option value="Yes">Yes, handoff on Whatsapp</option>
                            <option value="No">No, keep bot-only</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Assistant Tone</label>
                          <select
                            value={botTone}
                            onChange={(e) => setBotTone(e.target.value)}
                            className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs focus:bg-white"
                          >
                            <option value="Friendly and Simple">Friendly and Simple</option>
                            <option value="Highly Professional">Highly Professional</option>
                            <option value="Playful and Witty">Playful and Witty</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* AUTOMATION SPECIFIC */}
                  {isAutomation && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">What task takes too much time?</label>
                        <textarea
                          placeholder="e.g., Manually typing client contact data into Google sheets and setting reminders..."
                          value={manualTask}
                          onChange={(e) => setManualTask(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:outline-none h-16 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Information source</label>
                          <input
                            type="text"
                            placeholder="e.g. Website intake form"
                            value={dataSource}
                            onChange={(e) => setDataSource(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Where should data go?</label>
                          <input
                            type="text"
                            placeholder="e.g. Google Sheet / Active CRM"
                            value={dataDestination}
                            onChange={(e) => setDataDestination(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Tools/Apps currently in use</label>
                        <input
                          type="text"
                          placeholder="e.g. Calendly, Gmail, Mailchimp, sheets"
                          value={currentTools}
                          onChange={(e) => setCurrentTools(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">What should happen automatically?</label>
                        <textarea
                          placeholder="When a user schedules an appointment, save details instantly and drop an SMS reminder to their cell phone..."
                          value={automationGoal}
                          onChange={(e) => setAutomationGoal(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:outline-none h-16 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Task Frequency</label>
                          <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs focus:bg-white"
                          >
                            <option value="Multiple times per day">Multiple times per day</option>
                            <option value="Once or twice per day">Once or twice per day</option>
                            <option value="Weekly batch">Weekly batch</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Want Active Monitoring?</label>
                          <select
                            value={monitoring}
                            onChange={(e) => setMonitoring(e.target.value)}
                            className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs focus:bg-white"
                          >
                            <option value="Yes, fully managed">Yes, fully managed</option>
                            <option value="No, just setup">No, just setup</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Project Urgency</label>
                          <select
                            value={urgency}
                            onChange={(e) => setUrgency(e.target.value)}
                            className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs focus:bg-white"
                          >
                            <option value="High">High (ASAP)</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* CALLING AGENT SPECIFIC */}
                  {isCalling && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Business Type</label>
                          <select
                            value={businessType}
                            onChange={(e) => setBusinessType(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:outline-none"
                          >
                            <option value="I am not sure yet">I am not sure yet</option>
                            <option value="Home service business">Home service business</option>
                            <option value="Clinic / dental / healthcare">Clinic / dental / healthcare</option>
                            <option value="Auto repair / mechanic">Auto repair / mechanic</option>
                            <option value="Beauty / salon / spa">Beauty / salon / spa</option>
                            <option value="Restaurant / hospitality">Restaurant / hospitality</option>
                            <option value="Professional service">Professional service</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Monthly Call Minutes</label>
                          <select
                            value={monthlyCallMinutes}
                            onChange={(e) => setMonthlyCallMinutes(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white"
                          >
                            <option value="I am not sure yet">I am not sure yet</option>
                            <option value="Under 300 minutes/month">Under 300 minutes/month</option>
                            <option value="300 - 900 minutes/month">300 - 900 minutes/month</option>
                            <option value="900 - 2,500 minutes/month">900 - 2,500 minutes/month</option>
                            <option value="2,500+ minutes/month">2,500+ minutes/month</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Main calling goal</label>
                        <select
                          value={callUseCase}
                          onChange={(e) => setCallUseCase(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white"
                        >
                          <option value="Answer inbound calls">Answer inbound calls</option>
                          <option value="Missed-call callbacks">Missed-call callbacks</option>
                          <option value="Lead follow-up after forms">Lead follow-up after forms</option>
                          <option value="Appointment reminders">Appointment reminders</option>
                          <option value="Booking request collection">Booking request collection</option>
                          <option value="Full voice operations workflow">Full voice operations workflow</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Phone Number Setup</label>
                          <select
                            value={phoneNumberSetup}
                            onChange={(e) => setPhoneNumberSetup(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white"
                          >
                            <option value="New Office Pigeon-managed Twilio-powered number">New Office Pigeon-managed Twilio-powered number</option>
                            <option value="Connect my existing number if possible">Connect my existing number if possible</option>
                            <option value="I am not sure yet">I am not sure yet</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Channels</label>
                          <select
                            value={callingChannels}
                            onChange={(e) => setCallingChannels(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white"
                          >
                            <option value="Phone calls">Phone calls</option>
                            <option value="Phone calls + WhatsApp where available">Phone calls + WhatsApp where available</option>
                            <option value="Phone calls + calendar workflow">Phone calls + calendar workflow</option>
                            <option value="Phone calls + CRM workflow">Phone calls + CRM workflow</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Booking Behavior</label>
                          <select
                            value={bookingFlow}
                            onChange={(e) => setBookingFlow(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white"
                          >
                            <option value="Collect requests for human approval">Collect requests for human approval</option>
                            <option value="Direct booking if rules are clearly configured">Direct booking if rules are clearly configured</option>
                            <option value="No booking flow needed">No booking flow needed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Timeline goal</label>
                          <select
                            value={timeline}
                            onChange={(e) => setTimeline(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white"
                          >
                            <option value="Not sure yet">Not sure yet</option>
                            <option value="Within 1-2 weeks">Within 1-2 weeks</option>
                            <option value="Flexible after consultation">Flexible after consultation</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* GENERAL CONSULTATION */}
                  {isGeneral && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">What do you need help with?</label>
                        <textarea
                          placeholder="e.g. I want to build a better intake process for clients and capture online credibility."
                          value={helpNeeded}
                          onChange={(e) => setHelpNeeded(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white h-24 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Project Budget Investment Target</label>
                        <select
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white"
                        >
                          <option value="Not sure yet">Decide later / Not sure yet</option>
                          <option value="$500 or less">$500 or less</option>
                          <option value="$500 - $1,000">$500 – $1,000</option>
                          <option value="$1,000 - $2,500">$1,000 – $2,500</option>
                          <option value="$2,500 - $5,000">$2,500 – $5,000</option>
                          <option value="$5,000+">$5,000+</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-5 py-3 border border-gray-200 text-gray-600 font-sans text-sm rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3.5 bg-gradient-to-r from-cyan-600 to-emerald-600 font-sans text-sm font-semibold text-white rounded-2xl hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-100"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={15} />
                          Launch My Inquiry
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* SUCCESS FEEDBACK - WHATSAPP INTEGRATION READY */
            <div className="text-center py-8 space-y-6">
              <div className="mx-auto w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-500 shadow-md">
                <Check size={32} strokeWidth={2.5} />
              </div>

              <div>
                <h4 className="font-sans text-2xl font-black text-gray-900 leading-tight">Inquiry Profile Ready!</h4>
                <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                  We have mapped your data and compiled a pre-formatted message. If WhatsApp did not open automatically, click below to launch the chat.
                </p>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-100/30 p-4 rounded-2xl text-left max-w-sm mx-auto text-xs text-gray-600 font-mono flex flex-col gap-2 relative shadow-inner">
                <span className="text-[10px] text-gray-400 absolute top-2.5 right-3 tracking-widest uppercase">PREVIEW</span>
                <p className="leading-relaxed whitespace-pre-line truncate max-h-[140px] mt-2">
                  {generatedMessage}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={handleOpenWhatsApp}
                  className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-sm font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-100"
                >
                  <MessageSquare size={16} />
                  Open WhatsApp Chat
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full sm:w-auto px-6 py-3.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-sans text-sm font-medium rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-500" />
                      Copied Message
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy Message Text
                    </>
                  )}
                </button>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Or book a free coordinator call instantly on Google Chrome calendar profiles:
                </p>
                <a
                  href={BRAND.calComUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 text-xs text-cyan-600 hover:text-cyan-800 font-semibold inline-flex items-center gap-1 hover:underline"
                >
                  <Calendar size={13} />
                  Open Cal.com Booking
                </a>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
