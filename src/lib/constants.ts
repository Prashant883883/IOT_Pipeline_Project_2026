// Application Status Constants
// These are used throughout the app instead of Prisma enums
// SQLite does not support enum types

export const ApplicationStatus = {
  NEW: 'NEW',
  UNDER_REVIEW: 'UNDER_REVIEW',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW: 'INTERVIEW',
  SELECTED: 'SELECTED',
  REJECTED: 'REJECTED',
  REQUEST_INFO: 'REQUEST_INFO',
} as const;

export type ApplicationStatusType = typeof ApplicationStatus[keyof typeof ApplicationStatus];

// Array of all statuses for iteration
export const ALL_STATUSES: ApplicationStatusType[] = [
  'NEW',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'SELECTED',
  'REJECTED',
  'REQUEST_INFO',
];

// Status display labels
export const STATUS_LABELS: Record<ApplicationStatusType, string> = {
  NEW: 'New',
  UNDER_REVIEW: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview',
  SELECTED: 'Selected',
  REJECTED: 'Rejected',
  REQUEST_INFO: 'Request Info',
};

// Status colors for UI
export const STATUS_COLORS: Record<ApplicationStatusType, { bg: string; text: string; border: string }> = {
  NEW: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  UNDER_REVIEW: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  SHORTLISTED: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  INTERVIEW: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  SELECTED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  REJECTED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  REQUEST_INFO: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
};

// Pipeline columns order
export const PIPELINE_COLUMNS: ApplicationStatusType[] = [
  'NEW',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'SELECTED',
];

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
};

// JWT constants
export const JWT_COOKIE_NAME = 'rdi-session';
export const JWT_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
