import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { DashboardNav } from '@/components/DashboardNav';
import { SkipLink } from '@/components/SkipLink';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <>
      <SkipLink />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <DashboardNav user={session} />
        <main id="main-content" className="py-8 md:py-12" tabIndex={-1}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
