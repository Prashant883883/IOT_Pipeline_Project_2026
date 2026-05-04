'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { StatusBadge } from '@/components/StatusBadge';
import { Pagination } from '@/components/Pagination';
import { ALL_STATUSES, STATUS_LABELS, ApplicationStatusType, PAGINATION } from '@/lib/constants';
import { safeJsonParse, formatDate } from '@/lib/utils';

interface Application {
  id: string;
  currentStatus: ApplicationStatusType;
  submittedAt: string;
  updatedAt: string;
  proposal: {
    id: string;
    title: string;
    summary: string;
    skills: string[];
    student: {
      id: string;
      name: string;
      email: string;
      skills: string[];
    };
  };
  _count: {
    recruiterNotes: number;
  };
}

interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  ...ALL_STATUSES.map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  })),
];

const sortOptions = [
  { value: 'submittedAt', label: 'Submitted Date' },
  { value: 'studentName', label: 'Student Name' },
  { value: 'title', label: 'Proposal Title' },
];

const sortOrderOptions = [
  { value: 'desc', label: 'Newest First' },
  { value: 'asc', label: 'Oldest First' },
];

export default function ProposalsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || '';
  const initialSortBy = (searchParams.get('sortBy') as 'submittedAt' | 'studentName' | 'title') || 'submittedAt';
  const initialSortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: initialPage,
    limit: PAGINATION.DEFAULT_LIMIT,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [scores, setScores] = useState<Record<string, number>>({});

  // Filter and sort state
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [sortBy, setSortBy] = useState<'submittedAt' | 'studentName' | 'title'>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchScores = useCallback(async (apps: Application[]) => {
    const newScores: Record<string, number> = {};
    for (const app of apps) {
      const text = `${app.proposal.title} ${app.proposal.summary}`;
      try {
        const response = await fetch('/api/ml/score-proposal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (response.ok) {
          const data = await response.json();
          newScores[app.proposal.id] = data.score;
        }
      } catch (err) {
        console.error('Failed to fetch score for', app.proposal.id, err);
      }
    }
    setScores(newScores);
  }, []);

  // Fetch applications when filters/sort/pagination changes
  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      setError('');

      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (status) params.set('status', status);
        params.set('sortBy', sortBy);
        params.set('sortOrder', sortOrder);
        params.set('page', pagination.page.toString());
        params.set('limit', pagination.limit.toString());

        const response = await fetch(`/api/proposals?${params.toString()}`);
        const data = await response.json();

        if (response.status === 401) {
          // Not authenticated, redirect to login
          router.push('/login');
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch proposals');
        }

        setApplications(data.data.applications);
        setPagination(data.data.pagination);

        // Fetch ML scores for proposals
        fetchScores(data.data.applications);

        // Update URL without page reload
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [debouncedSearch, status, sortBy, sortOrder, pagination.page, pagination.limit, fetchScores, router]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setSortBy('submittedAt');
    setSortOrder('desc');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasFilters = search || status || sortBy !== 'submittedAt' || sortOrder !== 'desc';

  return (
    <>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Student Proposals
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage student applications
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, skills, or title..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border px-3 py-2"
            />
          </div>

          <Select
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            options={statusOptions}
          />

          <Select
            label="Sort By"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'submittedAt' | 'studentName' | 'title')}
            options={sortOptions}
          />

          <Select
            label="Order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            options={sortOrderOptions}
          />
        </div>

        {hasFilters && (
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {/* Results Summary */}
      {!isLoading && applications.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            Showing <span className="font-semibold">{applications.length}</span> of{' '}
            <span className="font-semibold">{pagination.totalCount}</span> total applications
            {hasFilters && ' (filtered)'}
          </p>
        </div>
      )}

      {/* Results */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No proposals found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {hasFilters
                ? 'Try adjusting your filters to see more results.'
                : 'No applications have been submitted yet.'}
            </p>
            {hasFilters && (
              <div className="mt-6">
                <Button variant="secondary" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <ul role="list" className="divide-y divide-gray-200">
                {applications.map((application) => (
                  <li key={application.id}>
                    <Link
                      href={`/proposals/${application.id}`}
                      className="block hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-primary-600 truncate">
                              {application.proposal.title}
                            </p>
                            {application._count.recruiterNotes > 0 && (
                              <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                                <svg
                                  className="mr-1 h-3 w-3 text-gray-500"
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
                                {application._count.recruiterNotes}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center">
                            <StatusBadge status={application.currentStatus} />
                          </div>
                        </div>

                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <svg
                                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                />
                              </svg>
                              {application.proposal.student.name}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <svg
                              className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                              />
                            </svg>
                            <p>Submitted {formatDate(application.submittedAt)}</p>
                          </div>
                        </div>

                        <div className="mt-2">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {application.proposal.summary}
                          </p>
                        </div>

                        <div className="mt-2 text-sm text-gray-500">
                          ML Score: {scores[application.proposal.id] !== undefined ? scores[application.proposal.id].toFixed(1) + '%' : 'Calculating...'}
                        </div>

                        {application.proposal.skills.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {application.proposal.skills.slice(0, 5).map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                              >
                                {skill}
                              </span>
                            ))}
                            {application.proposal.skills.length > 5 && (
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                                +{application.proposal.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  totalItems={pagination.totalCount}
                  itemsPerPage={pagination.limit}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
