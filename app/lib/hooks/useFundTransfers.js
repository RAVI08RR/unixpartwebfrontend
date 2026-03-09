import { useState, useEffect } from 'react';
import { fundTransferService } from '../services/fundTransferService';

export function useFundTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const data = await fundTransferService.getAll();
      setTransfers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch fund transfers:', err);
      setError(err.message);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  return {
    transfers,
    loading,
    error,
    refetch: fetchTransfers
  };
}
