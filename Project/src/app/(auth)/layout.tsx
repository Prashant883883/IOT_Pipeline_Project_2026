import { SkipLink } from '@/components/SkipLink';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipLink />
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
        <main id="main-content" className="sm:mx-auto sm:w-full sm:max-w-md" tabIndex={-1}>
          {children}
        </main>
      </div>
    </>
  );
}
