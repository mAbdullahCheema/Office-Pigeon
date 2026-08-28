'use client';

import { useState } from 'react';

import { Fx } from '@/components/ui/Fx';

import { ConfirmSubmit } from './ConfirmSubmit';
import { controls, surfaces, tone } from './styles';

export type PayMethod = {
  id: string;
  label: string;
  kind: 'crypto' | 'bank';
  currency: string;
  address: string;
  network: string;
  accountName: string;
  bankName: string;
  branch: string;
  iban: string;
  swift: string;
  instructions: string;
  icon: string;
  tint: string;
};

/**
 * Where a customer pays, and how they tell us they did.
 *
 * Picking a method is client state because the details on screen and the
 * amount's currency both follow it. Everything that matters is still submitted
 * to the server action and re-checked there — this component only decides what
 * is shown.
 */
export function PaymentForm({
  action,
  orderId,
  orderRef,
  amountDue,
  orderCurrency,
  methods,
}: {
  action: (formData: FormData) => void | Promise<void>;
  orderId: string;
  orderRef: string;
  amountDue: number;
  orderCurrency: string;
  methods: PayMethod[];
}) {
  const [selected, setSelected] = useState(methods[0]?.id ?? '');
  const method = methods.find((entry) => entry.id === selected) ?? methods[0];

  // A crypto method is quoted in its own coin, so the order's figure would be
  // the wrong number to prefill; only a matching currency can be assumed.
  const sameCurrency = method?.currency === orderCurrency;

  const rows = method
    ? (
        [
          method.kind === 'crypto'
            ? { label: `${method.currency} address`, value: method.address, copy: true }
            : { label: 'Account number', value: method.address, copy: true },
          method.network ? { label: 'Network', value: method.network, copy: false } : null,
          method.accountName ? { label: 'Account name', value: method.accountName, copy: true } : null,
          method.bankName ? { label: 'Bank', value: method.bankName, copy: false } : null,
          method.branch ? { label: 'Branch', value: method.branch, copy: false } : null,
          method.iban ? { label: 'IBAN', value: method.iban, copy: true } : null,
          method.swift ? { label: 'SWIFT / BIC', value: method.swift, copy: true } : null,
        ] as ({ label: string; value: string; copy: boolean } | null)[]
      ).filter((row): row is { label: string; value: string; copy: boolean } => row !== null)
    : [];

  return (
    <Fx s={surfaces.card}>
      <Fx as="h2" s="font-size:21px;margin:0">
        Pay for {orderRef}
      </Fx>
      <Fx as="p" s={`font-size:14px;line-height:1.62;color:${tone.muted};margin:8px 0 0;max-width:58ch;text-wrap:pretty`}>
        Send the transfer using one of the options below, then tell us about it. We check every payment by hand — usually
        within a few hours — and the order moves on as soon as it clears.
      </Fx>

      <Fx s="display:flex;gap:8px;flex-wrap:wrap;margin-top:20px">
        {methods.map((entry) => {
          const active = entry.id === selected;
          return (
            <Fx
              key={entry.id}
              as="button"
              type="button"
              onClick={() => setSelected(entry.id)}
              aria-pressed={active}
              s={`display:flex;align-items:center;gap:9px;border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:13.5px;padding:11px 16px;border-radius:999px;background:${
                active ? 'linear-gradient(180deg,#FF8149,#EF5A1F)' : entry.tint
              };color:${active ? '#fff' : '#241A16'};box-shadow:${
                active ? '0 12px 22px rgba(226,78,23,.3)' : 'inset 0 2px 3px rgba(255,255,255,.9)'
              };transition:background .3s, color .3s`}
            >
              <Fx as="span" s="font-size:15px">
                {entry.icon}
              </Fx>
              {entry.label}
            </Fx>
          );
        })}
      </Fx>

      {method ? (
        <Fx s="margin-top:18px;display:flex;flex-direction:column;gap:9px">
          {rows.map((row) => (
            <CopyRow key={row.label} label={row.label} value={row.value} copyable={row.copy} />
          ))}

          {method.instructions ? (
            <Fx s="background:#FFF4D8;border-radius:20px;padding:14px 18px;box-shadow:inset 0 2px 4px rgba(255,255,255,.8)">
              <Fx as="p" s="font-size:13.5px;line-height:1.6;color:rgba(36,26,22,.72);margin:0;white-space:pre-wrap">
                {method.instructions}
              </Fx>
            </Fx>
          ) : null}

          {method.kind === 'crypto' ? (
            <Fx s="background:#FFEDE3;border-radius:20px;padding:14px 18px">
              <Fx as="p" s="font-size:13px;line-height:1.6;color:#8C3208;margin:0;font-weight:600">
                Send only {method.currency}
                {method.network ? ` on the ${method.network} network` : ''} to this address. Coins sent on another
                network cannot be recovered.
              </Fx>
            </Fx>
          ) : null}
        </Fx>
      ) : null}

      <Fx as="form" action={action} s="margin-top:24px">
        <input type="hidden" name="orderId" value={orderId} />
        <input type="hidden" name="method" value={method?.id ?? ''} />
        <input type="hidden" name="methodLabel" value={method?.label ?? ''} />
        <input type="hidden" name="currency" value={method?.currency ?? orderCurrency} />

        <Fx s={`font-size:11.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${tone.faint}`}>
          Then tell us about it
        </Fx>

        <Fx className="pair" s="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:12px">
          <Fx>
            <Fx as="label" htmlFor="pay-amount" s={controls.label}>
              Amount sent ({method?.currency ?? orderCurrency})
            </Fx>
            <Fx
              as="input"
              id="pay-amount"
              name="amount"
              type="number"
              step="any"
              min="0"
              required
              defaultValue={sameCurrency && amountDue > 0 ? String(amountDue) : ''}
              placeholder={sameCurrency ? String(amountDue) : '0.00'}
              s={controls.input}
            />
          </Fx>
          <Fx>
            <Fx as="label" htmlFor="pay-reference" s={controls.label}>
              Transaction id or reference
            </Fx>
            <Fx
              as="input"
              id="pay-reference"
              name="reference"
              placeholder={method?.kind === 'crypto' ? 'Transaction hash' : 'Transfer reference'}
              s={controls.input}
            />
          </Fx>
        </Fx>

        <Fx s="margin-top:14px">
          <Fx as="label" htmlFor="pay-proof" s={controls.label}>
            Screenshot or receipt
          </Fx>
          <Fx
            as="input"
            id="pay-proof"
            name="proof"
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            required
            s={`${controls.input};padding:12px 14px`}
          />
          <Fx as="p" s={`font-size:12.5px;color:${tone.muted};margin:7px 0 0`}>
            PNG, JPG, WebP or PDF, up to 10 MB. Only you and our team can open it.
          </Fx>
        </Fx>

        <Fx s="margin-top:14px">
          <Fx as="label" htmlFor="pay-note" s={controls.label}>
            Anything we should know
          </Fx>
          <Fx
            as="textarea"
            id="pay-note"
            name="note"
            rows={3}
            placeholder="Optional — the name on the account, the date you sent it, anything unusual."
            s={`${controls.input};resize:vertical`}
          />
        </Fx>

        <Fx s="margin-top:20px">
          <ConfirmSubmit variant="primary" full>
            I have sent the payment
          </ConfirmSubmit>
        </Fx>
      </Fx>
    </Fx>
  );
}

