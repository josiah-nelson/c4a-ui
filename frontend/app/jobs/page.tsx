'use client';

import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { APIClient } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Job } from '@/types/crawl4ai';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; jobId: string | null }>({
    isOpen: false,
    jobId: null,
  });

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadJobs = async () => {
    try {
      const data = await APIClient.getJobs();
      setJobs(data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteDialog({ isOpen: true, jobId: id });
  };

  const handleDelete = async () => {
    if (!deleteDialog.jobId) return;
    try {
      await APIClient.deleteJob(deleteDialog.jobId);
      setJobs(jobs.filter((j) => j.id !== deleteDialog.jobId));
      if (selectedJob?.id === deleteDialog.jobId) setSelectedJob(null);
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage crawl jobs and their results
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No jobs yet</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(
                            job.status
                          )}`}
                        >
                          {job.status}
                        </span>
                        <span className="text-xs text-gray-500">{job.id}</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {job.config.urls.length} URL(s)
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(job.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(job.id);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              {selectedJob ? (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Job Details</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${getStatusColor(
                          selectedJob.status
                        )}`}
                      >
                        {selectedJob.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">URLs:</span>
                      <ul className="mt-1 text-sm text-gray-600">
                        {selectedJob.config.urls.map((url, i) => (
                          <li key={i} className="truncate">
                            {url}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {selectedJob.error && (
                      <div>
                        <span className="text-sm font-medium text-red-700">Error:</span>
                        <p className="mt-1 text-sm text-red-600">{selectedJob.error}</p>
                      </div>
                    )}
                    {selectedJob.result && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Result:</span>
                        <pre className="mt-1 text-xs text-gray-600 overflow-auto max-h-96 bg-gray-50 p-2 rounded">
                          {JSON.stringify(selectedJob.result, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                  Select a job to view details
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, jobId: null })}
        onConfirm={handleDelete}
        title="Delete Job"
        message="Are you sure you want to delete this job? This action cannot be undone."
        confirmText="Delete"
        isDangerous
      />
    </PageLayout>
  );
}
