import type { Metadata } from 'next';

import { ConfirmSubmit } from '@/components/site/dashboard/ConfirmSubmit';
import { Notice } from '@/components/site/dashboard/Notice';
import { controls } from '@/components/site/dashboard/styles';
import { Badge, Card, Empty, Row, SectionHead, tone } from '@/components/site/dashboard/ui';
import { Fx } from '@/components/ui/Fx';
import { requireViewer } from '@/lib/auth';
import { formatDate } from '@/lib/dashboard/format';
import { listCustomerFiles } from '@/lib/data';

import { deleteCustomerFileAction, uploadCustomerFileAction } from '../actions';

export const metadata: Metadata = { title: 'Files' };

const categoryIcon: Record<string, { icon: string; tint: string }> = {
  brand: { icon: '🎨', tint: '#EEEBFE' },
  scope: { icon: '📄', tint: '#FFEDE3' },
  invoice: { icon: '🧾', tint: '#FFF4D8' },
  report: { icon: '📊', tint: '#FFF0E7' },
  handover: { icon: '🔑', tint: '#E9FBF3' },
  other: { icon: '📁', tint: '#FFF0E7' },
};

/** Bytes are stored raw; a human needs the shortest unit that stays readable. */
function fileSize(bytes: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function FilesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireViewer();
  const params = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

  const files = await listCustomerFiles({ userId: viewer.id, visibleOnly: true }).catch(() => []);

  return (
    <>
      {first(params.saved) ? <Notice tone="good">Uploaded. We have filed it against your account.</Notice> : null}
      {first(params.error) ? <Notice tone="bad">{first(params.error)}</Notice> : null}

      <Fx className="two" s="display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,.75fr);gap:18px;align-items:start">
        <Card flush>
          <SectionHead flush title="Files and documents" note="Everything we have made for you, plus what you sent us." />

          {files.map((file) => {
            const look = categoryIcon[file.category] ?? categoryIcon.other;
            return (
              <Row
                key={file.id}
                icon={look.icon}
                tint={look.tint}
                title={file.name}
                meta={[formatDate(file.created_at), fileSize(file.size), file.note].filter(Boolean).join(' · ')}
                trailing={
                  <Badge bg="#FFF6F1" fg={tone.muted}>
                    {file.category}
                  </Badge>
                }
                action={
                  <Fx s="display:flex;align-items:center;gap:8px">
                    <Fx
                      as="a"
                      href={`/api/files/document/${file.id}`}
                      s="text-decoration:none;font-size:12.5px;font-weight:800;color:#E8480F;white-space:nowrap"
                    >
                      Download
                    </Fx>
                    {file.uploaded_by === 'customer' ? (
                      <Fx as="form" action={deleteCustomerFileAction}>
                        <input type="hidden" name="id" value={file.id} />
                        <ConfirmSubmit variant="danger" confirmLabel={`Delete ${file.name}? This cannot be undone.`}>
                          Delete
                        </ConfirmSubmit>
                      </Fx>
                    ) : null}
                  </Fx>
                }
              />
            );
          })}

          {files.length === 0 ? (
            <Empty
              title="Nothing filed yet"
              body="Brand assets, scopes, invoices and handover notes all land here as we produce them."
            />
          ) : null}
        </Card>

        <Fx s="display:flex;flex-direction:column;gap:14px">
          <Card>
            <Fx s="text-align:center">
              <Fx
                as="span"
                s="width:52px;height:52px;border-radius:50%;background:#FFEDE3;display:inline-flex;align-items:center;justify-content:center;font-size:22px"
              >
                ⬆️
              </Fx>
              <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:17px;margin-top:14px">
                Send us a file
              </Fx>
              <Fx as="p" s={`font-size:13.5px;line-height:1.6;color:${tone.muted};margin:8px 0 0`}>
                Logos, brand assets, price lists, past-paper packs — upload them here and we file them against your
                account.
              </Fx>
            </Fx>

            <Fx as="form" action={uploadCustomerFileAction} s="margin-top:18px">
              <Fx as="label" htmlFor="file-upload" s={controls.label}>
                File
              </Fx>
              <Fx
                as="input"
                id="file-upload"
                name="file"
                type="file"
                required
                s={`${controls.input};padding:12px 14px`}
              />

              <Fx s="margin-top:12px">
                <Fx as="label" htmlFor="file-category" s={controls.label}>
                  What is it
                </Fx>
                <Fx as="select" id="file-category" name="category" defaultValue="brand" s={controls.input}>
                  <option value="brand">Brand assets</option>
                  <option value="scope">Scope or brief</option>
                  <option value="report">Report</option>
                  <option value="handover">Handover</option>
                  <option value="other">Something else</option>
                </Fx>
              </Fx>

              <Fx s="margin-top:12px">
                <Fx as="label" htmlFor="file-note" s={controls.label}>
                  Note
                </Fx>
                <Fx as="input" id="file-note" name="note" placeholder="Optional" s={controls.input} />
              </Fx>

              <Fx s="margin-top:16px">
                <ConfirmSubmit variant="primary" full>
                  Upload
                </ConfirmSubmit>
              </Fx>
            </Fx>
          </Card>

          <Fx s="background:#EEEBFE;border-radius:30px;padding:22px 24px">
            <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:17px">Storage</Fx>
            <Fx as="p" s={`font-size:13.5px;line-height:1.6;color:${tone.muted};margin:8px 0 0`}>
              Everything we make for you stays available here for as long as your account is open. Files are private —
              only you and our team can open them.
            </Fx>
          </Fx>
        </Fx>
      </Fx>
    </>
  );
}
