"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, DollarSign, Calendar, Users } from "lucide-react";
import { payrollService } from "@/app/lib/services/payrollService";
import { useToast } from "@/app/components/Toast";

export default function PayrollDetailPage() {
  const params = useParams();
  const { error } = useToast();
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayroll();
  }, [params.id]);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const data = await payrollService.getById(params.id);
      setPayroll(data);
    } catch (err) {
      error("Failed to load payroll details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading payroll details...</p>
        </div>
      </div>
    );
  }

  if (!payroll) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Payroll not found</p>
        <Link href="/dashboard/management/payroll" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Payroll
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/management/payroll" className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll Details</h1>
          <p className="text-gray-500 text-sm">{payroll.month} {payroll.year}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            AED {payroll.total_amount || '0.00'}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Pay Date</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {payroll.pay_date || 'N/A'}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
            payroll.status === 'paid'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : payroll.status === 'calculated'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
          }`}>
            {payroll.status || 'pending'}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Payroll Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Period</p>
            <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
              {payroll.month} {payroll.year}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pay Date</p>
            <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
              {payroll.pay_date || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
            <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
              AED {payroll.total_amount || '0.00'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
              {payroll.status || 'pending'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
