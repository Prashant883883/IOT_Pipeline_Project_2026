'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  PIPELINE_COLUMNS,
  STATUS_LABELS,
  ApplicationStatusType,
} from '@/lib/constants';
import { safeJsonParse, formatDate } from '@/lib/utils';

interface Application {
  id: string;
  currentStatus: ApplicationStatusType;
  updatedAt: string;
  proposal: {
    id: string;
    title: string;
    skills: string[];
  };
  student: {
    id: string;
    name: string;
    email: string;
    skills: string[];
  };
  _count: {
    recruiterNotes: number;
  };
}

interface PipelineColumn {
  status: ApplicationStatusType;
  count: number;
  applications: Application[];
}

const statusFlow: ApplicationStatusType[] = [
  'NEW',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'SELECTED',
];

export default function PipelinePage() {
  const [pipeline, setPipeline] = useState<PipelineColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    applicationId: string | null;
    newStatus: ApplicationStatusType | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    applicationId: null,
    newStatus: null,
    title: '',
    message: '',
  });

  const fetchPipeline = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/pipeline');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch pipeline');
      }

      setPipeline(data.data.pipeline);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatusType) => {
    setIsUpdating(applicationId);

    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update status');
      }

      await fetchPipeline();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsUpdating(null);
      setConfirmDialog({
        isOpen: false,
        applicationId: null,
        newStatus: null,
        title: '',
        message: '',
      });
    }
  };

  const openConfirmDialog = (applicationId: string, newStatus: ApplicationStatusType) => {
    setConfirmDialog({
      isOpen: true,
      applicationId,
      newStatus,
      title: `Move to ${STATUS_LABELS[newStatus]}`,
      message: `Are you sure you want to move this candidate to "${STATUS_LABELS[newStatus]}"?`,
    });
  };

  const handleConfirmAction = () => {
    if (confirmDialog.applicationId && confirmDialog.newStatus) {
      handleStatusChange(confirmDialog.applicationId, confirmDialog.newStatus);
    }
  };

  const getNextStatus = (currentStatus: ApplicationStatusType): ApplicationStatusType | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  const getPrevStatus = (currentStatus: ApplicationStatusType): ApplicationStatusType | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex > 0) {
      return statusFlow[currentIndex - 1];
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <>
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="warning"
        onConfirm={handleConfirmAction}
        onCancel={() =>
          setConfirmDialog({
            isOpen: false,
            applicationId: null,
            newStatus: null,
            title: '',
            message: '',
          })
        }
      />

      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Pipeline Board
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track candidates through the recruitment process
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {/* Pipeline Board */}
      <div className="overflow-x-auto">
        <div className="flex space-x-4 min-w-max pb-4">
          {pipeline.map((column) => (
            <div
              key={column.status}
              className="w-80 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* Column Header */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-100 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {STATUS_LABELS[column.status]}
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {column.count}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div className="p-3 space-y-3 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto">
                {column.applications.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No candidates
                  </div>
                ) : (
                  column.applications.map((application) => (
                    <div
                      key={application.id}
                      className="bg-white p-4 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-2">
                        <Link
                          href={`/proposals/${application.id}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-500 line-clamp-2"
                        >
                          {application.proposal.title}
                        </Link>
                        {application._count.recruiterNotes > 0 && (
                          <span className="ml-2 flex-shrink-0 inline-flex items-center text-xs text-gray-500">
                            <svg
                              className="mr-1 h-3 w-3"
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

                      {/* Candidate Info */}
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <svg
                          className="mr-1.5 h-4 w-4 text-gray-400"
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
                        {application.student.name}
                      </div>

                      {/* Skills */}
                      {application.student.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {application.student.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                            >
                              {skill}
                            </span>
                          ))}
                          {application.student.skills.length > 3 && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-400">
                              +{application.student.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-2 border-t border-gray-100">
                        {getPrevStatus(column.status) && column.status !== 'REJECTED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() =>
                              openConfirmDialog(
                                application.id,
                                getPrevStatus(column.status)!
                              )
                            }
                            disabled={isUpdating === application.id}
                          >
                            ← {STATUS_LABELS[getPrevStatus(column.status)!]}
                          </Button>
                        )}
                        {getNextStatus(column.status) && column.status !== 'REJECTED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() =>
                              openConfirmDialog(
                                application.id,
                                getNextStatus(column.status)!
                              )
                            }
                            disabled={isUpdating === application.id}
                          >
                            {STATUS_LABELS[getNextStatus(column.status)!]} →
                          </Button>
                        )}
                        {column.status === 'REJECTED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => openConfirmDialog(application.id, 'NEW')}
                            disabled={isUpdating === application.id}
                          >
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Status Legend</h3>
        <div className="flex flex-wrap gap-4">
          {PIPELINE_COLUMNS.map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <StatusBadge status={status} />
              <span className="text-sm text-gray-600">
                {status === 'NEW' && 'New applications'}
                {status === 'UNDER_REVIEW' && 'Being reviewed'}
                {status === 'SHORTLISTED' && 'Promising candidates'}
                {status === 'INTERVIEW' && 'Interview stage'}
                {status === 'SELECTED' && 'Hired candidates'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
