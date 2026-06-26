import { useState, useEffect, useCallback } from 'react';
import { assetService } from '../services/assetService';

export function useAssets(page = 1, page_size = 10, status = null, branch_id = null) {
  const [result, setResult] = useState({ data: [], total: 0, total_pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await assetService.getAll(page, page_size, status, branch_id);
      setResult(data || { data: [], total: 0, total_pages: 1, page });
    } catch (err) {
      setError(err.message);
      setResult({ data: [], total: 0, total_pages: 1, page });
    } finally {
      setLoading(false);
    }
  }, [page, page_size, status, branch_id]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    assets: result.data || [],
    total: result.total || 0,
    totalPages: result.total_pages || 1,
    currentPage: result.page || page,
    loading,
    error,
    refetch: fetchAssets,
  };
}
