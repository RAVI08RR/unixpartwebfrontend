"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ViewExpensePage() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-in fade-in duration-500 px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/finance/expenses" 
          className="flex items-center justify-center w-10 h-10 rounded-[15px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black dark:text-white tracking-tight">View Expense</h1>
          <p className="text-gray-500 dark:text-zinc-500 text-sm font-medium">Expense details</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm p-6">
        <p className="text-gray-500 dark:text-gray-400">Expense details view coming soon...</p>
      </div>
    </div>
  );
}
