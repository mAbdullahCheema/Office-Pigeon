import type { Metadata } from 'next';

import Link from 'next/link';

import { Badge, Card, Empty, Row, SectionHead } from '@/components/site/dashboard/ui';
import { Fx } from '@/components/ui/Fx';
import { requireViewer } from '@/lib/auth';
import { formatDate } from '@/lib/dashboard/format';
import { listClasses, listEnrollments } from '@/lib/data';
import { routes } from '@/lib/routes';

export const metadata: Metadata = { title: 'Classes' };

const classTint: Record<string, { bg: string; fg: string }> = {
  confirmed: { bg: '#E9FBF3', fg: '#0F9C6E' },
  scheduled: { bg: '#EEEBFE', fg: '#5A48D6' },
  rescheduling: { bg: '#FFF4D8', fg: '#B07C00' },
  cancelled: { bg: '#F1EFE8', fg: 'rgba(36,26,22,.5)' },
  completed: { bg: '#F1EFE8', fg: 'rgba(36,26,22,.55)' },
};

export default async function ClassesPage() {
  const viewer = await requireViewer();

  const [enrollments, classes] = await Promise.all([
    listEnrollments({ userId: viewer.id }).catch(() => []),
    listClasses({ publishedOnly: true }),
  ]);

  const active = enrollments.filter((entry) => entry.status === 'active');
  const byId = new Map(classes.map((entry) => [entry.id, entry]));

  // Progress is per-enrollment, so the card shows the average across the
  // subjects a student is actually taking rather than a single row's numbers.
  const average = (pick: (row: (typeof active)[number]) => number) =>
    active.length ? Math.round(active.reduce((sum, row) => sum + pick(row), 0) / active.length) : 0;

  const progress = [
    { label: 'Attendance', value: average((row) => row.attendance) },
    { label: 'Mock test average', value: average((row) => row.mock_average) },
    { label: 'Homework submitted', value: average((row) => row.homework) },
  ];

  return (
    <Fx className="two" s="display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:18px;align-items:start">
      <Card flush>
        <SectionHead
          flush
          title="Your classes"
          note={active.length ? `${active.length} active ${active.length === 1 ? 'subject' : 'subjects'}` : undefined}
        />

        {enrollments.map((entry) => {
          const detail = byId.get(entry.class_id);
          const status = detail?.status ?? 'scheduled';
          const tint = classTint[status] ?? classTint.scheduled;

          return (
            <Row
              key={entry.id}
              icon={detail?.icon || '📚'}
              tint={detail?.tint || '#EEEBFE'}
              title={entry.class_title || detail?.title || 'Class'}
              meta={[
                detail?.time_label,
                detail?.tutor ? `with ${detail.tutor}` : '',
                detail?.starts_at ? `next ${formatDate(detail.starts_at)}` : '',
              ]
                .filter(Boolean)
                .join(' · ')}
              trailing={
                <Badge bg={tint.bg} fg={tint.fg}>
                  {entry.status === 'active' ? status : entry.status}
                </Badge>
              }
              action={
                detail?.meeting_url && entry.status === 'active' ? (
                  <Fx
                    as="a"
                    href={detail.meeting_url}
                    target="_blank"
                    rel="noreferrer"
                    s="text-decoration:none;font-weight:800;font-size:12.5px;color:#E8480F;white-space:nowrap"
                  >
                    Join →
                  </Fx>
                ) : null
              }
            />
          );
        })}

        {enrollments.length === 0 ? (
          <Empty
            title="No classes yet"
            body="Once you enrol with the Academy your timetable, tutors and progress show up here."
            action={
              <Fx
                as={Link}
                href={routes.academy}
                s="display:inline-flex;text-decoration:none;color:#fff;font-weight:700;font-size:14.5px;padding:14px 24px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 14px 26px rgba(226,78,23,.34)"
              >
                See the Academy
              </Fx>
            }
          />
        ) : null}
      </Card>

      <Fx s="background:linear-gradient(160deg,#8F7CFF,#5A48D6);color:#fff;border-radius:38px;padding:30px 30px 32px;box-shadow:0 22px 44px rgba(90,72,214,.34), inset 0 2px 3px rgba(255,255,255,.3)">
        <Fx
          as="span"
          s="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:22px"
        >
          📈
        </Fx>
        <Fx as="h2" s="font-size:22px;margin:18px 0 0">
          Latest progress report
        </Fx>

        {active.length ? (
          <>
            <Fx s="display:flex;flex-direction:column;gap:12px;margin-top:18px">
              {progress.map((row) => (
                <Fx key={row.label}>
                  <Fx s="display:flex;align-items:center;justify-content:space-between;font-size:13.5px;font-weight:700">
                    <span>{row.label}</span>
                    <span>{row.value}%</span>
                  </Fx>
                  <Fx s="height:8px;border-radius:999px;background:rgba(255,255,255,.22);margin-top:7px;overflow:hidden">
                    <Fx s={`height:100%;width:${row.value}%;background:#fff;border-radius:999px`} />
                  </Fx>
                </Fx>
              ))}
            </Fx>
            <Fx as="p" s="font-size:13.5px;line-height:1.6;color:rgba(255,255,255,.78);margin:20px 0 0">
              Averaged across your active subjects. The full written report is emailed on the first of each month.
            </Fx>
          </>
        ) : (
          <Fx as="p" s="font-size:13.5px;line-height:1.6;color:rgba(255,255,255,.78);margin:16px 0 0">
            Progress appears here once a student is enrolled and the first classes have run.
          </Fx>
        )}
      </Fx>
    </Fx>
  );
}
