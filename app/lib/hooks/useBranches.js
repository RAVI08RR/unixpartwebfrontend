import { useState, useEffect } from 'react';
import { branchService } from '../services/branchService';

export function useBranches(skip = 0, limit = 100, isDropdown = false) {
  const [branches, setBranches] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      
      const data = isDropdown 
        ? await branchService.getDropdown()
        : await branchService.getAll(skip, limit);
      setBranches(data);
    } catch (err) {
      console.error('useBranches fetch error:', err);
      setIsError(true);
      setError(err);
      setBranches(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [skip, limit, isDropdown]);

  // Mutate function to refresh data
  const mutate = () => {
    fetchBranches();
  };

  return {
    branches,
    isLoading,
    isError,
    error,
    mutate
  };
}