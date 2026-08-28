'use client';

import Link from 'next/link';
import { useState } from 'react';

import { PriceNote } from '@/components/site/PriceNote';
import { Fx } from '@/components/ui/Fx';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { coursePath, courses } from '@/lib/courses';
import { routes } from '@/lib/routes';

const promises = [
  'One-to-one tutoring',
  'Small group classes',
  'Specialist tutors',
  'Personalized learning plans',
  'Exam preparation',
  'University readiness',
];

const heroStats = [
  { value: '100+', label: 'five-star reviews' },
  { value: '16', label: 'countries our tutors teach in' },
  { value: 'Free', label: 'first trial class' },
];

/** F = m × a, written out on the hero lesson board one glyph at a time. */
const boardTokens = [
  { text: 'F', size: '40px', color: '#5A48D6', delay: '.3s' },
  { text: '=', size: '30px', color: 'rgba(36,26,22,.4)', delay: '.42s' },
  { text: 'm', size: '40px', color: '#241A16', delay: '.54s' },
  { text: '×', size: '26px', color: 'rgba(36,26,22,.4)', delay: '.66s' },
  { text: 'a', size: '40px', color: '#EF5A1F', delay: '.78s' },
];

const classTiles = [
  { initials: 'AY', name: 'Ayesha', meta: 'Year 11 · Dubai', tint: '#EEEBFE', fg: '#5A48D6', hand: true },
  { initials: 'OM', name: 'Omar', meta: 'Year 10 · Doha', tint: '#FFEDE3', fg: '#E8480F', hand: false },
  { initials: 'ZR', name: 'Zara', meta: 'Year 11 · London', tint: '#E9FBF3', fg: '#0F9C6E', hand: false },
];

const marquee = [
  { icon: '🇦🇪', label: 'United Arab Emirates' },
  { icon: '🇸🇦', label: 'Saudi Arabia' },
  { icon: '🇶🇦', label: 'Qatar' },
  { icon: '🇰🇼', label: 'Kuwait' },
  { icon: '🇧🇭', label: 'Bahrain' },
  { icon: '🇴🇲', label: 'Oman' },
  { icon: '🇵🇰', label: 'Pakistan' },
  { icon: '🇬🇧', label: 'United Kingdom' },
  { icon: '🇨🇦', label: 'Canada' },
  { icon: '🇦🇺', label: 'Australia' },
];

const divisions = [
  {
    icon: '🎓',
    title: 'School Success',
    body: 'Day-to-day school work handled properly — the curriculum they are actually sitting in class, plus homework and homeschooling support.',
    tags: ['Grades 1–12', 'Curriculum tutoring', 'Homework support', 'Homeschooling'],
    bg: '#fff',
    fg: '#241A16',
    iconBg: '#EEEBFE',
    chip: '#FFF6F1',
    chipFg: 'rgba(36,26,22,.62)',
    shadow: '0 16px 34px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9)',
  },
  {
    icon: '🏆',
    title: 'Exam Excellence',
    body: 'Board and entrance exams taken seriously: syllabus mapping, timed papers, marked answers and a revision plan you can see progress against.',
    tags: ['IGCSE', 'O & A Level', 'IB', 'SAT / ACT / AP', 'EmSAT', 'NET / MDCAT / ECAT', 'IELTS / TOEFL'],
    bg: 'linear-gradient(160deg,#8F7CFF,#5A48D6)',
    fg: '#fff',
    iconBg: 'rgba(255,255,255,.2)',
    chip: 'rgba(255,255,255,.16)',
    chipFg: '#fff',
    shadow: '0 26px 52px rgba(90,72,214,.4), inset 0 2px 3px rgba(255,255,255,.35)',
  },
  {
    icon: '🚀',
    title: 'Future Ready',
    body: 'The skills exams never test — coding, AI, communication and the university applications that turn good grades into a good offer.',
    tags: [
      'Coding & Python',
      'AI & robotics',
      'Public speaking',
      'Research skills',
      'University admissions',
      'Career readiness',
    ],
    bg: '#fff',
    fg: '#241A16',
    iconBg: '#FFEDE3',
    chip: '#FFF6F1',
    chipFg: 'rgba(36,26,22,.62)',
    shadow: '0 16px 34px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9)',
  },
];

const boards = [
  {
    label: 'British',
    title: 'British curriculum',
    body: 'Cambridge and Pearson routes from primary through A Level, taught by tutors who mark to the same rubrics examiners use.',
    items: [
      'Cambridge Primary',
      'Cambridge Lower Secondary',
      'Cambridge IGCSE',
      'Cambridge O Level',
      'Cambridge AS & A Level',
      'Edexcel IGCSE',
      'Edexcel International A Level',
      'OxfordAQA',
    ],
  },
  {
    label: 'American',
    title: 'American curriculum',
    body: 'Elementary through high school, including Honors and Advanced Placement with full past-paper drilling.',
    items: ['Elementary', 'Middle School', 'High School', 'Honors courses', 'AP (Advanced Placement)'],
  },
  {
    label: 'Canadian',
    title: 'Canadian curriculum',
    body: 'Province-specific coverage aligned to the strands and assessment your school reports against.',
    items: ['Ontario curriculum', 'British Columbia curriculum', 'Alberta curriculum'],
  },
  {
    label: 'Australian',
    title: 'Australian curriculum',
    body: 'ACARA and state variations, including senior secondary pathways and ATAR-facing subjects.',
    items: [
      'Australian Curriculum (ACARA)',
      'NSW curriculum',
      'Victorian curriculum (VCE)',
      'Queensland curriculum',
    ],
  },
  {
    label: 'Pakistani',
    title: 'Pakistani boards',
    body: 'Federal and provincial boards taught in English or Urdu, with board-paper practice from the first month.',
    items: ['Federal Board (FBISE)', 'Punjab Board', 'Sindh Board', 'KPK Board'],
  },
  {
    label: 'GCC national',
    title: 'GCC national curricula',
    body: 'Ministry curricula across the Gulf, with lesson times built around school hours and family routines.',
    items: [
      'UAE Ministry curriculum',
      'Saudi National curriculum',
      'Qatar National curriculum',
      'Kuwait National curriculum',
      'Oman National curriculum',
    ],
  },
];

const subjects = [
  {
    icon: '📐',
    tint: '#EEEBFE',
    title: 'Mathematics',
    items: [
      'Primary math',
      'Middle school math',
      'IGCSE Mathematics',
      'Additional Mathematics',
      'A Level Mathematics',
      'Further Mathematics',
      'SAT Math',
    ],
  },
  {
    icon: '🔬',
    tint: '#E9FBF3',
    title: 'Sciences',
    items: [
      'Physics',
      'Chemistry',
      'Biology',
      'Combined Science',
      'Coordinated Sciences',
      'Environmental Management',
    ],
  },
  {
    icon: '📖',
    tint: '#FFF4D8',
    title: 'Languages',
    items: ['English Language', 'English Literature', 'Urdu', 'IELTS & TOEFL prep'],
  },
  {
    icon: '🌍',
    tint: '#FFEDE3',
    title: 'Humanities',
    items: [
      'Business Studies',
      'Economics',
      'Accounting',
      'Psychology',
      'Sociology',
      'History',
      'Geography',
      'Global Perspectives',
    ],
  },
  {
    icon: '💻',
    tint: '#EEEBFE',
    title: 'Computing',
    items: ['ICT', 'Computer Science', 'Python', 'Java', 'Artificial Intelligence', 'Robotics'],
  },
];

