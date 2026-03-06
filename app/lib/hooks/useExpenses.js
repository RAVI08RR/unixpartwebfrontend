import { useState, useEffect } from 'react';
import { expenseService } from '../services/expenseService';

export function useExpenses(params = {}) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await expenseService.getAll(params);
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching expenses:', err);
      // Set empty array on error to prevent crashes
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [JSON.stringify(params)]);

  return {
    expenses,
    loading,
    error,
    refetch: fetchExpenses,
  };
}
