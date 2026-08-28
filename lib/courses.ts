import { routes } from './routes';

/**
 * The Academy's professional track: technical courses taught one-to-one by the
 * team rather than by subject tutors. School tutoring bills by the month
 * against a school timetable; these bill by the hour because an adult books
 * sessions around a job.
 *
 * A course is data. `components/site/academy/CourseView.tsx` renders whatever
 * is in here, so a second course is an entry in this file, not a new page.
 */

export type CourseTier = {
  /** Matches a plan id in `lib/catalog.ts`, so the order form can preselect it. */
  planId: string;
  name: string;
  price: number;
  featured: boolean;
  summary: string;
  items: string[];
};

export type CourseWeek = {
  label: string;
  title: string;
  topics: string[];
  /** The build that closes the week, when there is one. */
  project?: string;
  /** Anything that is not a build — a repository, a deployment, a goal. */
  outcome?: string;
  note?: string;
};

export type CoursePhase = {
  name: string;
  weeks: CourseWeek[];
};

export type Course = {
  slug: string;
  /** The catalog item these tiers belong to. */
  itemId: string;
  name: string;
  shortName: string;
  badge: string;
  badgeIcon: string;
  accent: string;
  wash: string;
  headline: string;
  lede: string;
  metaTitle: string;
  metaDescription: string;
  cardBlurb: string;
  heroStats: { value: string; label: string }[];
  /** What the free first session actually covers. */
  intro: string[];
  why: { icon: string; title: string; body: string }[];
  audience: { icon: string; title: string; body: string }[];
  requirements: string[];
  notRequired: string[];
  journey: string[];
  journeyNote: string;
  phases: CoursePhase[];
  projects: string[];
  projectsNote: string;
  skills: string[];
  skillsNote: string;
  advantages: { icon: string; title: string; body: string }[];
  typicalCourse: string[];
  thisCourse: string[];
  careers: string[];
  careersNote: string;
  tiers: CourseTier[];
  /** The `label|value` rows of the format table. */
  format: string[];
  faqs: { question: string; answer: string }[];
  closing: { title: string; body: string; footnote: string };
};