const tests = [
  {
    icon: '🌐',
    title: 'International',
    body: 'University-facing tests prepared with real timing, real marking and a score target agreed before we start.',
    items: ['SAT', 'ACT', 'PSAT', 'AP', 'IELTS', 'TOEFL', 'EmSAT'],
  },
  {
    icon: '🇵🇰',
    title: 'Pakistan entry tests',
    body: 'Engineering and medical entry preparation with syllabus-mapped drilling and weekly mock scoring.',
    items: ['NUST NET', 'MDCAT', 'ECAT', 'NTS', 'GIKI admission test', 'FAST NU entry test', 'LUMS admission support'],
  },
];

const programs = [
  {
    icon: '🧭',
    tint: '#EEEBFE',
    title: 'Academic mentoring',
    body: 'A dedicated mentor who keeps the whole year on track, not just the next lesson.',
    tags: ['Goal setting', 'Time management', 'Accountability', 'Exam planning'],
  },
  {
    icon: '📓',
    tint: '#FFF4D8',
    title: 'Homework club',
    body: 'Daily drop-in help so homework stops being an evening argument at home.',
    tags: ['Every weekday', 'All subjects', 'Small groups'],
  },
  {
    icon: '🧩',
    tint: '#E9FBF3',
    title: 'Assignment support',
    body: 'Guidance, never completion — we teach the method and let the work stay theirs.',
    tags: ['Projects', 'Coursework', 'Research', 'Lab reports'],
  },
  {
    icon: '🎓',
    tint: '#FFEDE3',
    title: 'University readiness',
    body: 'From shortlist to offer: applications that reflect the student, not a template.',
    tags: ['Personal statements', 'Interview prep', 'Scholarships', 'University selection'],
  },
  {
    icon: '🧠',
    tint: '#EEEBFE',
    title: 'Study skills program',
    body: 'The techniques strong students use — taught explicitly instead of assumed.',
    tags: ['Active recall', 'Spaced repetition', 'Mind mapping', 'Exam strategy'],
  },
];

const regions = [
  {
    icon: '🕌',
    title: 'Middle East',
    items: ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'],
  },
  { icon: '🌏', title: 'South Asia', items: ['Pakistan', 'India', 'Bangladesh'] },
  { icon: '🇪🇺', title: 'Europe', items: ['United Kingdom', 'Ireland'] },
  { icon: '🌎', title: 'North America', items: ['Canada', 'United States'] },
  { icon: '🦘', title: 'Oceania', items: ['Australia', 'New Zealand'] },
];

const reviews = [
  {
    text: 'As a full-time working mother I needed tutoring that was reliable and stress-free. The team not only prepared my daughter for EmSAT, they gave her back her confidence.',
    name: 'Mrs Noraln',
    role: 'Parent · UAE',
    initials: 'MN',
    tint: '#EEEBFE',
  },
  {
    text: 'I never thought I would enjoy studying for the SAT. The sessions were interactive and built around my weak areas — my score went up by 140 points.',
    name: 'Hassan',
    role: 'Student · SAT',
    initials: 'H',
    tint: '#FFEDE3',
  },
  {
    text: 'My son went from struggling in Physics to scoring an A in one term. The tutor explained concepts clearly and fitted around his school schedule perfectly.',
    name: 'Mrs Ayesha',
    role: 'Parent · A Level',
    initials: 'MA',
    tint: '#E9FBF3',
  },
  {
    text: 'Alhamdulillah Zainab got 3A*, 2A and 2B in her IGCSE exams, including an A in Physics. Thank you so much for your hard work and dedication.',
    name: 'Zainab’s mother',
    role: 'Parent · IGCSE',
    initials: 'ZM',
    tint: '#FFF4D8',
  },
  {
    text: 'Alhamdulillah I got an A in IGCSE Physics. Thank you so much for all the hard work and effort you put in with me — it means a lot.',
    name: 'Zainab',
    role: 'Student · IGCSE Physics',
    initials: 'Z',
    tint: '#EEEBFE',
  },
  {
    text: 'Mashallah Abdullah got an A* in Physics. Thanks a lot for your hard work and support.',
    name: 'Abdullah’s mother',
    role: 'Parent · IGCSE Physics',
    initials: 'AM',
    tint: '#FFEDE3',
  },
  {
    text: 'I got an A in Physics, alhamdulillah. Thank you for everything.',
    name: 'Kashmala',
    role: 'Student · IGCSE Physics',
    initials: 'K',
    tint: '#E9FBF3',
  },
];

const resources = [
  { icon: '🗓️', label: 'Revision planners' },
  { icon: '📅', label: 'Weekly study planners' },
  { icon: '➗', label: 'Formula sheets' },
  { icon: '📗', label: 'Vocabulary booklets' },
  { icon: '🃏', label: 'Flashcard packs' },
  { icon: '⏳', label: 'Exam calendars' },
  { icon: '🎯', label: 'Goal trackers' },
  { icon: '✅', label: 'Subject checklists' },
  { icon: '📄', label: 'Past paper guides' },
  { icon: '🎓', label: 'University application checklists' },
];

const steps = [
  { n: '1', title: 'Free trial class', body: 'A real lesson with a matched specialist tutor. No card, no commitment.' },
  {
    n: '2',
    title: 'We set the plan',
    body: 'A short assessment, then a term plan mapped to your exact board and exam dates.',
  },
  {
    n: '3',
    title: 'Lessons run live',
    body: 'Fixed weekly slots on Zoom or Meet, with recordings and notes sent after each class.',
  },
  {
    n: '4',
    title: 'You see progress',
    body: 'Monthly report on attendance, test scores and what to work on next — in plain language.',
  },
];

const plans = [
  {
    label: 'Group',
    price: '$59',
    unit: '/subject/month',
    body: 'Live classes in small groups of up to six students.',
    featured: false,
    items: ['4 live classes a week', 'Recordings and notes', 'Monthly progress report', 'Doubt-clearing chat'],
    bg: '#fff',
    fg: '#241A16',
    kicker: '#5A48D6',
    tick: '#E9FBF3',
    tickFg: '#0F9C6E',
    shadow: '0 16px 34px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9)',
    btnBg: '#FFF0E7',
    btnFg: '#241A16',
    btnShadow: 'inset 0 2px 3px rgba(255,255,255,.9)',
    cta: 'Start free trial',
    href: `${routes.order}?item=academy-group`,
  },
  {
    label: 'One-to-one',
    price: '$149',
    unit: '/subject/month',
    body: 'A dedicated specialist tutor working at your child’s pace.',
    featured: true,
    items: [
      '4 private classes a week',
      'Custom term plan',
      'Weekly parent check-in',
      'Exam and paper practice',
      'Priority rescheduling',
    ],
    bg: 'linear-gradient(160deg,#8F7CFF,#5A48D6)',
    fg: '#fff',
    kicker: 'rgba(255,255,255,.75)',
    tick: 'rgba(255,255,255,.24)',
    tickFg: '#fff',
    shadow: '0 24px 48px rgba(90,72,214,.4), inset 0 2px 3px rgba(255,255,255,.35)',
    btnBg: '#fff',
    btnFg: '#5A48D6',
    btnShadow: '0 12px 24px rgba(0,0,0,.14)',
    cta: 'Start free trial',
    href: `${routes.order}?item=academy-121`,
  },
  {
    label: 'Exam season',
    price: '$449',
    unit: '/subject/term',
    body: 'Board and entrance-exam support through the whole season.',
    featured: false,
    items: [
      'Everything in one-to-one',
      'Past-paper marathons',
      'Mock tests with marking',
      'Revision bootcamps',
      'Second subject 15% off',
    ],
    bg: '#fff',
    fg: '#241A16',
    kicker: '#E8480F',
    tick: '#FFEDE3',
    tickFg: '#E8480F',
    shadow: '0 16px 34px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9)',
    btnBg: 'linear-gradient(180deg,#FF8149,#EF5A1F)',
    btnFg: '#fff',
    btnShadow: '0 14px 26px rgba(226,78,23,.34)',
    cta: 'Talk to us',
    href: `${routes.order}?item=academy-exam`,
  },
];

