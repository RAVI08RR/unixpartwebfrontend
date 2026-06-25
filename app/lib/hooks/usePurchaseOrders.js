import useSWR from 'swr';
import { purchaseOrderService } from '../services/purchaseOrderService';

const fetcher = async (url) => {
  const [, skip, limit] = url.split('|');
  return purchaseOrderService.getAll(
    parseInt(skip) || 0,
    parseInt(limit) || 100
  );
};

export function usePurchaseOrders(skip = 0, limit = 100) {
  const { data, error, isLoading, mutate } = useSWR(
    `purchase-orders|${skip}|${limit}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    purchaseOrders: Array.isArray(data) ? data : (data?.data || data?.items || data?.purchase_orders || []),
    loading: isLoading,
    error: error,
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
    error: error,
    refetch: mutate,
  };
}
