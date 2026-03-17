import { useState, useEffect } from 'react';
import { assetService } from '../services/assetService';

export function useAssets(skip = 0, limit = 100, status = null, branch_id = null) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await assetService.getAll(skip, limit, status, branch_id);
      setAssets(data);
    } catch (err) {
      setError(err.message);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [skip, limit, status, branch_id]);

  return {
    assets,
    loading,
    error,
    refetch: fetchAssets,
  };
}