export function AcademyView() {
  const [boardIndex, setBoardIndex] = useState(0);
  const board = boards[boardIndex];

  return (
    <>
      <Fx as="section" s="position:relative;z-index:1;padding:80px 20px 96px;overflow:hidden">
        <Fx
          className="two"
          s="max-width:1260px;margin:0 auto;position:relative;display:grid;grid-template-columns:minmax(0,1.02fr) minmax(0,.98fr);gap:56px;align-items:center"
        >
          <Fx className="hero-copy">
            <Fx s="display:inline-flex;align-items:center;gap:10px;background:#fff;border-radius:999px;padding:8px 18px 8px 10px;box-shadow:0 10px 22px rgba(120,90,220,.18), inset 0 2px 3px rgba(255,255,255,.9);font-size:13px;font-weight:700;color:#5A48D6;animation:pop .7s cubic-bezier(.34,1.4,.64,1) both">
              <Fx
                as="span"
                s="width:26px;height:26px;border-radius:50%;background:#EEEBFE;display:flex;align-items:center;justify-content:center;font-size:12px"
              >
                🌍
              </Fx>
              Office Pigeon Academy · online worldwide
            </Fx>
            <Fx
              as="h1"
              s="font-size:clamp(38px,5vw,66px);margin-top:24px;max-width:15ch;animation:pop .8s ease-out .1s both"
            >
              Learn smarter. Achieve more.{' '}
              <Fx
                as="span"
                s="background:linear-gradient(120deg,#8F7CFF,#5A48D6 58%,#E8480F);-webkit-background-clip:text;background-clip:text;color:transparent"
              >
                Succeed globally.
              </Fx>
            </Fx>
            <Fx
              as="p"
              s="font-size:18.5px;line-height:1.66;color:rgba(36,26,22,.66);max-width:48ch;margin:24px 0 0;animation:pop .8s ease-out .2s both;text-wrap:pretty"
            >
              One-to-one tutoring and academic mentoring for students on British, American, Canadian, Australian,
              Pakistani and GCC curricula — taught live by specialist tutors, wherever your family happens to be.
            </Fx>

            <Fx s="display:flex;flex-wrap:wrap;gap:9px;margin-top:24px;animation:pop .8s ease-out .28s both">
              {promises.map((promise) => (
                <Fx
                  key={promise}
                  as="span"
                  s="display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:600;color:rgba(36,26,22,.7);background:#fff;border-radius:999px;padding:10px 16px;box-shadow:0 8px 18px rgba(196,120,74,.12), inset 0 2px 3px rgba(255,255,255,.9)"
                >
                  <Fx as="span" s="color:#0F9C6E;font-weight:800">
                    ✔
                  </Fx>
                  {promise}
                </Fx>
              ))}
            </Fx>

            <Fx s="display:flex;gap:14px;margin-top:30px;flex-wrap:wrap;animation:pop .8s ease-out .34s both">
              <Fx
                as={Link}
                href={routes.contact}
                s="display:flex;align-items:center;gap:12px;text-decoration:none;color:#fff;font-weight:700;font-size:16px;padding:17px 22px 17px 28px;border-radius:999px;background:linear-gradient(180deg,#8F7CFF,#5A48D6);box-shadow:0 18px 34px rgba(90,72,214,.4), inset 0 2px 3px rgba(255,255,255,.4);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                hover="transform:translateY(-4px) scale(1.02)"
              >
                Claim a free trial class
                <Fx
                  as="span"
                  s="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.24);display:flex;align-items:center;justify-content:center;font-size:14px"
                >
                  →
                </Fx>
              </Fx>
              <Fx
                as="a"
                href="#curricula"
                s="display:flex;align-items:center;text-decoration:none;color:#241A16;font-weight:700;font-size:16px;padding:17px 26px;border-radius:999px;background:#fff;box-shadow:0 14px 26px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                hover="transform:translateY(-4px)"
              >
                Find your curriculum
              </Fx>
            </Fx>

            <Fx s="display:flex;gap:12px;margin-top:32px;flex-wrap:wrap;animation:pop .8s ease-out .42s both">
              {heroStats.map((stat) => (
                <Fx
                  key={stat.label}
                  s="background:#fff;border-radius:24px;padding:16px 22px;box-shadow:0 12px 26px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9)"
                >
                  <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:27px;color:#5A48D6">
                    {stat.value}
                  </Fx>
                  <Fx s="font-size:12.5px;color:rgba(36,26,22,.55);margin-top:3px">{stat.label}</Fx>
                </Fx>
              ))}
            </Fx>
          </Fx>

          <Fx s="position:relative;animation:pop .9s cubic-bezier(.34,1.3,.64,1) .25s both">
            <Fx className="scene">
              <Fx className="scene-stage">
                {/* The board the tutor is teaching from. */}
                <Fx s="position:absolute;right:0;top:24px;width:398px;max-width:100%;background:#fff;border-radius:26px;padding:14px;box-shadow:0 34px 66px rgba(120,90,220,.26), inset 0 3px 4px rgba(255,255,255,.95)">
                  <Fx s="position:relative;border-radius:18px;background:linear-gradient(170deg,#FBFAFF,#F1EDFF);height:250px;overflow:hidden;padding:18px 20px">
                    <Fx s="font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(90,72,214,.55)">
                      IGCSE Physics · forces &amp; motion
                    </Fx>
                    <Fx s="display:flex;align-items:baseline;gap:10px;margin-top:12px">
                      {boardTokens.map((token) => (
                        <Fx
                          key={token.delay}
                          as="span"
                          s={`font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:${token.size};color:${token.color};animation:pop .5s cubic-bezier(.34,1.4,.64,1) ${token.delay} both`}
                        >
                          {token.text}
                        </Fx>
                      ))}
                    </Fx>
                    <svg
                      viewBox="0 0 340 130"
                      style={{
                        position: 'absolute',
                        left: 14,
                        right: 14,
                        bottom: 12,
                        width: 'calc(100% - 28px)',
                        height: 132,
                      }}
                      aria-hidden="true"
                    >
                      <line x1="26" y1="8" x2="26" y2="106" stroke="rgba(36,26,22,.16)" strokeWidth="2" />
                      <line x1="26" y1="106" x2="322" y2="106" stroke="rgba(36,26,22,.16)" strokeWidth="2" />
                      <path
                        d="M26 100 C90 96 120 78 158 60 C196 42 240 26 318 16"
                        fill="none"
                        stroke="#5A48D6"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="520"
                        style={{ animation: 'draw 2.6s cubic-bezier(.3,1,.4,1) .7s both' }}
                      />
                      <circle
                        cx="158"
                        cy="60"
                        r="7"
                        fill="#fff"
                        stroke="#8F7CFF"
                        strokeWidth="4"
                        style={{ animation: 'pop .5s ease-out 2.4s both' }}
                      />
                      <circle cx="318" cy="16" r="8" fill="#EF5A1F" style={{ animation: 'pop .5s ease-out 3s both' }} />
                      <line
                        x1="240"
                        y1="96"
                        x2="240"
                        y2="46"
                        stroke="#EF5A1F"
                        strokeWidth="4"
                        strokeLinecap="round"
                        style={{ animation: 'pop .5s ease-out 2.7s both' }}
                      />
                      <path
                        d="M232 56 L240 44 L248 56"
                        fill="none"
                        stroke="#EF5A1F"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ animation: 'pop .5s ease-out 2.85s both' }}
                      />
                    </svg>
                  </Fx>
                  <Fx s="display:flex;align-items:center;gap:8px;padding:12px 6px 2px">
                    <Fx as="span" s="width:34px;height:8px;border-radius:999px;background:#5A48D6" />
                    <Fx as="span" s="width:34px;height:8px;border-radius:999px;background:#EF5A1F" />
                    <Fx as="span" s="width:34px;height:8px;border-radius:999px;background:#21C08B" />
                    <Fx
                      as="span"
                      s="margin-left:auto;display:flex;align-items:center;gap:6px;font-size:11px;font-weight:800;letter-spacing:.06em;color:#0F9C6E;background:#E9FBF3;padding:7px 12px;border-radius:999px"
                    >
                      <Fx
                        as="span"
                        s="width:6px;height:6px;border-radius:50%;background:#21C08B;animation:glow 1.7s ease-in-out infinite"
                      />
                      LIVE LESSON
                    </Fx>
                  </Fx>
                </Fx>

                <Fx s="position:absolute;left:50%;bottom:96px;width:300px;height:40px;margin-left:-206px;border-radius:50%;background:radial-gradient(ellipse,rgba(90,72,214,.2),rgba(90,72,214,0) 70%)" />

                {/* The tutor, pointing at the board. */}
                <Fx s="position:absolute;left:6px;bottom:112px;width:176px;animation:classBob 5.6s ease-in-out infinite">
                  <Fx s="position:relative;width:96px;margin:0 0 0 22px;height:100px;border-radius:48px;background:linear-gradient(165deg,#F6D3B2,#EDBF98)">
                    <Fx s="position:absolute;left:-10px;right:-10px;top:-16px;height:56px;border-radius:60px 60px 26px 26px;background:linear-gradient(160deg,#3B2A26,#241A16)" />
                    <Fx s="position:absolute;right:-24px;top:-22px;width:44px;height:44px;border-radius:50%;background:linear-gradient(160deg,#3B2A26,#241A16)" />
                    <Fx s="position:absolute;left:0;right:0;top:50px;display:flex;justify-content:center;gap:22px">
                      <Fx as="span" s="width:9px;height:12px;border-radius:6px;background:#241A16;animation:classBlink 5.4s ease-in-out infinite" />
                      <Fx as="span" s="width:9px;height:12px;border-radius:6px;background:#241A16;animation:classBlink 5.4s ease-in-out infinite" />
                    </Fx>
                    <Fx s="position:absolute;left:50%;bottom:20px;margin-left:-12px;width:24px;height:11px;border-radius:0 0 20px 20px;border-bottom:4px solid #241A16" />
                    <Fx s="position:absolute;left:-6px;top:60px;width:12px;height:16px;border-radius:8px;background:#EDBF98" />
                  </Fx>

                  <Fx s="width:26px;height:16px;margin:-4px 0 0 57px;background:#EDBF98;border-radius:0 0 10px 10px" />

                  <Fx s="position:relative;width:140px;height:168px;border-radius:44px 44px 22px 22px;background:linear-gradient(165deg,#9C8BFF,#5A48D6);box-shadow:0 26px 46px rgba(90,72,214,.34), inset 0 3px 4px rgba(255,255,255,.32)">
                    <Fx s="position:absolute;left:50%;top:0;margin-left:-19px;width:38px;height:40px;border-radius:0 0 22px 22px;background:rgba(255,255,255,.22)" />
                    <Fx s="position:absolute;left:-24px;top:26px;width:26px;height:104px;border-radius:999px;background:linear-gradient(180deg,#9C8BFF,#5A48D6)" />
                    <Fx s="position:absolute;left:-22px;top:118px;width:24px;height:24px;border-radius:50%;background:#F0C6A2" />

                    <Fx s="position:absolute;right:4px;top:16px;width:26px;transform-origin:top center;transform:rotate(-118deg)">
                      <Fx s="position:relative;width:26px;transform-origin:top center;animation:point 3.4s ease-in-out infinite">
                        <Fx s="width:26px;height:92px;border-radius:999px;background:linear-gradient(180deg,#9C8BFF,#5A48D6)" />
                        <Fx s="width:26px;height:26px;border-radius:50%;background:#F0C6A2;margin-top:-6px" />
                        <Fx s="position:absolute;left:10px;top:92px;width:7px;height:112px;border-radius:999px;background:linear-gradient(180deg,#3B2A26,#7A5C4E)" />
                      </Fx>
                    </Fx>
                  </Fx>
                </Fx>

                <Fx s="position:absolute;left:0;right:0;bottom:12px;display:flex;gap:10px;justify-content:flex-start">
                  {classTiles.map((tile) => (
                    <Fx
                      key={tile.name}
                      s="position:relative;flex:1;min-width:0;background:#fff;border-radius:22px;padding:12px;box-shadow:0 18px 34px rgba(120,90,220,.18), inset 0 2px 3px rgba(255,255,255,.9)"
                    >
                      <Fx
                        s={`height:56px;border-radius:14px;background:${tile.tint};display:flex;align-items:center;justify-content:center;font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:19px;color:${tile.fg}`}
                      >
                        {tile.initials}
                      </Fx>
                      <Fx s="font-size:12.5px;font-weight:700;margin-top:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                        {tile.name}
                      </Fx>
                      <Fx s="font-size:11px;color:rgba(36,26,22,.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                        {tile.meta}
                      </Fx>
                      {tile.hand ? (
                        <Fx
                          as="span"
                          s="position:absolute;top:-12px;right:-8px;background:#fff;border-radius:999px;padding:6px 10px;font-size:14px;box-shadow:0 10px 20px rgba(120,90,220,.24);animation:handUp 3.2s ease-in-out infinite"
                        >
                          ✋
                        </Fx>
                      ) : null}
                    </Fx>
                  ))}
                </Fx>

                <Fx
                  className="float"
                  s="position:absolute;left:0;top:0;background:#fff;border-radius:22px;padding:12px 18px;box-shadow:0 18px 38px rgba(120,90,220,.22), inset 0 2px 3px rgba(255,255,255,.9);display:flex;align-items:center;gap:10px;animation:floaty 9s ease-in-out infinite"
                >
                  <Fx
                    as="span"
                    s="width:34px;height:34px;border-radius:50%;background:#E9FBF3;display:flex;align-items:center;justify-content:center;font-size:16px"
                  >
                    💬
                  </Fx>
                  <Fx as="span" s="line-height:1.25">
                    <Fx as="span" s="display:block;font-size:13.5px;font-weight:700;direction:rtl">
                      احجز تجربة مجانية
                    </Fx>
                    <Fx as="span" s="display:block;font-size:11.5px;color:rgba(36,26,22,.55)">
                      Free trial, no card
                    </Fx>
                  </Fx>
                </Fx>
              </Fx>
            </Fx>
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" s="position:relative;z-index:1;padding:0 0 86px;overflow:hidden">
        <Fx s="max-width:1260px;margin:0 auto;padding:0 26px 20px;font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:rgba(36,26,22,.38)">
          Families with us right now
        </Fx>
        <Fx s="display:flex;overflow:hidden;mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)">
          <Fx s="display:flex;gap:14px;padding-right:14px;animation:slide 44s linear infinite;flex:none">
            {[...marquee, ...marquee].map((entry, index) => (
              <Fx
                key={`${entry.label}-${index}`}
                as="span"
                s="display:flex;align-items:center;gap:10px;white-space:nowrap;background:#fff;border-radius:999px;padding:13px 22px;font-size:14.5px;font-weight:700;color:rgba(36,26,22,.6);box-shadow:0 10px 22px rgba(196,120,74,.12), inset 0 2px 3px rgba(255,255,255,.9)"
              >
                <Fx as="span" s="font-size:16px">
                  {entry.icon}
                </Fx>
                {entry.label}
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:1260px;margin:0 auto">
          <Fx s="text-align:center">
            <Fx s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#5A48D6">
              Inside the Academy
            </Fx>
            <Fx
              as="h2"
              s="font-size:clamp(32px,4.2vw,52px);margin-top:14px;max-width:20ch;margin-left:auto;margin-right:auto"
            >
              Three divisions, one long-term plan for your child.
            </Fx>
            <Fx
              as="p"
              s="font-size:16.5px;line-height:1.66;color:rgba(36,26,22,.62);max-width:50ch;margin:16px auto 0;text-wrap:pretty"
            >
              Most tutoring stops at the next exam. We work on the school year, the exam season and what comes after it.
            </Fx>
          </Fx>
          <Fx className="three" s="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:34px">
            {divisions.map((division) => (
              <Fx
                key={division.title}
                className="clay"
                s={`background:${division.bg};color:${division.fg};border-radius:36px;padding:32px 30px 34px;box-shadow:${division.shadow};display:flex;flex-direction:column`}
              >
                <Fx
                  as="span"
                  s={`width:54px;height:54px;border-radius:50%;background:${division.iconBg};display:flex;align-items:center;justify-content:center;font-size:25px;box-shadow:inset 0 2px 3px rgba(255,255,255,.7)`}
                >
                  {division.icon}
                </Fx>
                <Fx as="h3" s="font-size:25px;margin-top:20px">
                  {division.title}
                </Fx>
                <Fx as="p" s="font-size:14.5px;line-height:1.62;opacity:.74;margin:11px 0 20px;text-wrap:pretty">
                  {division.body}
                </Fx>
                <Fx s="display:flex;flex-wrap:wrap;gap:8px;margin-top:auto">
                  {division.tags.map((tag) => (
                    <Fx
                      key={tag}
                      as="span"
                      s={`font-size:12px;font-weight:600;background:${division.chip};color:${division.chipFg};border-radius:999px;padding:7px 13px`}
                    >
                      {tag}
                    </Fx>
                  ))}
                </Fx>
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      <Fx
        as="section"
        id="curricula"
        className="rv"
        s="position:relative;z-index:1;padding:0 20px 92px;scroll-margin-top:120px"
      >
        <Fx s="max-width:1260px;margin:0 auto;background:linear-gradient(150deg,#EEEBFE,#F6F2FF 50%,#FFF0E7);border-radius:46px;padding:44px 40px;box-shadow:inset 0 2px 4px rgba(255,255,255,.9), 0 20px 44px rgba(196,120,74,.14)">
          <Fx s="text-align:center">
            <Fx s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#5A48D6">
              Curricula
            </Fx>
            <Fx as="h2" s="font-size:clamp(30px,4vw,48px);margin-top:14px">
              We teach the board your school actually follows.
            </Fx>
          </Fx>
          <Fx s="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:28px">
            {boards.map((entry, index) => (
              <Fx
                key={entry.label}
                as="button"
                type="button"
                onClick={() => setBoardIndex(index)}
                s={`border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:13.5px;padding:12px 20px;border-radius:999px;background:${
                  index === boardIndex ? 'linear-gradient(180deg,#8F7CFF,#5A48D6)' : '#fff'
                };color:${index === boardIndex ? '#fff' : 'rgba(36,26,22,.66)'};box-shadow:${
                  index === boardIndex
                    ? '0 14px 28px rgba(90,72,214,.34), inset 0 2px 3px rgba(255,255,255,.4)'
                    : '0 10px 22px rgba(196,120,74,.12), inset 0 2px 3px rgba(255,255,255,.9)'
                };transition:background .3s, color .3s, transform .25s cubic-bezier(.34,1.56,.64,1)`}
                hover="transform:translateY(-3px)"
              >
                {entry.label}
              </Fx>
            ))}
          </Fx>
          <Fx s="background:#fff;border-radius:34px;padding:32px 34px;margin-top:26px;box-shadow:0 18px 38px rgba(120,90,220,.14), inset 0 2px 3px rgba(255,255,255,.9)">
            <Fx
              className="two"
              s="display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:32px;align-items:start"
            >
              <Fx>
                <Fx as="h3" s="font-size:26px">
                  {board.title}
                </Fx>
                <Fx
                  as="p"
                  s="font-size:15px;line-height:1.65;color:rgba(36,26,22,.62);margin:12px 0 0;max-width:34ch;text-wrap:pretty"
                >
                  {board.body}
                </Fx>
              </Fx>
              <Fx s="display:flex;flex-wrap:wrap;gap:9px">
                {board.items.map((item) => (
                  <Fx
                    key={item}
                    as="span"
                    s="font-size:13.5px;font-weight:600;color:rgba(36,26,22,.72);background:#FFF6F1;border-radius:999px;padding:11px 18px;box-shadow:inset 0 2px 4px rgba(196,120,74,.12);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                    hover="transform:translateY(-3px)"
                  >
                    {item}
                  </Fx>
                ))}
              </Fx>
            </Fx>
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:1260px;margin:0 auto">
          <Fx s="display:flex;align-items:flex-end;justify-content:space-between;gap:28px;flex-wrap:wrap">
            <Fx>
              <Fx s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#E8480F">
                Subjects
              </Fx>
              <Fx as="h2" s="font-size:clamp(32px,4.2vw,52px);margin-top:14px;max-width:18ch">
                From primary numeracy to Further Mathematics.
              </Fx>
            </Fx>
            <Fx
              as="p"
              s="font-size:15.5px;line-height:1.65;color:rgba(36,26,22,.6);max-width:34ch;margin:0;text-wrap:pretty"
            >
              Every subject is taught by a specialist in that subject — never a generalist filling a slot.
            </Fx>
          </Fx>
          <Fx className="five" s="display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-top:32px">
            {subjects.map((subject) => (
              <Fx
                key={subject.title}
                className="clay"
                s="background:#fff;border-radius:30px;padding:26px 24px 28px;box-shadow:0 16px 34px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9);display:flex;flex-direction:column"
              >
                <Fx
                  as="span"
                  s={`width:48px;height:48px;border-radius:50%;background:${subject.tint};display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)`}
                >
                  {subject.icon}
                </Fx>
                <Fx as="h3" s="font-size:20px;margin-top:16px">
                  {subject.title}
                </Fx>
                <Fx s="display:flex;flex-direction:column;gap:8px;margin-top:14px">
                  {subject.items.map((item) => (
                    <Fx
                      key={item}
                      as="span"
                      s="font-size:13.5px;line-height:1.45;color:rgba(36,26,22,.64);display:flex;gap:8px"
                    >
                      <Fx as="span" s="color:#0F9C6E;font-weight:800">
                        ·
                      </Fx>
                      {item}
                    </Fx>
                  ))}
                </Fx>
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx className="pad-xl" s="max-width:1260px;margin:0 auto;background:linear-gradient(160deg,#2A1A12,#3D2317 55%,#241A16);color:#FFEFE5;border-radius:46px;padding:52px 44px;position:relative;overflow:hidden">
          <Fx s="position:relative;text-align:center">
            <Fx s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#FFB58A">
              Entrance &amp; standardized tests
            </Fx>
            <Fx
              as="h2"
              s="font-size:clamp(30px,4vw,48px);margin-top:14px;max-width:20ch;margin-left:auto;margin-right:auto"
            >
              The exams that decide where they study next.
            </Fx>
          </Fx>
          <Fx className="two" s="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:36px;position:relative">
            {tests.map((test) => (
              <Fx
                key={test.title}
                s="background:rgba(255,239,229,.07);border-radius:32px;padding:30px 30px 32px;box-shadow:inset 0 2px 3px rgba(255,255,255,.12)"
              >
                <Fx s="display:flex;align-items:center;gap:12px">
                  <Fx
                    as="span"
                    s="width:46px;height:46px;border-radius:50%;background:rgba(255,239,229,.14);display:flex;align-items:center;justify-content:center;font-size:21px"
                  >
                    {test.icon}
                  </Fx>
                  <Fx as="h3" s="font-size:22px">
                    {test.title}
                  </Fx>
                </Fx>
                <Fx
                  as="p"
                  s="font-size:14.5px;line-height:1.6;color:rgba(255,239,229,.66);margin:14px 0 18px;max-width:40ch;text-wrap:pretty"
                >
                  {test.body}
                </Fx>
                <Fx s="display:flex;flex-wrap:wrap;gap:8px">
                  {test.items.map((item) => (
                    <Fx
                      key={item}
                      as="span"
                      s="font-size:13px;font-weight:700;color:#FFEFE5;background:rgba(255,239,229,.12);border-radius:999px;padding:9px 15px;transition:background .3s"
                      hover="background:rgba(255,239,229,.22)"
                    >
                      {item}
                    </Fx>
                  ))}
                </Fx>
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:1260px;margin:0 auto">
          <Fx s="text-align:center">
            <Fx s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#5A48D6">
              Beyond the lesson
            </Fx>
            <Fx
              as="h2"
              s="font-size:clamp(32px,4.2vw,52px);margin-top:14px;max-width:20ch;margin-left:auto;margin-right:auto"
            >
              The support that makes the tutoring stick.
            </Fx>
          </Fx>
          <Fx className="three" s="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:34px">
            {programs.map((program) => (
              <Fx
                key={program.title}
                className="clay"
                s="background:#fff;border-radius:30px;padding:26px 24px 28px;box-shadow:0 16px 34px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9);display:flex;flex-direction:column"
              >
                <Fx
                  as="span"
                  s={`width:48px;height:48px;border-radius:50%;background:${program.tint};display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)`}
                >
                  {program.icon}
                </Fx>
                <Fx as="h3" s="font-size:20px;margin-top:16px">
                  {program.title}
                </Fx>
                <Fx as="p" s="font-size:14px;line-height:1.6;color:rgba(36,26,22,.62);margin:9px 0 16px;text-wrap:pretty">
                  {program.body}
                </Fx>
                <Fx s="display:flex;flex-wrap:wrap;gap:7px;margin-top:auto">
                  {program.tags.map((tag) => (
                    <Fx
                      key={tag}
                      as="span"
                      s="font-size:12px;font-weight:600;color:rgba(36,26,22,.58);background:#FFF6F1;border-radius:999px;padding:6px 12px"
                    >
                      {tag}
                    </Fx>
                  ))}
                </Fx>
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:1260px;margin:0 auto;background:linear-gradient(150deg,#FFEDE3,#FFF6F1 52%,#E9FBF3);border-radius:46px;padding:14px;box-shadow:inset 0 2px 4px rgba(255,255,255,.9), 0 20px 44px rgba(196,120,74,.14)">
          <Fx
            className="two"
            s="display:grid;grid-template-columns:minmax(0,1.06fr) minmax(0,.94fr);gap:14px;align-items:stretch"
          >
            <Fx className="pad-xl" s="padding:44px 38px">
              <Fx s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#E8480F">
                Where our students are
              </Fx>
              <Fx as="h2" s="font-size:clamp(30px,3.8vw,46px);margin-top:14px;max-width:15ch">
                Same tutor, whatever the time zone.
              </Fx>
              <Fx
                as="p"
                s="font-size:16px;line-height:1.68;color:rgba(36,26,22,.64);max-width:42ch;margin:14px 0 0;text-wrap:pretty"
              >
                Classes run on Zoom and Google Meet at times that fit school, prayer and family life — Gulf evenings, UK
                afternoons, North American mornings.
              </Fx>
              <Fx s="display:flex;flex-direction:column;gap:14px;margin-top:26px">
                {regions.map((region) => (
                  <Fx
                    key={region.title}
                    s="background:#fff;border-radius:26px;padding:20px 22px;box-shadow:0 12px 26px rgba(196,120,74,.12), inset 0 2px 3px rgba(255,255,255,.9)"
                  >
                    <Fx s="display:flex;align-items:center;gap:10px">
                      <Fx as="span" s="font-size:17px">
                        {region.icon}
                      </Fx>
                      <Fx
                        as="span"
                        s="font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(36,26,22,.45)"
                      >
                        {region.title}
                      </Fx>
                    </Fx>
                    <Fx s="display:flex;flex-wrap:wrap;gap:7px;margin-top:12px">
                      {region.items.map((item) => (
                        <Fx
                          key={item}
                          as="span"
                          s="font-size:13px;font-weight:600;color:rgba(36,26,22,.68);background:#FFF6F1;border-radius:999px;padding:7px 13px"
                        >
                          {item}
                        </Fx>
                      ))}
                    </Fx>
                  </Fx>
                ))}
              </Fx>
            </Fx>
            <Fx s="border-radius:36px;overflow:hidden;min-height:460px;background:#fff">
              <ImageSlot id="academy-world" placeholder="A student learning at home" sizes="(max-width: 1000px) 92vw, 600px" />
            </Fx>
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:1260px;margin:0 auto">
          <Fx s="display:flex;align-items:flex-end;justify-content:space-between;gap:28px;flex-wrap:wrap">
            <Fx>
              <Fx s="font-size:14px;color:#E8A100;letter-spacing:.12em">★★★★★</Fx>
              <Fx as="h2" s="font-size:clamp(30px,4vw,48px);margin-top:12px;max-width:18ch">
                Families keep coming back — and sending friends.
              </Fx>
            </Fx>
            <Fx
              as="p"
              s="font-size:15.5px;line-height:1.65;color:rgba(36,26,22,.6);max-width:32ch;margin:0;text-wrap:pretty"
            >
              Over a hundred five-star reviews from families our tutors have taught, across sixteen countries.
            </Fx>
          </Fx>
          <Fx className="three" s="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:32px">
            {reviews.map((review) => (
              <Fx
                key={review.name}
                className="clay"
                s="background:#fff;border-radius:32px;padding:30px 28px 32px;box-shadow:0 16px 34px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9);display:flex;flex-direction:column"
              >
                <Fx s="font-size:14px;color:#E8A100;letter-spacing:.12em">★★★★★</Fx>
                <Fx as="p" s="font-size:15.5px;line-height:1.62;color:rgba(36,26,22,.76);margin:16px 0 0;text-wrap:pretty">
                  {review.text}
                </Fx>
                <Fx s="display:flex;align-items:center;gap:12px;margin-top:auto;padding-top:24px">
                  <Fx
                    as="span"
                    className="tt"
                    s={`width:42px;height:42px;flex:none;border-radius:50%;background:${review.tint};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px`}
                  >
                    {review.initials}
                  </Fx>
                  <Fx as="span" s="line-height:1.3">
                    <Fx as="span" s="display:block;font-weight:700;font-size:14.5px">
                      {review.name}
                    </Fx>
                    <Fx as="span" s="display:block;font-size:12.5px;color:rgba(36,26,22,.52)">
                      {review.role}
                    </Fx>
                  </Fx>
                </Fx>
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx
          className="two"
          s="max-width:1260px;margin:0 auto;display:grid;grid-template-columns:minmax(0,.94fr) minmax(0,1.06fr);gap:20px;align-items:stretch"
        >
          <Fx s="background:linear-gradient(160deg,#8F7CFF,#5A48D6);color:#fff;border-radius:40px;padding:42px 38px;box-shadow:0 26px 52px rgba(90,72,214,.36), inset 0 2px 3px rgba(255,255,255,.35)">
            <Fx
              as="span"
              s="width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:24px"
            >
              📖
            </Fx>
            <Fx as="h2" s="font-size:clamp(28px,3.4vw,40px);margin-top:20px;max-width:16ch">
              Free study resources, sent the day you ask.
            </Fx>
            <Fx as="p" s="font-size:15.5px;line-height:1.65;opacity:.8;margin:14px 0 24px;max-width:38ch;text-wrap:pretty">
              Planners, formula sheets and exam calendars our own tutors use with students. No signup wall — just tell
              us the board and year group.
            </Fx>
            <Fx
              as={Link}
              href={routes.contact}
              s="display:inline-flex;align-items:center;gap:12px;text-decoration:none;color:#5A48D6;font-weight:700;font-size:15.5px;padding:16px 24px;border-radius:999px;background:#fff;box-shadow:0 14px 28px rgba(0,0,0,.16);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
              hover="transform:translateY(-3px)"
            >
              Request the pack
              <Fx
                as="span"
                s="width:28px;height:28px;border-radius:50%;background:#EEEBFE;display:flex;align-items:center;justify-content:center;font-size:13px"
              >
                →
              </Fx>
            </Fx>
          </Fx>
          <Fx s="background:#fff;border-radius:40px;padding:36px 34px;box-shadow:0 18px 40px rgba(196,120,74,.15), inset 0 2px 3px rgba(255,255,255,.9)">
            <Fx s="display:flex;flex-wrap:wrap;gap:10px">
              {resources.map((resource) => (
                <Fx
                  key={resource.label}
                  as="span"
                  s="display:flex;align-items:center;gap:9px;font-size:13.5px;font-weight:600;color:rgba(36,26,22,.7);background:#FFF6F1;border-radius:999px;padding:12px 18px;box-shadow:inset 0 2px 4px rgba(196,120,74,.12);transition:transform .3s cubic-bezier(.34,1.56,.64,1), background .3s"
                  hover="transform:translateY(-3px);background:#FFEDE3"
                >
                  <Fx as="span" s="font-size:15px">
                    {resource.icon}
                  </Fx>
                  {resource.label}
                </Fx>
              ))}
            </Fx>
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:1260px;margin:0 auto">
          <Fx s="text-align:center">
            <Fx s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#5A48D6">
              How a term runs
            </Fx>
            <Fx as="h2" s="font-size:clamp(30px,4vw,48px);margin-top:14px">
              Start with a free class. Decide after that.
            </Fx>
          </Fx>
          <Fx className="four" s="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:34px">
            {steps.map((step) => (
              <Fx
                key={step.n}
                className="clay"
                s="background:#fff;border-radius:28px;padding:24px 22px 26px;box-shadow:0 14px 30px rgba(120,90,220,.14), inset 0 2px 3px rgba(255,255,255,.9)"
              >
                <Fx
                  as="span"
                  s="width:38px;height:38px;border-radius:50%;background:linear-gradient(150deg,#8F7CFF,#5A48D6);color:#fff;font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 16px rgba(90,72,214,.3)"
                >
                  {step.n}
                </Fx>
                <Fx as="h3" s="font-size:18.5px;margin-top:16px">
                  {step.title}
                </Fx>
                <Fx as="p" s="font-size:13.5px;line-height:1.6;color:rgba(36,26,22,.62);margin:8px 0 0;text-wrap:pretty">
                  {step.body}
                </Fx>
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx s="max-width:1260px;margin:0 auto">
          <Fx s="text-align:center">
            <Fx s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#5A48D6">
              Plans
            </Fx>
            <Fx as="h2" s="font-size:clamp(32px,4.2vw,52px);margin-top:14px">
              Simple monthly fees.
            </Fx>
            <Fx
              as="p"
              s="font-size:16.5px;line-height:1.65;color:rgba(36,26,22,.62);max-width:50ch;margin:16px auto 0;text-wrap:pretty"
            >
              Per subject, per month, with flexible weekday or weekend scheduling. Cancel any time — and refer a family
              for 10% off.
            </Fx>
          </Fx>
          <Fx
            className="three"
            s="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:34px;align-items:start"
          >
            {plans.map((plan) => (
              <Fx
                key={plan.label}
                className="clay"
                s={`background:${plan.bg};color:${plan.fg};border-radius:36px;padding:34px 30px 36px;box-shadow:${plan.shadow};position:relative`}
              >
                {plan.featured ? (
                  <Fx
                    as="span"
                    s="position:absolute;top:22px;right:24px;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;background:rgba(255,255,255,.22);padding:7px 12px;border-radius:999px"
                  >
                    Most chosen
                  </Fx>
                ) : null}
                <Fx
                  s={`font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:${plan.kicker}`}
                >
                  {plan.label}
                </Fx>
                <Fx s="display:flex;align-items:baseline;gap:8px;margin-top:16px">
                  <Fx
                    as="span"
                    s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:44px;letter-spacing:-0.04em"
                  >
                    {plan.price}
                  </Fx>
                  <Fx as="span" s="font-size:14px;opacity:.66">
                    {plan.unit}
                  </Fx>
                </Fx>
                <Fx as="p" s="font-size:14.5px;line-height:1.6;opacity:.72;margin:12px 0 0;text-wrap:pretty">
                  {plan.body}
                </Fx>
                <Fx s="display:flex;flex-direction:column;gap:10px;margin-top:24px">
                  {plan.items.map((item) => (
                    <Fx key={item} s="display:flex;align-items:flex-start;gap:10px;font-size:14px;line-height:1.5">
                      <Fx
                        as="span"
                        s={`width:20px;height:20px;flex:none;border-radius:50%;background:${plan.tick};color:${plan.tickFg};display:flex;align-items:center;justify-content:center;font-size:11px;margin-top:1px`}
                      >
                        ✓
                      </Fx>
                      {item}
                    </Fx>
                  ))}
                </Fx>
                <Fx
                  as={Link}
                  href={plan.href}
                  s={`display:flex;align-items:center;justify-content:center;margin-top:28px;text-decoration:none;color:${plan.btnFg};font-weight:700;font-size:15px;padding:15px;border-radius:999px;background:${plan.btnBg};box-shadow:${plan.btnShadow};transition:transform .3s cubic-bezier(.34,1.56,.64,1)`}
                  hover="transform:translateY(-3px)"
                >
                  {plan.cta}
                </Fx>
              </Fx>
            ))}
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 96px">
        <Fx className="pad-xl" s="max-width:1260px;margin:0 auto;background:#fff;border-radius:44px;padding:52px 46px;box-shadow:0 24px 50px rgba(196,120,74,.18), inset 0 2px 4px rgba(255,255,255,.95);display:flex;align-items:center;justify-content:space-between;gap:32px;flex-wrap:wrap">
          <Fx>
            <Fx as="h2" s="font-size:clamp(28px,3.4vw,42px);max-width:18ch">
              Try one class free. No card, no commitment.
            </Fx>
            <Fx
              as="p"
              s="font-size:16px;line-height:1.65;color:rgba(36,26,22,.62);max-width:46ch;margin:14px 0 0;text-wrap:pretty"
            >
              Tell us the curriculum, year group and subject — we&apos;ll match a specialist tutor and run a real lesson
              this week.{' '}
              <Fx as="span" s="direction:rtl;display:inline-block">
                احجز تجربة مجانية الآن
              </Fx>
            </Fx>
          </Fx>
          <Fx
            as={Link}
            href={routes.contact}
            className="cta-block"
            s="flex:none;display:flex;align-items:center;gap:12px;text-decoration:none;color:#fff;font-weight:700;font-size:16px;padding:18px 26px 18px 30px;border-radius:999px;background:linear-gradient(180deg,#8F7CFF,#5A48D6);box-shadow:0 18px 34px rgba(90,72,214,.4), inset 0 2px 3px rgba(255,255,255,.4);transition:transform .3s cubic-bezier(.34,1.56,.64,1);animation:floaty 5s ease-in-out infinite"
            hover="transform:translateY(-4px) scale(1.02)"
          >
            Book a free trial class
            <Fx
              as="span"
              s="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.24);display:flex;align-items:center;justify-content:center;font-size:13px"
            >
              →
            </Fx>
          </Fx>
        </Fx>
      </Fx>

      {/* The professional track. School tutoring bills by the month against a
          school timetable; these bill by the hour because an adult books around
          a job — so they are shown as a separate track rather than a fourth
          plan card. */}
      <Fx as="section" className="rv" s="position:relative;z-index:1;padding:0 20px 92px">
        <Fx
          className="pad-xl"
          s="max-width:1260px;margin:0 auto;background:linear-gradient(150deg,#EEEBFE,#F6F2FF 50%,#FFF0E7);border-radius:46px;padding:48px 44px;box-shadow:inset 0 2px 4px rgba(255,255,255,.9), 0 20px 44px rgba(196,120,74,.14)"
        >
          <Fx s="text-align:center">
            <Fx s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#5A48D6">
              Professional track
            </Fx>
            <Fx as="h2" s="font-size:clamp(30px,3.8vw,46px);margin-top:14px;max-width:22ch;margin-left:auto;margin-right:auto">
              Not at school any more? We teach adults too.
            </Fx>
            <Fx
              as="p"
              s="font-size:16.5px;line-height:1.65;color:rgba(36,26,22,.62);max-width:56ch;margin:16px auto 0;text-wrap:pretty"
            >
              Separate from school tutoring: practical technology courses taught one-to-one by our own engineers, for
              students, career changers and founders. Billed by the hour, and the first session is free.
            </Fx>
          </Fx>

          <Fx className="two" s="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:32px;align-items:start">
            {courses.map((course) => (
              <Fx
                key={course.slug}
                as={Link}
                href={coursePath(course)}
                className="clay"
                s="display:block;text-decoration:none;color:#241A16;background:#fff;border-radius:32px;padding:30px 28px 32px;box-shadow:0 16px 34px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                hover="transform:translateY(-4px)"
              >
                <Fx s="display:flex;align-items:center;gap:12px">
                  <Fx
                    as="span"
                    s="width:46px;height:46px;border-radius:18px;background:#EEEBFE;display:flex;align-items:center;justify-content:center;font-size:21px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)"
                  >
                    {course.badgeIcon}
                  </Fx>
                  <Fx s="font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#5A48D6">
                    {course.badge}
                  </Fx>
                </Fx>
                <Fx as="h3" s="font-size:26px;margin-top:18px">
                  {course.name}
                </Fx>
                <Fx as="p" s="font-size:15px;line-height:1.62;color:rgba(36,26,22,.62);margin:10px 0 0;text-wrap:pretty">
                  {course.cardBlurb}
                </Fx>
                <Fx s="display:flex;align-items:baseline;gap:8px;margin-top:20px">
                  <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:34px;letter-spacing:-0.03em">
                    ${Math.min(...course.tiers.map((tier) => tier.price))}
                  </Fx>
                  <Fx s="font-size:14px;color:rgba(36,26,22,.5)">/hour · first session free</Fx>
                </Fx>
                <Fx s="display:inline-flex;align-items:center;gap:10px;margin-top:20px;font-weight:700;font-size:15px;color:#E8480F">
                  See the curriculum →
                </Fx>
              </Fx>
            ))}

            <Fx s="background:#fff;border-radius:32px;padding:30px 28px 32px;box-shadow:0 16px 34px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9)">
              <Fx
                as="span"
                s="width:46px;height:46px;border-radius:18px;background:#FFF4D8;display:flex;align-items:center;justify-content:center;font-size:21px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)"
              >
                🧭
              </Fx>
              <Fx as="h3" s="font-size:24px;margin-top:18px;max-width:18ch">
                More technical courses are on the way.
              </Fx>
              <Fx as="p" s="font-size:15px;line-height:1.62;color:rgba(36,26,22,.62);margin:10px 0 0;text-wrap:pretty">
                Applied AI Engineering is the first. If there is something specific you want to learn one-to-one, tell
                us — we would rather build the course around a real student than guess.
              </Fx>
              <Fx
                as={Link}
                href={routes.courses}
                s="display:inline-flex;align-items:center;gap:10px;margin-top:20px;text-decoration:none;font-weight:700;font-size:15px;color:#5A48D6"
              >
                Browse the professional track →
              </Fx>
            </Fx>
          </Fx>
        </Fx>
      </Fx>

      <Fx as="section" s="position:relative;z-index:1;padding:0 20px 90px">
        <Fx s="max-width:1260px;margin:0 auto">
          <PriceNote />
        </Fx>
      </Fx>
    </>
  );
}
