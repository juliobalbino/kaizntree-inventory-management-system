import { isAxiosError } from 'axios';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelSalesOrder,
  confirmSalesOrder,
  createSalesOrder,
  fetchSalesOrder,
  fetchSalesOrders,
  type SalesQueryParams,
} from '../api/sales.api';
import type { SalesOrderPayload } from '../model/types';

export function useSalesOrders(params?: SalesQueryParams) {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => fetchSalesOrders(params),
  });
}

export function useSalesOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['sales', id],
    queryFn: () => fetchSalesOrder(id!),
    enabled: !!id,
  });
}

export function useCreateSalesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SalesOrderPayload) => createSalesOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not create sales order.', color: 'red' });
    },
  });
}

export function useConfirmSalesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => confirmSalesOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      notifications.show({ title: 'Order confirmed', message: 'Stock has been deducted.', color: 'green' });
    },
    onError: (error: unknown) => {
      const msg = isAxiosError(error) ? error.response?.data?.detail : 'Could not confirm order.';
      notifications.show({ title: 'Insufficient stock', message: msg ?? 'Could not confirm order.', color: 'red' });
    },
  });
}

export function useCancelSalesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelSalesOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      notifications.show({ title: 'Order cancelled', message: '', color: 'orange' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not cancel order.', color: 'red' });
    },
  });
}
