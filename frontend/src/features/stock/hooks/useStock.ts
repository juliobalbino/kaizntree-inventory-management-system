import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createStock, fetchStockForProduct, removeStock, type StockQueryParams } from '../api/stock.api';
import type { StockCreatePayload } from '../model/types';

export function useStockForProduct(productId: string | undefined, params?: Omit<StockQueryParams, 'product'>) {
  return useQuery({
    queryKey: ['stock', productId, params],
    queryFn: () => fetchStockForProduct(productId!, params),
    enabled: !!productId,
  });
}

export function useCreateStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StockCreatePayload) => createStock(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stock', data.product] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      notifications.show({ title: 'Stock added', message: '', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not add stock.', color: 'red' });
    },
  });
}

export function useRemoveStock(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quantity: number) => removeStock(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      notifications.show({ title: 'Stock removed', message: '', color: 'orange' });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.detail ?? 'Could not remove stock.';
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    },
  });
}
