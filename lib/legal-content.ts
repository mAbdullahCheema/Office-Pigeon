/**
 * The legal centre documents, lifted verbatim from the redesign prototype.
 * Prose only — the page renders them.
 */

export type LegalSection = { h: string; ps: string[]; list?: string[] };

export type LegalDoc = {
  id: string;
  label: string;
  sub: string;
  icon: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export const legalDocs: LegalDoc[] = [
  {
    "id": "privacy",
    "label": "Privacy Policy",
    "sub": "What we collect and why",
    "icon": "🔒",
    "title": "Privacy Policy",
    "updated": "13 August 2026",
    "intro": "Office Pigeon (\"Office Pigeon\", \"we\", \"us\") builds AI websites, chatbots, calling agents and automations, sells AI products, and runs Office Pigeon Academy. This policy explains what personal data we collect, why we hold it, how long we keep it, and the rights you can exercise over it. It applies to officepigeon.com, our client dashboard, our products and our academy.",
    "sections": [
      {
        "h": "1. Who is responsible for your data",
        "ps": [
          "Office Pigeon is the data controller for information collected through this website, our dashboard and our academy. When we build and operate systems on a client's behalf — a chatbot answering their customers, or a calling agent handling their enquiries — the client is the controller of the end-customer data and we act as their processor under a written agreement.",
          "Contact for any privacy matter, including data-protection requests: help@officepigeon.com, or +92 335 2229301."
        ]
      },
      {
        "h": "2. Data we collect",
        "ps": [
          "We collect only what a stated purpose needs."
        ],
        "list": [
          "Identity and contact data — name, email address, phone number, company name, and the country you operate in, when you enquire, order, book a demo, create an account or enrol in the academy.",
          "Order and project data — the brief, content, credentials and files you share so we can build and run what you bought. Credentials are stored encrypted and access is limited to the engineer assigned to your project.",
          "Billing data — invoices, amounts, currency and payment status. Card details are never stored on our systems; they are handled by our payment providers.",
          "Support and conversation data — messages you send us by email, WhatsApp, the dashboard thread or the Pip assistant on this site, including anything you paste into them.",
          "Technical data — IP address, device and browser type, pages viewed, referring page and approximate location derived from IP, collected through cookies and similar technologies.",
          "Academy data — enrolment details, attendance, submitted work and progress records."
        ]
      },
      {
        "h": "3. Why we use it, and our lawful basis",
        "ps": [],
        "list": [
          "To perform our contract with you — delivering an order, running your systems, giving dashboard access, teaching an academy course, invoicing and support.",
          "With your consent — marketing emails, non-essential cookies, and any optional AI features you switch on. You may withdraw consent at any time.",
          "For our legitimate interests — securing our systems, preventing fraud and abuse, understanding how the site is used, and improving our products, where this does not override your rights.",
          "To comply with legal obligations — tax, accounting, anti-fraud and lawful requests from authorities."
        ]
      },
      {
        "h": "4. Automated processing and AI",
        "ps": [
          "Our products and the systems we build for clients use AI models to draft replies, transcribe calls, classify enquiries and trigger automations. These systems assist people; they do not make decisions with legal or similarly significant effects about you without human involvement. You can ask for a human to review anything an AI system produced about you.",
          "We do not sell your data, and we do not use client or end-customer content to train our own general models. Where a third-party model provider is used, we choose configurations that exclude your content from their training wherever the provider offers it."
        ]
      },
      {
        "h": "5. Who we share it with",
        "ps": [
          "We share personal data only with processors who need it to deliver our service, each under a contract that limits them to our instructions: cloud hosting and storage, email and messaging delivery, telephony and speech providers for calling agents, AI model providers, payment processors, analytics, and accountants or legal advisers where required. We publish the current list on request.",
          "We may disclose data where the law requires it, to enforce our terms, or in connection with a merger or acquisition — in which case you will be told before your data becomes subject to a different policy."
        ]
      },
      {
        "h": "6. International transfers",
        "ps": [
          "We operate from Pakistan and serve clients worldwide, so your data may be processed in countries other than your own, including the United States and the European Union. Where data leaves the UK or the EEA we rely on adequacy decisions or the UK/EU Standard Contractual Clauses together with transfer risk assessments, and we apply encryption in transit and at rest."
        ]
      },
      {
        "h": "7. How long we keep it",
        "ps": [],
        "list": [
          "Enquiries and demo requests that do not become orders — 12 months.",
          "Client project and account data — for the life of the engagement and 24 months after it ends, so we can restore or resume work.",
          "Invoices and tax records — 6 years, or longer where local law requires.",
          "Support conversations — 24 months.",
          "Academy records and certificates — 5 years.",
          "Credentials and access keys — deleted within 30 days of a project ending or on your request, whichever is sooner."
        ]
      },
      {
        "h": "8. Your rights",
        "ps": [
          "Depending on where you live, you have some or all of the following rights, and we honour all of them for everyone regardless of location: access to a copy of your data; correction of inaccurate data; deletion; restriction of processing; objection to processing based on legitimate interests; portability in a machine-readable format; withdrawal of consent; and the right not to be discriminated against for exercising any of them.",
          "Under the GDPR and UK GDPR you may also complain to your supervisory authority. Under the CCPA/CPRA you may request disclosure of categories collected, deletion, correction, and opt out of \"sale\" or \"sharing\" — we do neither, and we honour Global Privacy Control signals. Under Pakistan's data-protection framework and PECA you may contact us on the same address.",
          "Email help@officepigeon.com with \"Data request\" in the subject. We verify your identity, reply within 30 days, and never charge for a first request."
        ]
      },
      {
        "h": "9. Security",
        "ps": [
          "We use encryption in transit and at rest, role-based access, least-privilege credentials, audited admin actions, staff confidentiality agreements and regular backups. No system is perfectly secure, so if a breach affects your personal data we will notify you and the relevant authority without undue delay and within 72 hours of becoming aware of it where the law requires."
        ]
      },
      {
        "h": "10. Children",
        "ps": [
          "Our services are not directed at children under 16, and we do not knowingly collect their data. Academy students under 18 may enrol only with a parent or guardian, who accepts these terms on their behalf and may exercise the student's rights."
        ]
      },
      {
        "h": "11. Changes to this policy",
        "ps": [
          "We will post any change here with a new date, and email account holders before a material change takes effect."
        ]
      }
    ]
  },
  {
    "id": "terms",
    "label": "Terms of Service",
    "sub": "Includes refund policy",
    "icon": "📄",
    "title": "Terms of Service",
    "updated": "13 August 2026",
    "intro": "These terms form the agreement between you and Office Pigeon when you order a service, buy or use one of our products, enrol in the academy, or use this website. Placing an order, creating an account or paying an invoice means you accept them. If you are agreeing on behalf of a company, you confirm you are authorised to bind it.",
    "sections": [
      {
        "h": "1. What we provide",
        "ps": [
          "We provide three things: done-for-you services (websites, chatbots, AI calling agents and automations, built and operated for you), AI products offered on a subscription or licence, and Office Pigeon Academy courses. The scope, price, timeline and deliverables of any service engagement are whatever is written in the quote, order form or proposal you accepted; that document prevails over any general description on this site."
        ]
      },
      {
        "h": "2. Orders, quotes and timelines",
        "ps": [
          "An order becomes binding when you confirm it in writing (including by email or WhatsApp) or pay for it. Timelines we quote — such as a starter site live in one day, or a full build in fourteen days — run from the point we have received your content, access and approvals, and pause whenever we are waiting on you. Delays caused by missing content, slow approvals or third-party providers extend the timeline by the same period."
        ]
      },
      {
        "h": "3. Pricing and payment",
        "ps": [
          "Prices are quoted in the currency stated on the quote and exclude taxes, duties and third-party costs unless stated otherwise. Build fees are payable in advance or as the milestones on your quote require; subscriptions and retainers are billed monthly in advance and renew automatically until cancelled.",
          "You are responsible for third-party running costs we pass through at cost or you pay directly — model usage, telephony minutes, domains, hosting and paid integrations. Invoices are due within 7 days. Late invoices may attract 1.5% monthly interest and we may suspend service after written notice."
        ]
      },
      {
        "h": "4. Refund policy",
        "ps": [
          "We do not offer refunds once an order has been placed. Every order immediately commits our team's time and our own spend on infrastructure, model usage, telephony and licences, and that cost cannot be recovered.",
          "What we offer instead is revisions. Every service order includes one free revision round after delivery — or the number of rounds written into your quote, where that differs. A revision refines what was agreed; it is not a change of scope. New pages, new features, a different design direction or a new integration are quoted as additional work."
        ],
        "list": [
          "No refund after an order is placed, whether or not work has visibly started.",
          "One free revision round is included, or as agreed in writing on your quote.",
          "Subscriptions and retainers can be cancelled any time and stop at the end of the paid period; part-months are not refunded.",
          "Academy fees are not refundable once course access has been issued; a place can be transferred once to a later cohort if you ask before the course begins.",
          "If we cancel an engagement before delivery for our own reasons, we refund the unused portion of what you paid.",
          "Nothing here limits any non-waivable statutory refund or cancellation right you may have under your local consumer law."
        ]
      },
      {
        "h": "5. Your responsibilities",
        "ps": [
          "You agree to give us accurate information and lawful content, to hold the rights to anything you send us, to keep your account credentials secure, and to use anything we build in compliance with the law — including telemarketing, calling-consent, recording-consent, email marketing and data-protection rules that apply where your customers are. You are responsible for the consent and disclosures your end customers receive when an AI agent contacts or answers them."
        ]
      },
      {
        "h": "6. Acceptable use",
        "ps": [
          "You may not use our services to send unlawful, deceptive or harassing communications, to impersonate a person or organisation, to place calls or messages to people who have opted out or to numbers on a do-not-call register without a lawful basis, to process sensitive data we have not agreed to handle, or to build systems for fraud, scams, unlicensed financial or medical advice, or any use prohibited by our model providers. We may suspend or terminate service for a breach of this section without refund."
        ]
      },
      {
        "h": "7. Intellectual property",
        "ps": [
          "On full payment you own the custom deliverables we produced for you — your site content, design, prompts and configuration. We retain ownership of our own tooling, frameworks, product code, libraries and know-how, and grant you a licence to use them for as long as you subscribe. Our AI products remain our property and are licensed, not sold. We may reference your project in our portfolio unless you ask us in writing not to."
        ]
      },
      {
        "h": "8. Availability and support",
        "ps": [
          "We aim for high availability but do not promise uninterrupted service; maintenance, provider outages and force-majeure events happen. Support runs on business days by email, WhatsApp and the dashboard, with response targets as stated on your plan."
        ]
      },
      {
        "h": "9. Liability",
        "ps": [
          "To the extent the law allows, we are not liable for indirect, incidental or consequential loss, lost profit, lost revenue or lost data, and our total liability for any claim is capped at the fees you paid us in the 3 months before the claim arose. Nothing is excluded that cannot lawfully be excluded, including liability for fraud or death and personal injury caused by negligence."
        ]
      },
      {
        "h": "10. Term and termination",
        "ps": [
          "Either side may end a subscription or retainer with 30 days' written notice, effective at the end of the paid period. We may terminate immediately for non-payment, a breach of acceptable use, or unlawful activity. On termination we give you a copy of your data and configuration on request for 30 days, after which we may delete it."
        ]
      },
      {
        "h": "11. Governing law and disputes",
        "ps": [
          "These terms are governed by the laws of Pakistan, and the courts of Karachi, Sindh have exclusive jurisdiction, without affecting mandatory consumer protections in your country of residence. Before litigating, both sides agree to try to resolve the dispute in good faith within 30 days of written notice."
        ]
      },
      {
        "h": "12. Changes",
        "ps": [
          "We may update these terms; the version in force is the one published here on the date you order. Material changes to a subscription are notified by email at least 30 days in advance, and your continued use after that date is acceptance."
        ]
      }
    ]
  },
  {
    "id": "cookies",
    "label": "Cookie Policy",
    "sub": "What we store and your choices",
    "icon": "🍪",
    "title": "Cookie Policy",
    "updated": "13 August 2026",
    "intro": "Cookies are small files stored on your device. We use them sparingly, we ask before setting anything that is not strictly necessary, and you can change your mind at any time from the Cookie settings button on this page or in the footer of every page.",
    "sections": [
      {
        "h": "1. Categories we use",
        "ps": [],
        "list": [
          "Strictly necessary — session, security, load balancing, and a cookie recording your consent choice. These cannot be switched off because the site does not work without them, and they are set without consent as the law allows.",
          "Preferences — remembers your language, your last dashboard view, and whether Pip is open. Optional.",
          "Analytics — aggregated, IP-truncated statistics on which pages are used and where visitors drop off, so we can improve the site. Optional.",
          "Marketing — measures which campaign brought you here and avoids showing you the same ad repeatedly. Optional and off by default."
        ]
      },
      {
        "h": "2. Your choice, and how consent works",
        "ps": [
          "On your first visit we show a banner with equally weighted Accept and Reject options and a Customise route to the individual categories. Nothing optional is set until you choose. We store your choice for 12 months, then ask again. You can withdraw or change consent at any time in Cookie settings — withdrawal takes effect immediately and we delete the cookies in any category you turn off.",
          "We honour the Global Privacy Control signal: if your browser sends it, analytics and marketing stay off automatically."
        ]
      },
      {
        "h": "3. Similar technologies",
        "ps": [
          "Where we say \"cookies\" we also mean local storage, session storage and pixel tags, which we treat under the same categories and the same consent rules."
        ]
      },
      {
        "h": "4. Browser controls",
        "ps": [
          "Your browser can block or delete cookies independently of our settings. Blocking strictly necessary cookies will break sign-in and the dashboard."
        ]
      }
    ]
  },
  {
    "id": "dpa",
    "label": "Data Processing",
    "sub": "For clients, as processor",
    "icon": "🗂️",
    "title": "Data Processing Terms",
    "updated": "13 August 2026",
    "intro": "These terms apply where we process personal data on your behalf — for example when a chatbot or calling agent we run answers your customers. They form part of our agreement with you and satisfy Article 28 GDPR, the UK GDPR and equivalent requirements.",
    "sections": [
      {
        "h": "1. Roles and instructions",
        "ps": [
          "You are the controller and we are the processor. We process personal data only on your documented instructions and only to provide the agreed service, and we will tell you if in our view an instruction breaches applicable law."
        ]
      },
      {
        "h": "2. Subject matter and duration",
        "ps": [
          "Subject matter: operation of the AI systems described in your order. Duration: the term of the engagement plus the retention period in our Privacy Policy. Categories of data subjects: your customers, enquirers, staff and students. Categories of data: identity and contact details, conversation and call content, and any data you configure the system to collect."
        ]
      },
      {
        "h": "3. Confidentiality and security",
        "ps": [
          "Our staff and contractors are bound by confidentiality. We maintain encryption in transit and at rest, role-based access control, audit logging, backups and secure credential handling, and we will not materially reduce these measures during the term."
        ]
      },
      {
        "h": "4. Sub-processors",
        "ps": [
          "You authorise our use of sub-processors for hosting, telephony, speech, AI models, messaging and payments. We impose equivalent obligations on each of them, remain responsible for their performance, and will give you notice of a new sub-processor with a reasonable chance to object."
        ]
      },
      {
        "h": "5. Data subject requests and breaches",
        "ps": [
          "We will assist you in answering data subject requests and, where a request reaches us directly, refer it to you rather than answering it ourselves. We will notify you without undue delay after becoming aware of a personal data breach and give you the information you need to meet your own notification duties."
        ]
      },
      {
        "h": "6. Transfers, audit, deletion",
        "ps": [
          "International transfers are covered by the Standard Contractual Clauses and a transfer risk assessment. On reasonable notice we will provide the information you need to demonstrate compliance and, no more than once a year, support an audit. On termination we delete or return the personal data within 30 days of your request, except where law requires retention."
        ]
      }
    ]
  },
  {
    "id": "accessibility",
    "label": "Accessibility",
    "sub": "Our standard and how to flag issues",
    "icon": "♿",
    "title": "Accessibility Statement",
    "updated": "13 August 2026",
    "intro": "We want everyone to be able to use this site, our dashboard and anything we build for clients.",
    "sections": [
      {
        "h": "Our target",
        "ps": [
          "We aim to meet WCAG 2.2 Level AA across officepigeon.com and the client dashboard: keyboard operability, visible focus, sufficient contrast for body text, text alternatives for meaningful images, respect for reduced-motion preferences and forms that are usable with a screen reader."
        ]
      },
      {
        "h": "Known limitations",
        "ps": [
          "Some decorative animation and a small number of legacy screens have not yet been audited. We review the site each quarter and fix issues as we find them."
        ]
      },
      {
        "h": "Tell us",
        "ps": [
          "If any part of our service blocks you, email help@officepigeon.com or call +92 335 2229301 and we will fix it or give you the information another way — usually within five business days."
        ]
      }
    ]
  }
];
