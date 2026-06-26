import useSWR from 'swr';
import { containerService } from '../services/containerService';

export function useContainers(page = 1, page_size = 10, supplier_id = null, branch_id = null, status = null, isDropdown = false) {
  const { data, error, isLoading, mutate } = useSWR(
    `containers|${page}|${page_size}|${supplier_id}|${branch_id}|${status}|${isDropdown}`,
    () => isDropdown
      ? containerService.getDropdown()
      : containerService.getAll(page, page_size, supplier_id, branch_id, status),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    containers: isDropdown
      ? (Array.isArray(data) ? data : (data?.data || []))
      : (data?.data || []),
    total: data?.total || 0,
    totalPages: data?.total_pages || 1,
    currentPage: data?.page || page,
    loading: isLoading,
    error,
    refetch: mutate,
  };
}

export function useContainer(id) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `container-${id}` : null,
    () => containerService.getById(id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    container: data,
    loading: isLoading,
    error,
    refetch: mutate,
  };
}
