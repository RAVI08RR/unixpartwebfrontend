import { useState, useEffect } from 'react';
import { customerService } from '../services/customerService';

export function useCustomers(skip = 0, limit = 100, status = null) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerService.getAll(skip, limit, status);
      setCustomers(data);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [skip, limit, status]);

  const refetch = () => {
    fetchCustomers();
  };

  return {
    customers,
    loading,
    error,
    refetch
  };
}

export function useCustomer(id) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchCustomer = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await customerService.getById(id);
        setCustomer(data);
      } catch (err) {
        console.error('Failed to fetch customer:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  return {
    customer,
    loading,
    error
  };
}