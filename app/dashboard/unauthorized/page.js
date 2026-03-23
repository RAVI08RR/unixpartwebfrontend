/**
 * Unauthorized Page
 * Shown when user tries to access a page without permission
 */

'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { usePermission } from '@/app/lib/hooks/usePermission';

export default function UnauthorizedPage() {
  const { getUserRole } = usePermission();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Your current role: <span className="font-medium text-gray-700 dark:text-gray-300">{getUserRole()}</span>
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            If you believe this is an error, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