function CopyRow({ label, value, copyable }: { label: string; value: string; copyable: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be refused; the value is on screen to read.
    }
  }

  return (
    <Fx s="display:flex;align-items:center;gap:12px;background:#FFF6F1;border-radius:20px;padding:13px 16px;box-shadow:inset 0 2px 5px rgba(196,120,74,.12)">
      <Fx as="span" s="line-height:1.4;min-width:0;flex:1">
        <Fx
          as="span"
          s={`display:block;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${tone.faint}`}
        >
          {label}
        </Fx>
        <Fx
          as="span"
          s="display:block;font-size:14px;font-weight:700;margin-top:3px;word-break:break-all;font-variant-numeric:tabular-nums"
        >
          {value}
        </Fx>
      </Fx>
      {copyable ? (
        <Fx
          as="button"
          type="button"
          onClick={copy}
          s={`border:0;cursor:pointer;font-family:inherit;font-weight:800;font-size:12px;color:${
            copied ? '#0F9C6E' : '#E8480F'
          };background:#fff;padding:9px 14px;border-radius:999px;white-space:nowrap;box-shadow:0 6px 14px rgba(196,120,74,.14)`}
        >
          {copied ? 'Copied' : 'Copy'}
        </Fx>
      ) : null}
    </Fx>
  );
}
