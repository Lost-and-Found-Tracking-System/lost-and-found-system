import { useState, useCallback } from 'react';
import { itemsService } from '../services/items';

export const useSearch = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const search = useCallback(async (searchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await itemsService.searchItems(searchParams);
      setItems(response.items || []);
      setPagination({
        page: response.page || 1,
        limit: response.limit || 20,
        total: response.total || 0,
        totalPages: response.totalPages || 0,
      });
    } catch (err) {
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setItems([]);
    setError(null);
    setPagination({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });
  }, []);

  return {
    items,
    loading,
    error,
    pagination,
    search,
    reset,
  };
};