import useSWR from 'swr';
import { invoiceService } from '../services/invoiceService';

export function useInvoices(skip = 0, limit = 100, customer_id = null, status = null) {
  const { data, error, mutate, isLoading } = useSWR(
    ['invoices', skip, limit, customer_id, status],
    () => invoiceService.getAll(skip, limit, customer_id, status),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      errorRetryCount: 3,
      onError: (error) => {
        console.error('useInvoices error:', error);
      }
    }
  );

  return {
    invoices: data,
    isLoading,
    isError: error,
    mutate
  };
}