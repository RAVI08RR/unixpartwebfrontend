"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Receipt, X, Calendar, FileText, DollarSign, Truck, Tag, FileType } from "lucide-react";
import Link from "next/link";
import { expenseService } from "@/app/lib/services/expenseService";
import { useToast } from "@/app/components/Toast";

export default function ViewExpensePage({ params }) {
  const router = useRouter();
  const [fetching, setFetching] = useState(true);
  const [expenseId, setExpenseId] = useState(null);
  const { error: showError } = useToast();
  
  const [expenseData, setExpenseData] = useState({
    expense_id: "",
    date: "",
    description: "",
    type: "",
    category: "",
    supplier_code: "",
    amount: "",
    document: "",
  });

  useEffect(() => {
    Promise.resolve(params).then((resolvedParams) => {
      setExpenseId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!expenseId) return;

    const fetchExpense = async () => {
      try {
        setFetching(true);
        const data = await expenseService.getById(expenseId);
        
        setExpenseData({
          expense_id: data.expense_id || `EXP-${data.id}`,
          date: data.date ? data.date.split('T')[0] : "",
          description: data.description || "",
          type: data.type || "",
          category: data.category || "",
          supplier_code: data.supplier_code || "N/A",
          amount: data.amount || "",
          document: data.document || "N/A",
        });
      } catch (err) {
        console.error("Failed to fetch expense:", err);
        showError("Failed to load expense data");
      } finally {
        setFetching(false);
      }
    };

    fetchExpense();
  }, [expenseId]);

  const formatCurrency = (amount) => {
    return `AED ${parseFloat(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-black text-xs uppercase tracking-[0.2em]">Loading expense...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/finance/expenses"
          className="flex items-center justify-center w-10 h-10 rounded-[15px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black dark:text-white tracking-tight">View Expense</h1>
          <p className="text-gray-500 dark:text-zinc-500 text-sm font-medium">Expense details - {expenseData.expense_id}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Expense Information</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Read-only view of expense details</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Expense ID */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Expense ID
              </label>
              <div className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold">
                {expenseData.expense_id}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </label>
                <div className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold">
                  {formatDate(expenseData.date)}
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Amount
                </label>
                <div className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-black text-gray-900 dark:text-white">
                  {formatCurrency(expenseData.amount)}
                </div>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FileType className="w-4 h-4" />
                  Type
                </label>
                <div className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold">
                  {expenseData.type || '-'}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Category
                </label>
                <div className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold">
                  {expenseData.category || '-'}
                </div>
              </div>

              {/* Supplier */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Supplier Code
                </label>
                <div className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold">
                  {expenseData.supplier_code}
                </div>
              </div>

              {/* Document */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Document Reference
                </label>
                <div className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold">
                  {expenseData.document}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Description
              </label>
              <div className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold min-h-[100px] whitespace-pre-wrap">
                {expenseData.description || '-'}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-zinc-800">
              <Link
                href={`/dashboard/finance/expenses/edit/${expenseId}`}
                className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-lg shadow-black/10 hover:opacity-90 active:scale-95 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Edit Expense</span>
              </Link>
              
              <Link
                href="/dashboard/finance/expenses"
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
