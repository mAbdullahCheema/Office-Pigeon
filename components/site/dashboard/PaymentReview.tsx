import { Fx } from '@/components/ui/Fx';

import { ConfirmSubmit } from './ConfirmSubmit';
import { controls, tone } from './styles';

/**
 * The accept/reject step under a payment row.
 *
 * Verifying is the write that moves money-related state on the order, so it is
 * deliberately a considered action with the screenshot one click away and a
 * note field beside it, rather than a bare status dropdown.
 */
export function PaymentReview({
  action,
  id,
  status,
  proofHref,
  adminNote,
  reviewedBy,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  status: string;
  proofHref: string | null;
  adminNote: string;
  reviewedBy: string;
}) {
  const decided = status === 'verified' || status === 'rejected' || status === 'refunded';

  return (
    <Fx s="margin:0 20px 14px;background:#FFF6F1;border-radius:22px;padding:14px 18px;box-shadow:inset 0 2px 5px rgba(196,120,74,.12)">
      <Fx s="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        {proofHref ? (
          <Fx
            as="a"
            href={proofHref}
            target="_blank"
            rel="noreferrer"
            s={`${controls.soft};background:#fff`}
          >
            🔍 Open the screenshot
          </Fx>
        ) : (
          <Fx as="span" s={`font-size:12.5px;color:${tone.muted};font-weight:600`}>
            No screenshot attached
          </Fx>
        )}

        {decided ? (
          <Fx as="span" s={`font-size:12.5px;color:${tone.muted};font-weight:600`}>
            {status} {reviewedBy ? `by ${reviewedBy}` : ''}
            {adminNote ? ` — ${adminNote}` : ''}
          </Fx>
        ) : null}
      </Fx>

      <Fx as="form" action={action} s="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-top:12px">
        <input type="hidden" name="id" value={id} />

        <Fx s="flex:1;min-width:min(240px,100%)">
          <Fx as="label" htmlFor={`note-${id}`} s={controls.label}>
            Note (optional)
          </Fx>
          <Fx
            as="input"
            id={`note-${id}`}
            name="adminNote"
            defaultValue={adminNote}
            placeholder="What you checked, or why it was rejected"
            s={`${controls.input};background:#fff`}
          />
        </Fx>

        {/* The decision travels as the submit button's own value, so the note
            typed above is carried by whichever button is pressed. */}
        <Fx s="display:flex;gap:8px;flex-wrap:wrap">
          <Fx as="button" type="submit" name="decision" value="verified" s={`${controls.primary};cursor:pointer`}>
            Verify
          </Fx>
          <Fx as="button" type="submit" name="decision" value="rejected" s={`${controls.danger};cursor:pointer`}>
            Reject
          </Fx>
        </Fx>
      </Fx>

      {status === 'verified' ? (
        <Fx as="form" action={action} s="margin-top:10px">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="decision" value="refunded" />
          <ConfirmSubmit variant="soft" confirmLabel="Mark this payment refunded?">
            Mark refunded
          </ConfirmSubmit>
        </Fx>
      ) : null}
    </Fx>
  );
}
