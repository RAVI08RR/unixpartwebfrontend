import useSWR from 'swr';
import { containerService } from '../services/containerService';

const fetcher = async (url) => {
  const [, skip, limit, supplier_id, branch_id, status] = url.split('|');
  return containerService.getAll(
    parseInt(skip) || 0,
    parseInt(limit) || 100,
    supplier_id !== 'null' ? parseInt(supplier_id) : null,
    branch_id !== 'null' ? parseInt(branch_id) : null,
    status !== 'null' ? status : null
  );
};

export function useContainers(skip = 0, limit = 100, supplier_id = null, branch_id = null, status = null) {
  const { data, error, isLoading, mutate } = useSWR(
    `containers|${skip}|${limit}|${supplier_id}|${branch_id}|${status}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    containers: data || [],
    loading: isLoading,
    error: error,
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
    error: error,
    refetch: mutate,
  };
}
