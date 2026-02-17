import { useState, useEffect } from 'react';
import { containerItemService } from '../services/containerItemService';

export function useContainerItems(container_id = null) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await containerItemService.getAll(0, 100, container_id);
        setItems(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [container_id]);

  return { items, loading, error };
}