const appliedAi: Course = {
  slug: 'applied-ai-engineering',
  itemId: 'academy-ai-engineering',
  name: 'Applied AI Engineering',
  shortName: 'Applied AI',
  badge: '16-week 1-on-1 program',
  badgeIcon: '🤖',
  accent: '#5A48D6',
  wash: 'linear-gradient(150deg,#EEEBFE,#F6F2FF 50%,#FFF0E7)',
  headline: 'Build Real AI. From Zero to Intelligent Applications.',
  lede: 'Learn Python, AI application development, automation, RAG, APIs and AI agents through personalised one-to-one training — with no prior programming or AI experience required.',
  metaTitle: 'Applied AI Engineering Course',
  metaDescription:
    'Learn Applied AI Engineering from scratch through personalised 1-on-1 training. Learn Python, AI applications, APIs, RAG, automation, AI agents and deployment in a practical 16-week program.',
  cardBlurb:
    'Sixteen weeks, one-to-one, from no programming at all to a deployed AI application you built yourself.',
  heroStats: [
    { value: '16', label: 'week curriculum' },
    { value: '8', label: 'projects you keep' },
    { value: 'Free', label: 'first session' },
  ],
  intro: [
    'Understanding what you actually want to build',
    'Assessing the technical level you are starting from',
    'Talking through the work and interests you want projects to sit near',
    'Walking you through the learning roadmap week by week',
    'Setting expectations on pace, practice and time commitment',
    'Showing you what you will be able to build by week sixteen',
  ],
  why: [
    {
      icon: '🔧',
      title: 'You learn the technology, not the tools',
      body: 'Anyone can be shown where the prompt box is. This teaches how the application around the model is built — the API calls, the retrieval, the state, the deployment.',
    },
    {
      icon: '🏗️',
      title: 'You build the whole way through',
      body: 'Every week ends in something that runs. By week sixteen you have eight working projects and a deployed product, not sixteen sets of notes.',
    },
    {
      icon: '👤',
      title: 'It is taught to you, not at you',
      body: 'One student, one engineer, one live session. The curriculum bends around what you already know and what you actually want to build.',
    },
  ],
  audience: [
    {
      icon: '🌱',
      title: 'Complete beginners',
      body: 'Never programmed before? The program starts at the fundamentals and assumes nothing.',
    },
    {
      icon: '🎓',
      title: 'University students',
      body: 'Build practical AI skills alongside your degree, on a schedule that fits around term.',
    },
    {
      icon: '💻',
      title: 'Aspiring developers',
      body: 'Move from basic programming toward modern AI application development.',
    },
    {
      icon: '🧾',
      title: 'Freelancers',
      body: 'Learn how AI automation and AI applications turn into services clients pay for.',
    },
    {
      icon: '🚀',
      title: 'Entrepreneurs',
      body: 'Learn how AI capabilities become useful products and real business solutions.',
    },
    {
      icon: '📈',
      title: 'Young professionals',
      body: 'Develop practical AI engineering skills for an increasingly AI-driven workplace.',
    },
  ],
  requirements: [
    'Basic computer literacy',
    'Willingness to learn',
    'A computer that can run a modern development environment',
    'An internet connection',
    'Consistent practice between sessions',
  ],
  notRequired: [
    'Programming experience',
    'AI experience',
    'A computer science degree',
    'Advanced mathematics',
    'A previous development job',
  ],
  journey: [
    'No programming',
    'Python fundamentals',
    'APIs & software development',
    'AI & LLM fundamentals',
    'AI applications',
    'RAG & knowledge systems',
    'AI automation',
    'AI agents',
    'Deployment',
    'A real AI product',
  ],
  journeyNote:
    'Instead of spending months learning disconnected theory, you progressively build real systems and understand the technology behind them.',
  phases: [
    {
      name: 'Phase 1 — Programming foundations',
      weeks: [
        {
          label: 'Week 1',
          title: 'Computing & AI foundations',
          topics: [
            'How computers work',
            'Operating systems',
            'Software and applications',
            'Internet fundamentals',
            'Websites and servers',
            'APIs',
            'What is AI?',
            'AI vs machine learning vs deep learning',
            'Generative AI',
            'LLMs',
            'AI applications',
            'AI automation',
            'AI agents',
          ],
        },
        {
          label: 'Week 2',
          title: 'Python fundamentals',
          topics: [
            'Python setup',
            'VS Code',
            'Terminal',
            'Variables',
            'Data types',
            'Strings',
            'Numbers',
            'Booleans',
            'Input and output',
            'Operators',
            'Conditions',
            'Loops',
          ],
          project: 'Python mini applications',
        },
        {
          label: 'Week 3',
          title: 'Python programming',
          topics: [
            'Lists',
            'Tuples',
            'Dictionaries',
            'Sets',
            'Functions',
            'Parameters',
            'Return values',
            'Modules',
            'Imports',
            'Error handling',
          ],
          project: 'Student management application',
        },
        {
          label: 'Week 4',
          title: 'Python for real applications',
          topics: [
            'Files',
            'JSON',
            'CSV',
            'Packages',
            'pip',
            'Virtual environments',
            'Environment variables',
            '.env files',
            'Working with external libraries',
            'Basic application architecture',
          ],
          project: 'AI-ready Python data application',
        },
      ],
    },
    {
      name: 'Phase 2 — Developer foundations',
      weeks: [
        {
          label: 'Week 5',
          title: 'APIs, web & data',
          topics: [
            'HTTP',
            'REST APIs',
            'Requests',
            'Responses',
            'JSON',
            'API keys',
            'Authentication',
            'HTTP methods',
            'Status codes',
            'Working with external services',
            'Basic data processing',
          ],
          project: 'API-powered Python application',
        },
        {
          label: 'Week 6',
          title: 'Git, GitHub & software development',
          topics: [
            'Git',
            'GitHub',
            'Repositories',
            'Commits',
            'Branches',
            'Push and pull',
            'README files',
            '.gitignore',
            'Project organisation',
            'Debugging',
            'AI-assisted development',
          ],
          outcome: 'Your first professional GitHub project',
        },
      ],
    },
    {
      name: 'Phase 3 — Artificial intelligence',
      weeks: [
        {
          label: 'Week 7',
          title: 'Machine learning & AI foundations',
          topics: [
            'Artificial intelligence',
            'Machine learning',
            'Supervised learning',
            'Unsupervised learning',
            'Reinforcement learning',
            'Training vs inference',
            'Features',
            'Labels',
            'Models',
            'Predictions',
            'Classification',
            'Regression',
            'Overfitting',
            'Model evaluation',
            'Neural networks',
            'Deep learning',
          ],
          note: 'The focus is conceptual understanding rather than advanced mathematics.',
        },
        {
          label: 'Week 8',
          title: 'Generative AI & large language models',
          topics: [
            'Generative AI',
            'LLMs',
            'Tokens',
            'Context windows',
            'Transformers',
            'Attention',
            'Inference',
            'Multimodal AI',
            'Hallucinations',
            'Model selection',
            'AI limitations',
            'Prompt engineering',
            'System instructions',
            'Few-shot prompting',
            'Prompt templates',
            'Structured prompting',
            'Evaluation',
          ],
          project: 'Professional AI assistant',
        },
      ],
    },
    {
      name: 'Phase 4 — AI application engineering',
      weeks: [
        {
          label: 'Week 9',
          title: 'Building AI applications',
          topics: [
            'LLM APIs',
            'AI API authentication',
            'Conversation history',
            'Streaming',
            'Structured outputs',
            'JSON schemas',
            'Validation',
            'Error handling',
            'Token usage',
            'AI application architecture',
          ],
          project: 'AI chat application',
        },
        {
          label: 'Week 10',
          title: 'RAG & knowledge-based AI',
          topics: [
            'What is RAG?',
            'Why RAG is needed',
            'Documents',
            'Chunking',
            'Embeddings',
            'Vector databases',
            'Similarity search',
            'Retrieval',
            'Context injection',
            'RAG architecture',
            'RAG limitations',
            'Improving retrieval quality',
          ],
          project: 'AI knowledge assistant',
          note: 'You finish the week able to upload your own documents and ask questions about their contents.',
        },
      ],
    },
    {
      name: 'Phase 5 — AI automation',
      weeks: [
        {
          label: 'Week 11',
          title: 'Automation fundamentals',
          topics: [
            'Automation concepts',
            'Workflows',
            'Triggers',
            'Actions',
            'Webhooks',
            'APIs',
            'Scheduled workflows',
            'Event-driven automation',
            'Data transformation',
            'Error handling',
          ],
          note: 'Built hands-on in n8n, with where Make and Zapier fit in the wider automation ecosystem.',
        },
        {
          label: 'Week 12',
          title: 'AI-powered automation',
          topics: [
            'Connecting AI to workflows',
            'AI classification',
            'AI extraction',
            'AI summarisation',
            'Automated email processing',
            'Automated document processing',
            'AI lead qualification',
            'CRM automation',
            'Notifications',
            'Multi-step workflows',
          ],
          project: 'AI business automation and an AI document workflow',
        },
      ],
    },
    {
      name: 'Phase 6 — AI agents',
      weeks: [
        {
          label: 'Week 13',
          title: 'AI agent fundamentals',
          topics: [
            'What is an AI agent?',
            'Chatbot vs AI application vs agent',
            'Agent architecture',
            'Goals',
            'Instructions',
            'Tools',
            'Function calling',
            'Tool selection',
            'Agent loops',
            'State',
            'Memory',
            'Planning',
            'Execution',
            'Observation',
          ],
          project: 'Your first AI agent',
        },
        {
          label: 'Week 14',
          title: 'Advanced AI agents',
          topics: [
            'Custom tools',
            'Python tools',
            'API tools',
            'Database tools',
            'Search tools',
            'File tools',
            'Agent memory',
            'Guardrails',
            'Handoffs',
            'Agent workflows',
            'Multi-agent systems',
            'Supervisor agents',
            'Specialised agents',
            'When not to use agents',
          ],
          project: 'AI research agent or personal AI agent',
        },
      ],
    },
    {
      name: 'Phase 7 — Production AI',
      weeks: [
        {
          label: 'Week 15',
          title: 'Production AI engineering',
          topics: [
            'AI application architecture',
            'Security',
            'API key protection',
            'Environment variables',
            'Authentication',
            'Authorisation',
            'Prompt injection',
            'Data privacy',
            'Guardrails',
            'Reliability',
            'AI evaluation',
            'Logging',
            'Monitoring',
            'Cost management',
            'Rate limits',
            'Error handling',
            'Frontend vs backend',
            'Servers',
            'Cloud deployment',
            'Environment configuration',
            'Production deployment',
          ],
          outcome: 'A working AI application, deployed',
        },
      ],
    },
    {
      name: 'Phase 8 — Capstone',
      weeks: [
        {
          label: 'Week 16',
          title: 'Build & launch',
          topics: [
            'A real problem',
            'A working application',
            'AI functionality',
            'API integration',
            'Persistent data where appropriate',
            'Automation or an AI agent',
            'Error handling',
            'A GitHub repository',
            'A professional README',
            'A live deployment',
            'A final demonstration',
          ],
          outcome: 'Your own AI product, built and launched',
          note: 'Past directions include an AI study assistant, AI tutor, resume analyser, customer support agent, research assistant, sales agent, business automation system, document intelligence platform, content system or personal assistant.',
        },
      ],
    },
  ],
  projects: [
    'Python applications',
    'API application',
    'AI assistant',
    'AI chat application',
    'RAG knowledge assistant',
    'AI automation workflow',
    'AI agent',
    'Final AI product',
  ],
  projectsNote:
    'By the end of the program your portfolio contains multiple practical projects instead of a certificate alone.',
  skills: [
    'Python',
    'Git',
    'GitHub',
    'APIs',
    'JSON',
    'Data processing',
    'AI fundamentals',
    'Generative AI',
    'LLMs',
    'Prompt engineering',
    'Structured outputs',
    'Embeddings',
    'RAG',
    'Vector databases',
    'AI automation',
    'n8n',
    'Webhooks',
    'Function calling',
    'AI agents',
    'Agent tools',
    'Multi-agent systems',
    'Guardrails',
    'AI evaluation',
    'Deployment',
    'AI-assisted development',
  ],
  skillsNote:
    'The goal is practical working knowledge and the ability to keep specialising — not expertise in every technology on this list.',
  advantages: [
    {
      icon: '⏱️',
      title: 'Personalised pace',
      body: 'Move faster through concepts you already understand and spend longer where you need the help.',
    },
    {
      icon: '🧩',
      title: 'Personalised projects',
      body: 'Build around your own interests, career goals or business ideas rather than someone else’s demo.',
    },
    {
      icon: '🛠️',
      title: 'Live problem solving',
      body: 'Do not get stuck watching a tutorial. Ask the question and solve the problem together, in the session.',
    },
    {
      icon: '📝',
      title: 'Individual feedback',
      body: 'Direct feedback on your code, your projects and the way you approach a build.',
    },
    {
      icon: '🧭',
      title: 'Mentorship',
      body: 'Go past tutorials and learn how real AI applications are actually designed and built.',
    },
  ],
  typicalCourse: [
    'Watch videos',
    'Copy prompts',
    'Follow tutorials',
    'Build toy examples',
    'Receive a certificate',
  ],
  thisCourse: [
    'One-to-one instruction',
    'Learn programming',
    'Understand AI fundamentals',
    'Build real applications',
    'Work with APIs',
    'Build RAG systems',
    'Automate workflows',
    'Build AI agents',
    'Deploy applications',
    'Create a portfolio',
    'Build a capstone',
  ],
  careers: [
    'AI application developer',
    'AI automation specialist',
    'AI engineer',
    'AI agent developer',
    'AI developer',
    'AI product builder',
    'AI freelancer',
    'AI consultant',
    'Startup founder',
    'Technical entrepreneur',
  ],
  careersNote:
    'The program gives you a foundation for further specialisation in AI engineering, software development, automation, agent development or AI-powered entrepreneurship.',
  tiers: [
    {
      planId: 'ai-standard',
      name: 'Standard',
      price: 25,
      featured: false,
      summary: 'The full curriculum, taught one-to-one.',
      items: [
        'One-to-one live instruction',
        'Complete structured curriculum',
        'Practical exercises',
        'Weekly projects',
        'AI development guidance',
        'GitHub guidance',
        'Final capstone project',
      ],
    },
    {
      planId: 'ai-intensive',
      name: 'Intensive',
      price: 30,
      featured: true,
      summary: 'For students who want to move faster and be reviewed harder.',
      items: [
        'Everything in Standard',
        'Additional project support',
        'Code reviews',
        'Additional practice sessions',
        'Faster-paced learning',
        'Personalised learning roadmap',
        'Between-session guidance where appropriate',
      ],
    },
    {
      planId: 'ai-mentorship',
      name: 'Mentorship',
      price: 40,
      featured: false,
      summary: 'For students building toward freelancing, a portfolio or a product.',
      items: [
        'Everything in Intensive',
        'Advanced AI engineering mentorship',
        'Portfolio and project architecture review',
        'Career guidance',
        'Freelancing guidance',
        'CV, LinkedIn and GitHub review',
        'Startup and product guidance',
        'Advanced agent and automation projects',
      ],
    },
  ],
  format: [
    'Format|One-to-one live tutoring and mentorship',
    'Duration|16 weeks',
    'Session length|1 hour minimum',
    'Typical program|About 32 sessions, from roughly $800 in total',
    'Starting price|$25 per hour',
    'Introductory session|Free',
    'Learning style|Live instruction, hands-on development, assignments and projects',
    'Final outcome|A deployed AI capstone project and portfolio-ready work',
  ],
  faqs: [
    {
      question: 'Do I need to know Python before starting?',
      answer: 'No. The program starts from the fundamentals and assumes you have never written code.',
    },
    {
      question: 'Do I need an AI background?',
      answer: 'No. Week one covers what AI actually is before you touch a model.',
    },
    {
      question: 'Is this a recorded course?',
      answer: 'No. Every session is personalised one-to-one instruction with an engineer.',
    },
    {
      question: 'How much does it cost?',
      answer:
        'Sessions start at $25 an hour, with higher tiers for students who want additional mentorship and support. A typical sixteen-week program runs about 32 sessions, so roughly $800 in total at the Standard rate. Prices are a starting guide and can be adjusted — talk to us.',
    },
    {
      question: 'How long does the program take?',
      answer:
        'The structured curriculum is designed for sixteen weeks. The exact number of sessions varies with your pace and goals.',
    },
    {
      question: 'What if I need more time?',
      answer: 'Additional sessions can be booked as needed, at the same hourly rate.',
    },
    {
      question: 'Will I build real projects?',
      answer: 'Yes. The curriculum is project-driven and finishes with a deployed AI application of your own.',
    },
    {
      question: 'Will I learn AI agents?',
      answer: 'Yes. Agent development is a major part of the second half of the curriculum.',
    },
    {
      question: 'Will I learn automation?',
      answer: 'Yes. You will work with APIs, workflows, webhooks and AI-powered automation in n8n.',
    },
    {
      question: 'Can I take the course if I am a complete beginner?',
      answer:
        'Yes. It is specifically designed to take students from the fundamentals toward applied AI development.',
    },
    {
      question: 'Will this make me an AI engineer?',
      answer:
        'The course gives you a practical foundation in applied AI engineering. It is not a job guarantee or an expert-level qualification, and you are expected to keep learning and specialising afterwards.',
    },
  ],
  closing: {
    title: 'Ready to start building with AI?',
    body: 'Your AI journey does not have to start with years of programming experience. Start with the fundamentals, build real projects, and develop the skills to create intelligent applications.',
    footnote: '1-on-1 · Beginner friendly · Project based · Starting at $25/hour',
  },
};

export const courses: Course[] = [appliedAi];

export function courseBySlug(slug: string): Course | null {
  return courses.find((course) => course.slug === slug) ?? null;
}

export function coursePath(course: Course): string {
  return `${routes.courses}/${course.slug}`;
}
