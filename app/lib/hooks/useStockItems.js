import { useState, useEffect, useCallback } from 'react';
import { stockItemService } from '../services/stockItemService';

export function useStockItems(page = 1, page_size = 10, parent_id = null, isDropdown = false) {
  const [result, setResult] = useState({ data: [], total: 0, total_pages: 1, page: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const fetchStockItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      if (isDropdown) {
        const data = await stockItemService.getDropdown();
        const arr = Array.isArray(data) ? data : (data?.data || []);
        setResult({ data: arr, total: arr.length, total_pages: 1, page: 1 });
      } else {
        const data = await stockItemService.getAll(page, page_size, parent_id);
        setResult(data || { data: [], total: 0, total_pages: 1, page });
      }
    } catch (err) {
      console.error('useStockItems fetch error:', err);
      setIsError(true);
      setError(err);
      setResult({ data: [], total: 0, total_pages: 1, page });
    } finally {
      setIsLoading(false);
    }
  }, [page, page_size, parent_id, isDropdown]);

  useEffect(() => {
    fetchStockItems();
  }, [fetchStockItems]);

  return {
    stockItems: result.data || [],
    total: result.total || 0,
    totalPages: result.total_pages || 1,
    currentPage: result.page || page,
    isLoading,
    isError,
    error,
    mutate: fetchStockItems,
  };
}