"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Calendar, FileText } from "lucide-react";
import { leaveService } from "@/app/lib/services/leaveService";
import { useToast } from "@/app/components/Toast";

export default function LeaveDetailPage() {
  const params = useParams();
  const { error } = useToast();
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeave();
  }, [params.id]);

  const fetchLeave = async () => {
    setLoading(true);
    try {
      // Note: You'll need to add getById to leaveService
      const data = await leaveService.getAll();
      const record = data.find(l => l.id === parseInt(params.id));
      setLeave(record);
    } catch (err) {
      error("Failed to load leave details");
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
    </div>
  );
}
