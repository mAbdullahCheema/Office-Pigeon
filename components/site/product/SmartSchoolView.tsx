import { Fx } from '@/components/ui/Fx';
import { appFor } from '@/lib/catalog';
import type { CatalogEntry } from '@/lib/site-content';

import { ProductPage } from './ProductPage';

const app = appFor('school')!;

const rows = [
  {
    icon: '🧒',
    name: 'Ayesha Siddiqui · 8-B',
    detail: 'Absent · father notified 8:12 AM',
    tag: 'Absent',
    tagBg: '#FFEDE3',
    tagFg: '#E8480F',
  },
  {
    icon: '💳',
    name: 'Fee invoice · 9-A',
    detail: '31 of 34 paid · 3 reminders sent',
    tag: 'Chasing',
    tagBg: '#FFF4D8',
    tagFg: '#96690A',
  },
  {
    icon: '📝',
    name: 'Term 2 report cards',
    detail: 'Marks in for 11 of 14 subjects',
    tag: 'Drafting',
    tagBg: '#EEEBFE',
    tagFg: '#5A48D6',
  },
  {
    icon: '🎒',
    name: 'Admission · Hamza Tariq',
    detail: 'Interview booked Thu 11:00',
    tag: 'New',
    tagBg: '#E9FBF3',
    tagFg: '#0F9C6E',
  },
];

function HeroCard() {
  return (
    <Fx s="background:#fff;border-radius:38px;padding:20px;box-shadow:0 26px 54px rgba(196,120,74,.2), inset 0 2px 4px rgba(255,255,255,.95);animation:pop .9s cubic-bezier(.34,1.4,.64,1) .1s both">
      <Fx s="display:flex;align-items:center;gap:10px">
        <Fx as="span" s="width:9px;height:9px;border-radius:50%;background:#5A48D6;animation:glow 2s ease-in-out infinite" />
        <Fx
          as="span"
          s="font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(36,26,22,.45)"
        >
          Monday · period 2 · 420 students
        </Fx>
      </Fx>
      <Fx s="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px">
        <Fx s="background:#EEEBFE;border-radius:22px;padding:16px 18px">
          <Fx s="font-size:11.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:rgba(36,26,22,.5)">
            Present today
          </Fx>
          <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:30px;margin-top:6px;color:#4536B8">
            397
          </Fx>
        </Fx>
        <Fx s="background:#E9FBF3;border-radius:22px;padding:16px 18px">
          <Fx s="font-size:11.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:rgba(36,26,22,.5)">
            Fees collected
          </Fx>
          <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:30px;margin-top:6px;color:#0B7B57">
            92%
          </Fx>
        </Fx>
      </Fx>
      <Fx s="display:flex;flex-direction:column;gap:8px;margin-top:10px">
        {rows.map((row) => (
          <Fx key={row.name} s="display:flex;align-items:center;gap:12px;background:#FFF6F1;border-radius:18px;padding:12px 16px">
            <Fx
              as="span"
              s="width:30px;height:30px;flex:none;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:13px"
            >
              {row.icon}
            </Fx>
            <Fx as="span" s="flex:1;min-width:0;line-height:1.35">
              <Fx as="span" s="display:block;font-weight:700;font-size:13.5px">
                {row.name}
              </Fx>
              <Fx as="span" s="display:block;font-size:12px;color:rgba(36,26,22,.52)">
                {row.detail}
              </Fx>
            </Fx>
            <Fx
              as="span"
              s={`font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;background:${row.tagBg};color:${row.tagFg};padding:7px 11px;border-radius:999px;white-space:nowrap`}
            >
              {row.tag}
            </Fx>
          </Fx>
        ))}
      </Fx>
    </Fx>
  );
}

