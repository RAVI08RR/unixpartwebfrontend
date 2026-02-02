import useSWR from 'swr';
import { invoiceService } from '../services/invoiceService';

export function useInvoices(skip = 0, limit = 100, customer_id = null, status = null) {
  const { data, error, mutate, isLoading } = useSWR(
    ['invoices', skip, limit, customer_id, status],
    () => invoiceService.getAll(skip, limit, customer_id, status),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // Increased from 5s to 10s
      errorRetryCount: 2, // Reduced from 3 to 2
      errorRetryInterval: 2000, // 2 second delay between retries
      shouldRetryOnError: (error) => {
        // Only retry on network errors, not on 4xx errors
        return !error.message.includes('401') && 
               !error.message.includes('403') && 
               !error.message.includes('404');
      },
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