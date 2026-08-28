import type { Metadata } from 'next';

import { notFound } from 'next/navigation';

import { ConfirmSubmit } from '@/components/site/dashboard/ConfirmSubmit';
import { controls } from '@/components/site/dashboard/styles';
import { Card, Empty, SectionHead, tone } from '@/components/site/dashboard/ui';
import { Fx } from '@/components/ui/Fx';
import { requireViewer } from '@/lib/auth';
import { BUCKETS, list, publicUrl } from '@/lib/supabase/storage';

import { deleteMediaAction, uploadMediaAction } from '../../actions';

export const metadata: Metadata = { title: 'Media' };

export default async function MediaPage() {
  const viewer = await requireViewer();
  if (viewer.role !== 'admin') notFound();

  const files = await list(BUCKETS.media, '', 200).catch(() => []);

  return (
    <>
      <Card>
        <SectionHead
          title="Media library"
          note="Images the marketing pages can reference by path. Anything here is publicly readable."
        />

        <Fx as="form" action={uploadMediaAction} s="margin-top:16px">
          <Fx as="label" htmlFor="media-file" s={controls.label}>
            Upload an image
          </Fx>
          <Fx
            as="input"
            id="media-file"
            name="file"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml"
            required
            s={`${controls.input};padding:12px 14px`}
          />
          <Fx s="margin-top:14px">
            <ConfirmSubmit variant="primary">Upload</ConfirmSubmit>
          </Fx>
        </Fx>
      </Card>

      <Card>
        <SectionHead title={`${files.length} ${files.length === 1 ? 'file' : 'files'}`} />

        {files.length ? (
          <Fx s="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(180px,100%),1fr));gap:14px;margin-top:18px">
            {files.map((file) => (
              <Fx
                key={file.path}
                s="background:#FFF6F1;border-radius:24px;padding:12px;box-shadow:inset 0 2px 5px rgba(196,120,74,.12);display:flex;flex-direction:column;gap:10px"
              >
                <Fx
                  as="img"
                  src={publicUrl(BUCKETS.media, file.path)}
                  alt={file.name}
                  loading="lazy"
                  s="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:16px;background:#fff"
                />
                <Fx as="span" s="font-size:12.5px;font-weight:700;word-break:break-word;line-height:1.4">
                  {file.name}
                </Fx>
                <Fx as="code" s={`font-size:11px;color:${tone.muted};word-break:break-all`}>
                  {file.path}
                </Fx>
                <Fx as="form" action={deleteMediaAction}>
                  <input type="hidden" name="path" value={file.path} />
                  <ConfirmSubmit variant="danger" confirmLabel={`Delete ${file.name}?`} full>
                    Delete
                  </ConfirmSubmit>
                </Fx>
              </Fx>
            ))}
          </Fx>
        ) : (
          <Empty
            title="No media yet"
            body="Upload an image and its path becomes available to the content tables."
          />
        )}
      </Card>
    </>
  );
}
