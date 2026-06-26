import { useState, useEffect } from 'react';
import { expenseService } from '../services/expenseService';

export function useExpenses(page = 1, page_size = 10) {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await expenseService.getAll({ page, page_size });

      const items = response?.data || response?.items || response?.expenses || (Array.isArray(response) ? response : []);
      setExpenses(items);
      setTotal(response?.total ?? items.length);
      setTotalPages(response?.total_pages ?? Math.ceil(items.length / page_size) ?? 1);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching expenses:', err);
      setExpenses([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page, page_size]);

  return {
    expenses,
    total,
    totalPages,
    currentPage: page,
    loading,
    error,
    refetch: fetchExpenses,
  };
}
