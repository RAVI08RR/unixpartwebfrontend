import useSWR from 'swr';
import { supplierService } from '../services/supplierService';

export function useSuppliers(page = 1, page_size = 10, status = null, isDropdown = false) {
  const { data, error, mutate, isLoading } = useSWR(
    ['suppliers', page, page_size, status, isDropdown],
    () => isDropdown
      ? supplierService.getDropdown()
      : supplierService.getAll(page, page_size, status),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      errorRetryCount: 3,
    }
  );

  // Dropdown returns a plain array; paginated returns envelope
  const isEnvelope = data && !Array.isArray(data) && data.data;
  return {
    suppliers: isDropdown
      ? (Array.isArray(data) ? data : (data?.data || []))
      : (data?.data || []),
    total: data?.total || 0,
    totalPages: data?.total_pages || 1,
    currentPage: data?.page || page,
    isLoading,
    isError: error,
    mutate,
  };
}