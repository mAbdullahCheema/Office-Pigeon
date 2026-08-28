import type { Metadata } from 'next';

import { ConfirmSubmit } from '@/components/site/dashboard/ConfirmSubmit';
import { Notice } from '@/components/site/dashboard/Notice';
import { controls } from '@/components/site/dashboard/styles';
import { Card, SectionHead, tone } from '@/components/site/dashboard/ui';
import { Fx } from '@/components/ui/Fx';
import { requireViewer } from '@/lib/auth';
import { getProfile } from '@/lib/data';

import { removeAvatarAction, saveProfileAction, uploadAvatarAction } from '../actions';

export const metadata: Metadata = { title: 'Settings' };

const notifications = [
  { key: 'notify_orders', label: 'Order status changes', note: 'Email me when an order moves' },
  { key: 'notify_invoices', label: 'Invoice reminders', note: 'Three days before a charge' },
  { key: 'notify_classes', label: 'Class reminders', note: 'One hour before each Academy class' },
  { key: 'notify_news', label: 'Product news', note: 'Occasional — never more than monthly' },
] as const;

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireViewer();
  const params = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

  const profile = await getProfile(viewer.id);

  const referral = `PIGEON-${(viewer.name.split(' ')[0] || 'YOU').toUpperCase().slice(0, 6)}`;

  return (
    <>
      {first(params.saved) ? <Notice tone="good">Saved.</Notice> : null}
      {first(params.error) ? <Notice tone="bad">{first(params.error)}</Notice> : null}

      <Card>
        <SectionHead title="Your picture" note="Optional. Shown only to you and our team." />
        <Fx s="display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-top:18px">
          {viewer.avatarUrl ? (
            <Fx
              as="img"
              src={viewer.avatarUrl}
              alt=""
              width={72}
              height={72}
              s="width:72px;height:72px;border-radius:50%;object-fit:cover;box-shadow:0 10px 24px rgba(196,120,74,.2)"
            />
          ) : (
            <Fx
              as="span"
              s="width:72px;height:72px;border-radius:50%;background:linear-gradient(150deg,#FFA46A,#EF5A1F);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:24px"
            >
              {viewer.name.slice(0, 1).toUpperCase()}
            </Fx>
          )}

          <Fx as="form" action={uploadAvatarAction} s="flex:1;min-width:min(260px,100%)">
            <Fx as="label" htmlFor="avatar" s={controls.label}>
              Upload a new one
            </Fx>
            <Fx
              as="input"
              id="avatar"
              name="avatar"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              required
              s={`${controls.input};padding:12px 14px`}
            />
            <Fx s="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
              <ConfirmSubmit variant="primary">Save picture</ConfirmSubmit>
            </Fx>
          </Fx>

          {viewer.avatarUrl ? (
            <Fx as="form" action={removeAvatarAction}>
              <ConfirmSubmit variant="danger" confirmLabel="Remove your profile picture?">
                Remove
              </ConfirmSubmit>
            </Fx>
          ) : null}
        </Fx>
      </Card>

      <Fx className="two" s="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px;align-items:start">
        <Card>
          <SectionHead title="Your details" note="Used on quotes, invoices and anything we post to you." />

          <Fx as="form" action={saveProfileAction} s="margin-top:18px">
            <Fx s="display:flex;flex-direction:column;gap:12px">
              <Fx>
                <Fx as="label" htmlFor="p-name" s={controls.label}>
                  Name
                </Fx>
                <Fx
                  as="input"
                  id="p-name"
                  name="name"
                  autoComplete="name"
                  defaultValue={viewer.name}
                  s={controls.input}
                />
              </Fx>

              <Fx>
                <Fx as="label" s={controls.label}>
                  Email
                </Fx>
                <Fx
                  s={`margin-top:7px;font-size:15px;font-weight:700;background:#F1EFE8;border-radius:18px;padding:13px 16px;color:${tone.muted};word-break:break-word`}
                >
                  {viewer.email}
                </Fx>
                <Fx as="p" s={`font-size:12.5px;color:${tone.muted};margin:7px 0 0`}>
                  Your email is the key to the account, so it is changed by us — message us and we will verify you first.
                </Fx>
              </Fx>

              <Fx>
                <Fx as="label" htmlFor="p-phone" s={controls.label}>
                  Phone or WhatsApp
                </Fx>
                <Fx
                  as="input"
                  id="p-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  defaultValue={profile?.phone ?? ''}
                  s={controls.input}
                />
              </Fx>

              <Fx>
                <Fx as="label" htmlFor="p-company" s={controls.label}>
                  Company
                </Fx>
                <Fx as="input" id="p-company" name="company" defaultValue={profile?.company ?? ''} s={controls.input} />
              </Fx>

              <Fx className="pair" s="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <Fx>
                  <Fx as="label" htmlFor="p-country" s={controls.label}>
                    Country
                  </Fx>
                  <Fx as="input" id="p-country" name="country" defaultValue={profile?.country ?? ''} s={controls.input} />
                </Fx>
                <Fx>
                  <Fx as="label" htmlFor="p-city" s={controls.label}>
                    City
                  </Fx>
                  <Fx as="input" id="p-city" name="city" defaultValue={profile?.city ?? ''} s={controls.input} />
                </Fx>
              </Fx>

              <Fx>
                <Fx as="label" htmlFor="p-address" s={controls.label}>
                  Address
                </Fx>
                <Fx as="input" id="p-address" name="address" defaultValue={profile?.address ?? ''} s={controls.input} />
              </Fx>
            </Fx>

            <Fx
              s={`font-size:11.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${tone.faint};margin-top:22px`}
            >
              Email me about
            </Fx>
            <Fx s="display:flex;flex-direction:column;gap:9px;margin-top:10px">
              {notifications.map((entry) => (
                <Fx
                  key={entry.key}
                  as="label"
                  htmlFor={entry.key}
                  s="display:flex;align-items:center;gap:12px;background:#FFF6F1;border-radius:20px;padding:13px 16px;box-shadow:inset 0 2px 5px rgba(196,120,74,.12);cursor:pointer"
                >
                  <Fx
                    as="input"
                    id={entry.key}
                    name={entry.key}
                    type="checkbox"
                    defaultChecked={
                      viewer.notify[
                        entry.key.replace('notify_', '') as keyof typeof viewer.notify
                      ]
                    }
                    s="width:18px;height:18px;flex:none;accent-color:#EF5A1F"
                  />
                  <Fx as="span" s="line-height:1.35;min-width:0">
                    <Fx as="span" s="display:block;font-weight:700;font-size:14px">
                      {entry.label}
                    </Fx>
                    <Fx as="span" s={`display:block;font-size:12.5px;color:${tone.muted};margin-top:2px`}>
                      {entry.note}
                    </Fx>
                  </Fx>
                </Fx>
              ))}
            </Fx>

            <Fx s="margin-top:20px">
              <ConfirmSubmit variant="primary" full>
                Save changes
              </ConfirmSubmit>
            </Fx>
          </Fx>
        </Card>

        <Fx s="display:flex;flex-direction:column;gap:14px">
          <Card>
            <SectionHead title="Sign-in" note="How you get into this account." />
            <Fx s="display:flex;flex-direction:column;gap:10px;margin-top:16px">
              <Fx
                s={`display:flex;align-items:center;justify-content:space-between;gap:12px;background:#FFF6F1;border-radius:20px;padding:14px 18px;box-shadow:inset 0 2px 5px rgba(196,120,74,.12)`}
              >
                <Fx as="span" s="font-size:14px;font-weight:700">
                  Email address
                </Fx>
                <Fx as="span" s={`font-size:13px;color:${tone.muted};word-break:break-word;text-align:right`}>
                  {viewer.email}
                </Fx>
              </Fx>
              <Fx
                s={`display:flex;align-items:center;justify-content:space-between;gap:12px;background:#FFF6F1;border-radius:20px;padding:14px 18px;box-shadow:inset 0 2px 5px rgba(196,120,74,.12)`}
              >
                <Fx as="span" s="font-size:14px;font-weight:700">
                  Email verified
                </Fx>
                <Fx
                  as="span"
                  s={`font-size:13px;font-weight:800;color:${viewer.emailVerified ? '#0F9C6E' : '#B4230C'}`}
                >
                  {viewer.emailVerified ? 'Yes' : 'Not yet'}
                </Fx>
              </Fx>
              <Fx as="p" s={`font-size:13px;line-height:1.6;color:${tone.muted};margin:4px 0 0`}>
                You can sign in with Google or with your password — both reach this same account.
              </Fx>
            </Fx>
          </Card>

          <Fx s="background:linear-gradient(160deg,#2A1A12,#3D2317);color:#FFEFE5;border-radius:34px;padding:26px 28px">
            <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:18px">
              Refer a business, get a month free
            </Fx>
            <Fx as="p" s="font-size:13.5px;line-height:1.6;color:rgba(255,239,229,.7);margin:9px 0 0">
              Share your code and we credit your next invoice when they go live.
            </Fx>
            <Fx s="margin-top:16px;background:rgba(255,239,229,.1);border-radius:18px;padding:14px 18px;font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:19px;letter-spacing:.08em;color:#FFB58A">
              {profile?.referral_code || referral}
            </Fx>
          </Fx>
        </Fx>
      </Fx>
    </>
  );
}
