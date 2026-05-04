'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { Textarea } from '@/components/Textarea';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  ApplicationStatus,
  ApplicationStatusType,
  STATUS_LABELS,
  STATUS_COLORS,
} from '@/lib/constants';
import { safeJsonParse, formatDate, formatDateTime } from '@/lib/utils';

interface StatusHistory {
  id: string;
  status: ApplicationStatusType;
  notes: string | null;
  createdAt: string;
}

interface RecruiterNote {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Application {
  id: string;
  currentStatus: ApplicationStatusType;
  submittedAt: string;
  updatedAt: string;
  proposal: {
    id: string;
    title: string;
    summary: string;
    description: string;
    attachmentUrl: string | null;
    skills: string[];
    student: {
      id: string;
      name: string;
      email: string;
      skills: string[];
      bio: string | null;
    };
  };
  statusHistory: StatusHistory[];
  recruiterNotes: RecruiterNote[];
}

const statusFlow: ApplicationStatusType[] = [
  'NEW',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'SELECTED',
];

export default function ProposalDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Note states
  const [newNote, setNewNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: ApplicationStatusType | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    action: null,
    title: '',
    message: '',
  });

  const fetchApplication = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/proposals/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch proposal');
      }

      setApplication(data.data.application);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleStatusChange = async (newStatus: ApplicationStatusType, notes?: string) => {
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update status');
      }

      await fetchApplication();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsUpdating(false);
      setConfirmDialog({ isOpen: false, action: null, title: '', message: '' });
    }
  };

  const openConfirmDialog = (status: ApplicationStatusType) => {
    const titles: Record<ApplicationStatusType, string> = {
      NEW: 'Move to New',
      UNDER_REVIEW: 'Move to Under Review',
      SHORTLISTED: 'Shortlist Candidate',
      INTERVIEW: 'Move to Interview',
      SELECTED: 'Select Candidate',
      REJECTED: 'Reject Application',
      REQUEST_INFO: 'Request Information',
    };

    const messages: Record<ApplicationStatusType, string> = {
      NEW: 'Are you sure you want to move this application back to "New"?',
      UNDER_REVIEW: 'Are you sure you want to move this application to "Under Review"?',
      SHORTLISTED: 'Are you sure you want to shortlist this candidate?',
      INTERVIEW: 'Are you sure you want to move this candidate to the interview stage?',
      SELECTED: 'Are you sure you want to select this candidate? This is a final decision.',
      REJECTED: 'Are you sure you want to reject this application? This action cannot be undone easily.',
      REQUEST_INFO: 'Are you sure you want to request additional information?',
    };

    setConfirmDialog({
      isOpen: true,
      action: status,
      title: titles[status],
      message: messages[status],
    });
  };

  const handleConfirmAction = () => {
    if (confirmDialog.action) {
      handleStatusChange(confirmDialog.action);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsSavingNote(true);

    try {
      const response = await fetch('/api/recruiter-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote, applicationId: id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add note');
      }

      setNewNote('');
      await fetchApplication();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editingNoteContent.trim()) return;

    try {
      const response = await fetch(`/api/recruiter-notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingNoteContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update note');
      }

      setEditingNoteId(null);
      setEditingNoteContent('');
      await fetchApplication();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`/api/recruiter-notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete note');
      }

      await fetchApplication();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const startEditingNote = (note: RecruiterNote) => {
    setEditingNoteId(note.id);
    setEditingNoteContent(note.content);
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditingNoteContent('');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="space-y-4">
        <Alert variant="error">{error || 'Application not found'}</Alert>
        <Link href="/proposals">
          <Button variant="secondary">Back to Proposals</Button>
        </Link>
      </div>
    );
  }

  const currentStatusIndex = statusFlow.indexOf(application.currentStatus);
  const canMoveNext = currentStatusIndex < statusFlow.length - 1;
  const canMovePrev = currentStatusIndex > 0;

  return (
    <>
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.action === 'REJECTED' ? 'danger' : 'warning'}
        confirmLabel={confirmDialog.action === 'REJECTED' ? 'Reject' : 'Confirm'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialog({ isOpen: false, action: null, title: '', message: '' })}
      />

      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/proposals"
          className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
        >
          ← Back to proposals
        </Link>
      </div>

      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{application.proposal.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Submitted by {application.proposal.student.name} on {formatDate(application.submittedAt)}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <StatusBadge status={application.currentStatus} />
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Proposal Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Proposal Details</h2>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <p className="text-sm text-gray-600 mb-4">{application.proposal.summary}</p>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{application.proposal.description}</p>
              </div>
              {application.proposal.attachmentUrl && (
                <div className="mt-4">
                  <a
                    href={application.proposal.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
                  >
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0118 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    View Attachment
                  </a>
                </div>
              )}
              {application.proposal.skills.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {application.proposal.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Student Profile */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Student Profile</h2>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-lg font-medium text-primary-700">
                    {application.proposal.student.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{application.proposal.student.name}</h3>
                  <p className="text-sm text-gray-500">{application.proposal.student.email}</p>
                </div>
              </div>
              {application.proposal.student.bio && (
                <p className="mt-4 text-sm text-gray-600">{application.proposal.student.bio}</p>
              )}
              {application.proposal.student.skills.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {application.proposal.student.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Status History</h2>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <div className="flow-root">
                <ul role="list" className="-mb-8">
                  {application.statusHistory.map((history, index) => (
                    <li key={history.id}>
                      <div className="relative pb-8">
                        {index !== application.statusHistory.length - 1 && (
                          <span
                            className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span
                              className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                STATUS_COLORS[history.status].bg
                              }`}
                            >
                              <span className={`text-xs font-medium ${STATUS_COLORS[history.status].text}`}>
                                {STATUS_LABELS[history.status].charAt(0)}
                              </span>
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm text-gray-900">
                                Changed to <StatusBadge status={history.status} />
                              </p>
                              {history.notes && (
                                <p className="mt-1 text-sm text-gray-500">{history.notes}</p>
                              )}
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500">
                              {formatDateTime(history.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Actions</h2>
            </div>
            <div className="px-4 py-5 sm:px-6 space-y-3">
              {application.currentStatus !== 'SELECTED' && application.currentStatus !== 'REJECTED' && (
                <>
                  {canMoveNext && (
                    <Button
                      onClick={() => openConfirmDialog(statusFlow[currentStatusIndex + 1])}
                      isLoading={isUpdating}
                      disabled={isUpdating}
                      fullWidth
                    >
                      Move to {STATUS_LABELS[statusFlow[currentStatusIndex + 1]]}
                    </Button>
                  )}

                  <Button
                    variant="secondary"
                    onClick={() => openConfirmDialog('SHORTLISTED')}
                    isLoading={isUpdating}
                    disabled={isUpdating || application.currentStatus === 'SHORTLISTED'}
                    fullWidth
                  >
                    Shortlist
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => openConfirmDialog('INTERVIEW')}
                    isLoading={isUpdating}
                    disabled={isUpdating || application.currentStatus === 'INTERVIEW'}
                    fullWidth
                  >
                    Move to Interview
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => openConfirmDialog('SELECTED')}
                    isLoading={isUpdating}
                    disabled={isUpdating}
                    fullWidth
                  >
                    Select Candidate
                  </Button>

                  <hr className="border-gray-200" />

                  <Button
                    variant="ghost"
                    onClick={() => openConfirmDialog('REQUEST_INFO')}
                    isLoading={isUpdating}
                    disabled={isUpdating}
                    fullWidth
                  >
                    Request Information
                  </Button>

                  <Button
                    variant="danger"
                    onClick={() => openConfirmDialog('REJECTED')}
                    isLoading={isUpdating}
                    disabled={isUpdating}
                    fullWidth
                  >
                    Reject Application
                  </Button>
                </>
              )}

              {application.currentStatus === 'SELECTED' && (
                <div className="text-center py-4">
                  <svg
                    className="mx-auto h-12 w-12 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-gray-900">Candidate Selected</p>
                  <p className="text-sm text-gray-500">This candidate has been selected.</p>
                </div>
              )}

              {application.currentStatus === 'REJECTED' && (
                <div className="text-center py-4">
                  <svg
                    className="mx-auto h-12 w-12 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-gray-900">Application Rejected</p>
                  <p className="text-sm text-gray-500">This application has been rejected.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recruiter Notes */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Private Notes</h2>
              <p className="text-sm text-gray-500">Only visible to your team</p>
            </div>
            <div className="px-4 py-5 sm:px-6">
              {/* Add new note */}
              <div className="mb-4">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  rows={3}
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    isLoading={isSavingNote}
                    disabled={isSavingNote || !newNote.trim()}
                  >
                    Add Note
                  </Button>
                </div>
              </div>

              {/* Notes list */}
              <div className="space-y-4">
                {application.recruiterNotes.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No notes yet</p>
                ) : (
                  application.recruiterNotes.map((note) => (
                    <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                      {editingNoteId === note.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingNoteContent}
                            onChange={(e) => setEditingNoteContent(e.target.value)}
                            rows={3}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button size="sm" variant="ghost" onClick={cancelEditingNote}>
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateNote(note.id)}
                              disabled={!editingNoteContent.trim()}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-700">{note.content}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatDateTime(note.createdAt)}
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => startEditingNote(note)}
                                className="text-xs text-primary-600 hover:text-primary-500"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="text-xs text-red-600 hover:text-red-500"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
