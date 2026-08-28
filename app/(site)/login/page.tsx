import type { Metadata } from 'next';

import { LoginView } from '@/components/site/login/LoginView';
import { Shell } from '@/components/site/Shell';
import { currentViewer } from '@/lib/auth';
import { safeRedirect } from '@/lib/redirect-target';
import { routes } from '@/lib/routes';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to track your orders, product trials and the thread you have with us.',
  robots: { index: false, follow: false },
};

/** The session cookie makes every render of this page visitor-specific. */
export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [viewer, params] = await Promise.all([currentViewer(), searchParams]);

  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  return (
    <Shell active="login" footer={false}>
      <LoginView
        viewer={viewer ? { name: viewer.name, email: viewer.email, role: viewer.role } : null}
        next={safeRedirect(first(params.next), routes.dashboard)}
        googleEnabled={process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED !== 'false'}
        linkError={first(params.error)}
      />
    </Shell>
  );
}
