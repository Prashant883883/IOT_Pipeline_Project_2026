import Link from 'next/link';
import { Button } from '@/components/Button';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                RDI Recruiter
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Sign in
              </Link>
              <Link href="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-20">
          <div className="inline-block mb-4 px-4 py-2 bg-primary-100 rounded-full">
            <span className="text-sm font-semibold text-primary-700">✨ AI-Powered Recruitment</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
            Streamline Your
            <span className="block bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mt-2">
              Recruitment Process
            </span>
          </h1>
          <p className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
            Leverage machine learning and advanced analytics to find, evaluate, and hire the best talent. 
            Manage student proposals, track candidates through your pipeline, and make data-driven hiring decisions.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">Create company account</Button>
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold leading-6 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign in <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100/50 hover:border-primary-200">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="h-12 w-12 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="h-6 w-6 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🎯 Smart Proposal Matching
              </h3>
              <p className="text-gray-600">
                AI-powered skill matching algorithm identifies the best candidates instantly. 
                Review detailed applications with comprehensive skills analysis.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100/50 hover:border-primary-200">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="h-12 w-12 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="h-6 w-6 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📊 Visual Pipeline Board
              </h3>
              <p className="text-gray-600">
                Kanban-style board for intuitive candidate tracking through every recruitment stage. 
                Drag, drop, and manage your entire hiring funnel.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100/50 hover:border-primary-200">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="h-12 w-12 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="h-6 w-6 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📝 Intelligent Insights
              </h3>
              <p className="text-gray-600">
                ML-driven analytics reveal hiring trends, skill demand patterns, and recruitment health metrics. 
                Make data-informed decisions instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Features Row */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 bg-white rounded-lg p-6 border border-gray-100/50">
            <span className="text-3xl">⚡</span>
            <div>
              <h4 className="font-semibold text-gray-900">Anomaly Detection</h4>
              <p className="text-sm text-gray-600">Spot unusual hiring patterns</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white rounded-lg p-6 border border-gray-100/50">
            <span className="text-3xl">📈</span>
            <div>
              <h4 className="font-semibold text-gray-900">Forecasting</h4>
              <p className="text-sm text-gray-600">Predict future hiring needs</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white rounded-lg p-6 border border-gray-100/50">
            <span className="text-3xl">🔐</span>
            <div>
              <h4 className="font-semibold text-gray-900">Secure & Private</h4>
              <p className="text-sm text-gray-600">Your data always protected</p>
            </div>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-24 bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-100 p-8 md:p-12 shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Try it out with demo data
            </h2>
            <p className="text-gray-600 mb-8">
              Explore the platform with pre-populated sample data. See how the ML analytics work.
            </p>
            <div className="inline-flex flex-col sm:flex-row items-center gap-6 bg-white rounded-xl px-8 py-6 border border-gray-200/50">
              <div className="text-left">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                <p className="font-mono text-sm font-semibold text-gray-900 mt-1">recruiter@techcorp.com</p>
              </div>
              <div className="hidden sm:block w-px h-8 bg-gray-300" />
              <div className="text-left">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Password</p>
                <p className="font-mono text-sm font-semibold text-gray-900 mt-1">password123</p>
              </div>
            </div>
            <div className="mt-8">
              <Link href="/login">
                <Button size="lg">Sign in with demo account</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/5 border-t border-gray-200/20 mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">About</h3>
              <p className="text-sm text-gray-600">
                RDI Recruiter is an AI-powered recruitment platform designed to streamline hiring processes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Smart Matching</li>
                <li>• ML Analytics</li>
                <li>• Pipeline Management</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Built With</h3>
              <p className="text-sm text-gray-600">
                Next.js • TypeScript • Prisma • TensorFlow.js • Tailwind CSS
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200/20 pt-8">
            <p className="text-center text-sm text-gray-500">
              © 2026 RDI Recruiter Module. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
