import useSWR from 'swr';
import { invoiceService } from '../services/invoiceService';

export function useInvoices(page = 1, page_size = 10, customer_id = null, status = null) {
  const { data, error, mutate, isLoading } = useSWR(
    ['invoices', page, page_size, customer_id, status],
    () => invoiceService.getAll(page, page_size, customer_id, status),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
      errorRetryCount: 2,
      errorRetryInterval: 2000,
      shouldRetryOnError: (error) => {
        return !error.message.includes('401') &&
          !error.message.includes('403') &&
          !error.message.includes('404');
      },
    }
  );

  return {
    invoices: data?.data || [],
    total: data?.total || 0,
    totalPages: data?.total_pages || 1,
    currentPage: data?.page || page,
    isLoading,
    isError: error,
    mutate,
  };
}