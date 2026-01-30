import { useState, useEffect } from 'react';
import { stockItemService } from '../services/stockItemService';

export function useStockItems(skip = 0, limit = 100, parent_id = null) {
  const [stockItems, setStockItems] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const fetchStockItems = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      
      const data = await stockItemService.getAll(skip, limit, parent_id);
      setStockItems(data);
    } catch (err) {
      console.error('useStockItems fetch error:', err);
      setIsError(true);
      setError(err);
      setStockItems(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStockItems();
  }, [skip, limit, parent_id]);

  // Mutate function to refresh data
  const mutate = () => {
    fetchStockItems();
  };

  return {
    stockItems,
    isLoading,
    isError,
    error,
    mutate
  };
}