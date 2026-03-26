"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function VisaHistoryPage() {
  const params = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/management/employees"
          className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Visa History</h1>
          <p className="text-sm text-gray-500">Employee ID: {params.id}</p>
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-lg border p-6">
        <p className="text-gray-500">Visa history page - Coming soon</p>
      </div>
    </div>
  );
}
