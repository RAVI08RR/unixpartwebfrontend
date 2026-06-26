'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable server-side Pagination component.
 * 
 * Props:
 *   currentPage  {number}   - Active page (1-indexed)
 *   totalPages   {number}   - Total number of pages from backend
 *   total        {number}   - Total record count from backend
 *   pageSize     {number}   - Items per page
 *   onPageChange {Function} - Called with the new page number
 */
export default function Pagination({ currentPage, totalPages, total, pageSize, onPageChange }) {
  const current = Number(currentPage) || 1;
  const totalP = Number(totalPages) || 1;

  if (totalP <= 0) return null;

  const startItem = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const endItem = Math.min(current * pageSize, total);

  // Build smart page number list with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2; // pages around current

    if (totalP <= 7) {
      // Show all pages
      for (let i = 1; i <= totalP; i++) pages.push(i);
      return pages;
    }

    // Always show first page
    pages.push(1);

    const leftEdge = Math.max(2, current - delta);
    const rightEdge = Math.min(totalP - 1, current + delta);

    if (leftEdge > 2) pages.push('...');

    for (let i = leftEdge; i <= rightEdge; i++) pages.push(i);

    if (rightEdge < totalP - 1) pages.push('...');

    // Always show last page
    pages.push(totalP);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="px-6 sm:px-8 py-5 bg-gray-50/50 dark:bg-zinc-800/20 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Entry count */}
      <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
        {total === 0 ? (
          <span>No entries found</span>
        ) : (
          <>
            Showing{' '}
            <span className="text-gray-900 dark:text-white font-black">{startItem}</span>
            {' '}to{' '}
            <span className="text-gray-900 dark:text-white font-black">{endItem}</span>
            {' '}of{' '}
            <span className="text-gray-900 dark:text-white font-black">{total}</span>
            {' '}entries
          </>
        )}
      </p>

      {/* Page buttons */}
      {totalP > 1 && (
        <div className="flex items-center gap-2">
          {/* Previous */}
          <button
            onClick={() => onPageChange(current - 1)}
            disabled={current === 1}
            className="px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-bold text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Page numbers */}
          <div className="hidden sm:flex items-center gap-1">
            {pageNumbers.map((page, idx) =>
              page === '...' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-9 h-9 flex items-center justify-center text-sm font-bold text-gray-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-9 h-9 rounded-xl text-sm font-black transition-all ${
                    current === page
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          {/* Mobile: current / total indicator */}
          <span className="sm:hidden text-sm font-bold text-gray-500 dark:text-gray-400 px-2">
            {current} / {totalP}
          </span>

          {/* Next */}
          <button
            onClick={() => onPageChange(current + 1)}
            disabled={current === totalP}
            className="px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-bold text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
