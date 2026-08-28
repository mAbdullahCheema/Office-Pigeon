import type { ReactNode } from 'react';

import { BackToTop } from '@/components/ui/BackToTop';
import { Fx } from '@/components/ui/Fx';
import { Reveal } from '@/components/ui/Reveal';
import { currentIdentity } from '@/lib/auth';

import { CookieConsent } from './CookieConsent';
import { PipWidget } from './PipWidget';
import { SiteFooter } from './SiteFooter';
import { SiteNav, type NavKey } from './SiteNav';

/** The drifting colour wash every public page sits on. */
function Blobs() {
  return (
    <Fx s="position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden">
      <Fx s="position:absolute;top:-260px;left:-220px;width:760px;height:760px;border-radius:50%;background:radial-gradient(circle,rgba(255,182,134,.48),rgba(255,182,134,0) 68%);animation:blobby 18s ease-in-out infinite" />
      <Fx s="position:absolute;top:-120px;right:-240px;width:780px;height:780px;border-radius:50%;background:radial-gradient(circle,rgba(190,180,255,.42),rgba(190,180,255,0) 70%);animation:blobby 22s ease-in-out infinite reverse" />
      <Fx s="position:absolute;top:38%;left:34%;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,rgba(120,232,190,.26),rgba(120,232,190,0) 70%);animation:blobby 26s ease-in-out infinite" />
    </Fx>
  );
}

export async function Shell({
  active,
  children,
  footer = true,
  blobs = true,
}: {
  active: NavKey;
  children: ReactNode;
  footer?: boolean;
  blobs?: boolean;
}) {
  const identity = await currentIdentity();

  return (
    <>
      {/*
       * Keyboard and screen-reader visitors otherwise tab through the whole nav
       * — two menus and twenty-odd links — before reaching the page. Off-screen
       * until focused, so it costs the design nothing.
       */}
      <a className="skip" href="#main">
        Skip to content
      </a>
      {blobs ? <Blobs /> : null}
      <SiteNav active={active} account={identity} />
      <main id="main">{children}</main>
      {footer ? <SiteFooter /> : null}

      {/*
       * One dock owns the bottom-right corner.
       *
       * Back-to-top and the chat launcher used to be positioned independently,
       * which put the button straight through the chat teaser. Stacking them in
       * a single bottom-anchored column makes overlap structurally impossible:
       * whatever either one's height turns out to be, the other is laid out
       * around it.
       */}
      <Fx s="position:fixed;right:22px;bottom:22px;z-index:200;display:flex;flex-direction:column;align-items:flex-end;gap:12px;pointer-events:none">
        <BackToTop />
        <PipWidget signedIn={Boolean(identity)} />
      </Fx>

      <CookieConsent />
      <Reveal />
    </>
  );
}
