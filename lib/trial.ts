'use client';

import { appFor, type ProductApp } from './catalog';

/**
 * Product trials. A trial is a local, browser-held grant — the paid licence is
 * an order row and is resolved on the server. Same storage key as the prototype
 * so an in-flight trial survives the port.
 */

const KEY = 'op_trials_v1';

type Trials = Record<string, { startedAt: number; expiresAt: number }>;

export type TrialState = {
  exists: boolean;
  active: boolean;
  expired: boolean;
  daysLeft: number;
  days: number;
};

function read(): Trials {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Trials) : {};
  } catch {
    return {};
  }
}

function write(trials: Trials) {
  try {
    localStorage.setItem(KEY, JSON.stringify(trials));
  } catch {
    /* storage refused — the trial simply does not persist */
  }
}

export function trialFor(key: ProductApp['key']): TrialState {
  const app = appFor(key);
  const days = app?.trialDays ?? 7;
  const record = read()[key];
  if (!record) return { exists: false, active: false, expired: false, daysLeft: days, days };

  const left = Math.ceil((record.expiresAt - Date.now()) / 86400000);
  return {
    exists: true,
    active: left > 0,
    expired: left <= 0,
    daysLeft: Math.max(0, left),
    days,
  };
}

export function startTrial(key: ProductApp['key']): TrialState {
  const app = appFor(key);
  if (!app) return trialFor(key);

  const trials = read();
  if (!trials[key]) {
    trials[key] = { startedAt: Date.now(), expiresAt: Date.now() + app.trialDays * 86400000 };
    write(trials);
  }
  return trialFor(key);
}
