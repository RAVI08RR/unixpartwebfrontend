import { useState, useEffect, useCallback } from 'react';
import { branchService } from '../services/branchService';

export function useBranches(page = 1, page_size = 10, isDropdown = false) {
  const [result, setResult] = useState({ data: [], total: 0, total_pages: 1, page: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const fetchBranches = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const data = isDropdown
        ? await branchService.getDropdown()
        : await branchService.getAll(page, page_size);

      if (isDropdown) {
        const arr = Array.isArray(data) ? data : (data?.data || []);
        setResult({ data: arr, total: arr.length, total_pages: 1, page: 1 });
      } else {
        setResult(data || { data: [], total: 0, total_pages: 1, page });
      }
    } catch (err) {
      console.error('useBranches fetch error:', err);
      setIsError(true);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, page_size, isDropdown]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  return {
    branches: result.data || [],
    total: result.total || 0,
    totalPages: result.total_pages || 1,
    currentPage: result.page || page,
    isLoading,
    isError,
    error,
    mutate: fetchBranches,
  };
}