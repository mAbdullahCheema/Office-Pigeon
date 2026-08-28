'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { Fx } from '@/components/ui/Fx';
import { routes } from '@/lib/routes';

/**
 * What a visitor sees when a page throws.
 *
 * Without this boundary a single failed database read took down the whole
 * response and Next.js served its own bare error screen. Here the failure is
 * contained: the visitor gets the brand, an honest sentence, and two ways out —
 * retry the render, or go somewhere that works.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[site] render failed:', error);
  }, [error]);

  return (
    <Fx
      as="main"
      s="min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:40px 20px;background:#FFF7F1"
    >
      <Fx s="width:min(620px,100%);background:#fff;border-radius:42px;padding:48px 44px;text-align:center;box-shadow:0 26px 54px rgba(196,120,74,.2), inset 0 2px 4px rgba(255,255,255,.95);animation:pop .6s cubic-bezier(.34,1.4,.64,1) both">
        <Fx
          as="span"
          s="width:64px;height:64px;margin:0 auto;border-radius:24px;background:#FFEDE3;display:flex;align-items:center;justify-content:center;font-size:28px"
        >
          🪶
        </Fx>
        <Fx s="font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#E8480F;margin-top:22px">
          Something broke
        </Fx>
        <Fx as="h1" s="font-size:clamp(28px,4vw,40px);margin-top:12px">
          That did not load.
        </Fx>
        <Fx
          as="p"
          s="font-size:16.5px;line-height:1.66;color:rgba(36,26,22,.64);margin:14px auto 0;max-width:46ch;text-wrap:pretty"
        >
          The page hit an error on our side. Trying again usually clears it — if it does not, tell us
          and we will look straight away.
        </Fx>

        <Fx s="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:30px">
          <Fx
            as="button"
            type="button"
            onClick={reset}
            s="display:flex;align-items:center;gap:10px;border:none;cursor:pointer;color:#fff;font-weight:700;font-size:15.5px;padding:16px 26px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 16px 30px rgba(226,78,23,.36), inset 0 2px 3px rgba(255,255,255,.45);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
            hover="transform:translateY(-3px)"
          >
            Try again
          </Fx>
          <Fx
            as={Link}
            href={routes.home}
            s="display:flex;align-items:center;text-decoration:none;color:#241A16;font-weight:700;font-size:15.5px;padding:16px 24px;border-radius:999px;background:#FFF0E7;box-shadow:inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
            hover="transform:translateY(-3px)"
          >
            Back to the homepage
          </Fx>
        </Fx>

        {error.digest ? (
          <Fx s="margin-top:24px;font-size:12px;color:rgba(36,26,22,.42)">
            Reference {error.digest}
          </Fx>
        ) : null}
      </Fx>
    </Fx>
  );
}