export function SmartSchoolView({ entry, licensed }: { entry: CatalogEntry; licensed: boolean }) {
  return (
    <ProductPage
      app={app}
      entry={entry}
      licensed={licensed}
      badge={{ pill: '14-DAY FREE TRIAL', note: 'A full term of records, no card.' }}
      title="The whole campus, out of the spreadsheets."
      lede="Admissions, attendance, fees, timetables and report cards in one system — so the office stops reconciling three registers and a WhatsApp group to answer one parent's question."
      buyLabel="Buy it from $199/mo"
      heroCard={<HeroCard />}
      stats={[
        { value: '40+', label: 'classrooms running it' },
        { value: '6 hrs', label: 'saved per teacher weekly' },
        { value: '92%', label: 'fees collected on time' },
        { value: '2 taps', label: 'to mark a full register' },
      ]}
      featuresTitle="Six registers, one record per child."
      features={[
        {
          icon: '🎒',
          title: 'Admissions to alumni',
          body: 'One timeline per student: enquiry, interview, enrolment, results, leaving certificate. Searchable in a second.',
        },
        {
          icon: '✅',
          title: 'Attendance in two taps',
          body: 'Teachers mark from any phone. Absentee SMS and WhatsApp go to parents before first break.',
        },
        {
          icon: '💳',
          title: 'Fees that chase themselves',
          body: 'Invoices, part payments, receipts and reminders on a schedule you set — with a defaulters list that is always current.',
        },
        {
          icon: '📝',
          title: 'Report cards in minutes',
          body: 'Teachers enter marks, the system does grades, positions, remarks and a branded PDF for every child.',
        },
        {
          icon: '📅',
          title: 'Timetable that catches clashes',
          body: 'Build the grid once; substitutions for an absent teacher are suggested from who is actually free.',
        },
        {
          icon: '👪',
          title: 'A parent app that answers itself',
          body: 'Attendance, fees, homework and results in a phone view, so the office phone rings a lot less.',
        },
      ]}
      stepsTitle="Migrated over one holiday, live on day one of term."
      steps={[
        {
          n: '1',
          title: 'Send us your registers',
          body: 'Whatever you have — Excel, a printed list, another system. We clean and import it, including last year’s results.',
        },
        {
          n: '2',
          title: 'Train the staff in an afternoon',
          body: 'Two sessions: office team on fees and admissions, teachers on attendance and marks. Recorded for new joiners.',
        },
        {
          n: '3',
          title: 'Go live with parents',
          body: 'Parent logins go out with a printed guide in the language you teach in. We stay on call for the first month.',
        },
      ]}
      planIncludes={{
        'sso-core': [
          'Up to 500 students',
          'Unlimited staff logins',
          'Parent app included',
          'Data migration done for you',
        ],
        'sso-multi': [
          'Up to 3 campuses',
          'Group reporting across sites',
          'Per-campus fee structures',
          'Priority support line',
        ],
      }}
      trialPanel={{
        kicker: 'Try before you buy',
        title: 'Fourteen days with one real class.',
        body: 'Add a section, mark a week of attendance, raise fee invoices and print a report card. If the office does not prefer it to the register by day three, nothing is lost.',
      }}
      panel={{
        bg: 'linear-gradient(160deg,#221B33,#2E2447 55%,#241A16)',
        fg: '#F1EEFF',
        kicker: '#BEB4FF',
        body: 'rgba(241,238,255,.7)',
        btnBg: '#BEB4FF',
      }}
      faqsTitle="Questions principals ask first"
      faqs={[
        {
          q: 'What if the internet drops mid-lesson?',
          a: 'Attendance and marks are taken offline on the device and sync when the connection returns. Nothing is lost and nobody has to re-key a register.',
        },
        {
          q: 'Can we keep our own fee structure?',
          a: 'Yes — per class, per sibling discount, per scholarship, monthly or termly, with your late-fee rules. We set it up from your current fee sheet during migration.',
        },
        {
          q: 'Who can see student data?',
          a: 'You do. Roles are granular: a class teacher sees their sections, the accounts office sees fees but not medical notes, and every access is logged. Data stays in your account and is exportable at any time.',
        },
        {
          q: 'Do parents need to install anything?',
          a: 'No. The parent view is a web link that works on any phone, and notices also go by SMS and WhatsApp for families who prefer that.',
        },
      ]}
    />
  );
}
