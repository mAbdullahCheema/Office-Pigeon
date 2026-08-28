'use client';

import { useState } from 'react';

import { Fx } from '@/components/ui/Fx';

import { ConfirmSubmit } from './ConfirmSubmit';
import { controls, tone } from './styles';

/**
 * Sets a new password for a customer, from the customer's own row.
 *
 * This is how a locked-out account is recovered. There is no mail provider, so
 * a "reset link" would depend on email that may never arrive; a person who has
 * verified who they are talking to can just set one instead.
 *
 * Collapsed by default. Changing someone else's credentials should take a
 * deliberate click, not sit open as a text box under every row.
 */
export function SetPassword({
  action,
  userId,
  name,
}: {
  action: (formData: FormData) => void | Promise<void>;
  userId: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Fx s="margin:0 20px 14px">
        <Fx
          as="button"
          type="button"
          onClick={() => setOpen(true)}
          s={`${controls.soft};background:#FFF6F1;cursor:pointer;border:0;font-family:inherit`}
        >
          Set a new password
        </Fx>
      </Fx>
    );
  }

  return (
    <Fx
      as="form"
      action={action}
      s="margin:0 20px 14px;background:#FFF6F1;border-radius:22px;padding:14px 18px;box-shadow:inset 0 2px 5px rgba(196,120,74,.12)"
    >
      <input type="hidden" name="userId" value={userId} />

      <Fx as="label" htmlFor={`pw-${userId}`} s={controls.label}>
        New password for {name}
      </Fx>
      <Fx
        as="input"
        id={`pw-${userId}`}
        name="password"
        type="text"
        autoComplete="off"
        minLength={8}
        required
        placeholder="At least 8 characters"
        s={controls.input}
      />
      <Fx as="p" s={`font-size:12px;line-height:1.5;color:${tone.muted};margin:7px 0 0`}>
        Shown in plain text so you can read it back to them. Tell them to change it once they are in.
        The change is written to the audit log.
      </Fx>

      <Fx s="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
        <ConfirmSubmit
          variant="danger"
          confirmLabel={`Set a new password for ${name}? They will be signed out everywhere.`}
        >
          Set password
        </ConfirmSubmit>
        <Fx
          as="button"
          type="button"
          onClick={() => setOpen(false)}
          s={`${controls.soft};background:#fff;cursor:pointer;border:0;font-family:inherit`}
        >
          Cancel
        </Fx>
      </Fx>
    </Fx>
  );
}
