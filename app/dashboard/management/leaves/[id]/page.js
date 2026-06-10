"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Calendar, FileText, Download } from "lucide-react";
import { leaveService } from "@/app/lib/services/leaveService";
import { useToast } from "@/app/components/Toast";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import { PERMISSIONS } from "@/app/lib/constants/permissions";

export default function LeaveDetailPage() {
  const params = useParams();
  const { error } = useToast();
  const [leave, setLeave] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeave();
  }, [params.id]);

  const fetchLeave = async () => {
    setLoading(true);
    try {
      const [leaveData, docsData] = await Promise.all([
        leaveService.getById(params.id),
        leaveService.getDocuments(params.id)
      ]);
      setLeave(leaveData);
      setDocuments(Array.isArray(docsData) ? docsData : []);
    } catch (err) {
      error("Failed to load leave details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading leave details...</p>
        </div>
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Leave request not found</p>
        <Link href="/dashboard/management/leaves" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Leaves
        </Link>
      </div>
    );
  }

  return (
    <ProtectedRoute permission={PERMISSIONS.LEAVES.VIEW}>
      <div className="space-y-8 pb-12">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/management/leaves" className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Request Details</h1>
            <p className="text-gray-500 text-sm">{leave.employee_name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Leave Type</p>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">
              {leave.leave_type || 'N/A'}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {leave.days || 0} Days
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
              leave.status === 'approved'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : leave.status === 'rejected'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
            }`}>
              {leave.status || 'pending'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Leave Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Employee</p>
              <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                {leave.employee_name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Leave Type</p>
              <p className="text-base font-medium text-gray-900 dark:text-white mt-1 capitalize">
                {leave.leave_type || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
              <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                {leave.start_date || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
              <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                {leave.end_date || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
              <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                {leave.days || 0} Days
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <p className="text-base font-medium text-gray-900 dark:text-white mt-1 capitalize">
                {leave.status || 'pending'}
              </p>
            </div>
            {leave.reason && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Reason</p>
                <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                  {leave.reason}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Proof Documents Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Proof Documents</h2>
          {documents.length === 0 ? (
            <p className="text-sm text-gray-500">No proof documents uploaded.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border border-gray-200 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-800/30">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {doc.file_name || doc.document_name || 'Untitled Document'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {doc.document_type || 'Leave Proof'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await leaveService.downloadDocument(leave.id, doc.id, doc.file_name || doc.document_name);
                      } catch (err) {
                        error("Failed to download document: " + err.message);
                      }
                    }}
                    className="p-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-850 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm flex items-center justify-center"
                    title="Download Document"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
