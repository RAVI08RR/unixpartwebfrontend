import useSWR from 'swr';
import { purchaseOrderService } from '../services/purchaseOrderService';

export function usePurchaseOrders(page = 1, page_size = 10) {
  const { data, error, isLoading, mutate } = useSWR(
    `purchase-orders|${page}|${page_size}`,
    () => purchaseOrderService.getAll(page, page_size),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    purchaseOrders: data?.data || [],
    total: data?.total || 0,
    totalPages: data?.total_pages || 1,
    currentPage: data?.page || page,
    loading: isLoading,
    error,
    refetch: mutate,
  };
}

export function usePurchaseOrder(id) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `purchase-order-${id}` : null,
    () => purchaseOrderService.getById(id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    purchaseOrder: data,
    loading: isLoading,
    error,
    refetch: mutate,
  };
}
