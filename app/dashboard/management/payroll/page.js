"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  DollarSign, Plus, Search, Eye, Calculator, CheckCircle, Loader2, Calendar, Trash2, Edit
} from "lucide-react";
import { payrollService } from "@/app/lib/services/payrollService";
import { useToast } from "@/app/components/Toast";

export default function PayrollPage() {
  const { success, error } = useToast();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [summary, setSummary] = useState(null);
  
  // Modal states
  const [viewModal, setViewModal] = useState({ isOpen: false, payroll: null });
  const [approveModal, setApproveModal] = useState({ isOpen: false, payroll: null, notes: '' });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, payroll: null, notes: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, payroll: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const payrollData = await payrollService.getAll();
      setPayrolls(Array.isArray(payrollData) ? payrollData : []);
      
      // Calculate summary from payroll data
      if (Array.isArray(payrollData) && payrollData.length > 0) {
        const summaryData = {
          total_payroll: payrollData.reduce((sum, p) => sum + (parseFloat(p.net_payable) || 0), 0),
          total_employees: payrollData.length,
          pending_count: payrollData.filter(p => p.status === 'draft' || p.status === 'pending').length,
        };
        setSummary(summaryData);
      }
    } catch (err) {
      error("Failed to load payroll data");
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async (id) => {
    try {
      await payrollService.calculate(id);
      success("Payroll calculated successfully!");
      fetchData();
    } catch (err) {
      error(err.message || "Failed to calculate payroll");
    }
  };

  const handleMarkAsPaid = async () => {
    if (!approveModal.payroll) return;
    
    try {
      await payrollService.markAsPaid(approveModal.payroll.id);
      success("Payroll marked as paid!");
      setApproveModal({ isOpen: false, payroll: null, notes: '' });
      fetchData();
    } catch (err) {
      error(err.message || "Failed to mark payroll as paid");
    }
  };

  const handleReject = async () => {
    if (!rejectModal.payroll) return;
    
    try {
      // You can add reject API call here if backend supports it
      success("Payroll rejected!");
      setRejectModal({ isOpen: false, payroll: null, notes: '' });
      fetchData();
    } catch (err) {
      error(err.message || "Failed to reject payroll");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.payroll) return;
    
    try {
      await payrollService.delete(deleteModal.payroll.id);
      success("Payroll deleted successfully!");
      setDeleteModal({ isOpen: false, payroll: null });
      fetchData();
    } catch (err) {
      error(err.message || "Failed to delete payroll");
    }
  };

  const filteredPayrolls = payrolls.filter(payroll => {
    const searchLower = searchTerm.toLowerCase();
    const employeeName = `${payroll.employee?.first_name || ''} ${payroll.employee?.last_name || ''}`.toLowerCase();
    const branchName = payroll.branch?.branch_name?.toLowerCase() || '';
    const monthStr = payroll.month?.toString() || '';
    const yearStr = payroll.year?.toString() || '';
    const statusStr = payroll.status?.toLowerCase() || '';
    
    return (
      employeeName.includes(searchLower) ||
      branchName.includes(searchLower) ||
      monthStr.includes(searchTerm) ||
      yearStr.includes(searchTerm) ||
      statusStr.includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading payroll...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage employee payroll and salaries
          </p>
        </div>
        <Link
          href="/dashboard/management/payroll/prepare"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Prepare Payroll
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by month, year, or status..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Payroll</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{payrolls.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Paid</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {payrolls.filter(p => p.status === 'paid').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {payrolls.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        {filteredPayrolls.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                {filteredPayrolls.map((payroll) => (
                  <tr key={payroll.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {payroll.month} {payroll.year}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        AED {payroll.total_amount || '0.00'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        payroll.status === 'paid'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : payroll.status === 'calculated'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                        {payroll.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/management/payroll/${payroll.id}`}
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </Link>
                        <Link
                          href={`/dashboard/management/payroll/edit/${payroll.id}`}
                          className="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors group"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-400 group-hover:text-yellow-600" />
                        </Link>
                        {payroll.status === 'pending' && (
                          <button
                            onClick={() => handleCalculate(payroll.id)}
                            className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors group"
                            title="Calculate"
                          >
                            <Calculator className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                          </button>
                        )}
                        {payroll.status === 'calculated' && (
                          <button
                            onClick={() => handleMarkAsPaid(payroll.id)}
                            className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors group"
                            title="Mark as Paid"
                          >
                            <CheckCircle className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(payroll.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              {searchTerm ? "No payroll found matching your search" : "No payroll records yet"}
            </p>
            {!searchTerm && (
              <Link
                href="/dashboard/management/payroll/prepare"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Prepare First Payroll
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
