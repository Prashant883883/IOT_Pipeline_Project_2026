import { z } from 'zod';
import { ALL_STATUSES } from './constants';

// Company Registration Validation
export const companyRegistrationSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  industry: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  contactPerson: z.string().optional(),
});

export type CompanyRegistrationInput = z.infer<typeof companyRegistrationSchema>;

// Login Validation
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Application Status Update Validation
export const statusUpdateSchema = z.object({
  status: z.enum(ALL_STATUSES as [string, ...string[]]),
  notes: z.string().optional(),
});

export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;

// Recruiter Note Validation
export const recruiterNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
});

export type RecruiterNoteInput = z.infer<typeof recruiterNoteSchema>;

// Proposal Search/Filters Validation
export const proposalFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(ALL_STATUSES as [string, ...string[]]).optional(),
  sortBy: z.enum(['submittedAt', 'studentName', 'title']).default('submittedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
});

export type ProposalFiltersInput = z.infer<typeof proposalFiltersSchema>;

// Request Info Validation (alternative to status change)
export const requestInfoSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

export type RequestInfoInput = z.infer<typeof requestInfoSchema>;
