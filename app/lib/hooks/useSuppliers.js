import useSWR from 'swr';
import { supplierService } from '../services/supplierService';

export function useSuppliers(skip = 0, limit = 100, status = null, isDropdown = false) {
  const { data, error, mutate, isLoading } = useSWR(
    ['suppliers', skip, limit, status, isDropdown],
    () => isDropdown 
      ? supplierService.getDropdown()
      : supplierService.getAll(skip, limit, status),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      errorRetryCount: 3,
      onError: (error) => {
        console.error('useSuppliers error:', error);
      }
    }
  );

  return {
    suppliers: Array.isArray(data) ? data : (data?.data || data?.items || data?.suppliers || []),
    isLoading,
    isError: error,
    mutate
  };
}