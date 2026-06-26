import { useState, useEffect, useCallback } from 'react';
import { customerService } from '../services/customerService';

export function useCustomers(page = 1, page_size = 10, status = null, isDropdown = false) {
  const [result, setResult] = useState({ data: [], total: 0, total_pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = isDropdown
        ? await customerService.getDropdown()
        : await customerService.getAll(page, page_size, status);

      if (isDropdown) {
        setResult({ data: Array.isArray(data) ? data : (data?.data || []), total: 0, total_pages: 1, page: 1 });
      } else {
        setResult(data || { data: [], total: 0, total_pages: 1, page });
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, page_size, status, isDropdown]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers: result.data || [],
    total: result.total || 0,
    totalPages: result.total_pages || 1,
    currentPage: result.page || page,
    loading,
    error,
    refetch: fetchCustomers,
  };
}

export function useCustomer(id) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await customerService.getById(id);
        setCustomer(data);
      } catch (err) {
        console.error('Failed to fetch customer:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  return { customer, loading, error };
}