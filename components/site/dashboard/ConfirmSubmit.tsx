'use client';

import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';

import { Fx } from '@/components/ui/Fx';

import { controls } from './styles';

/**
 * The submit button for every row action in the dashboard.
 *
 * It exists as a client component for two reasons: `useFormStatus` needs one to
 * disable the button while the action runs, and a destructive action needs a
 * confirm step before the form is allowed to submit.
 */
export function ConfirmSubmit({
  children,
  variant = 'soft',
  confirmLabel,
  full = false,
}: {
  children: ReactNode;
  variant?: 'primary' | 'soft' | 'danger';
  confirmLabel?: string;
  full?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Fx
      as="button"
      type="submit"
      disabled={pending}
      onClick={
        confirmLabel
          ? (event: React.MouseEvent<HTMLButtonElement>) => {
              if (!window.confirm(confirmLabel)) event.preventDefault();
            }
          : undefined
      }
      s={`${controls[variant]};${full ? 'width:100%;' : ''}opacity:${pending ? 0.6 : 1};cursor:${
        pending ? 'wait' : 'pointer'
      }`}
      hover={pending ? undefined : 'transform:translateY(-2px)'}
    >
      {pending ? 'Working…' : children}
    </Fx>
  );
}
