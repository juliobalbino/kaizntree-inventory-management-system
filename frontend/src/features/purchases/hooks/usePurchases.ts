import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelPurchaseOrder,
  confirmPurchaseOrder,
  createPurchaseOrder,
  fetchPurchaseOrder,
  fetchPurchaseOrders,
  type PurchaseQueryParams,
} from '../api/purchases.api';
import type { PurchaseOrderPayload } from '../model/types';

export function usePurchaseOrders(params?: PurchaseQueryParams) {
  return useQuery({
    queryKey: ['purchases', params],
    queryFn: () => fetchPurchaseOrders(params),
  });
}

export function usePurchaseOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['purchases', id],
    queryFn: () => fetchPurchaseOrder(id!),
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PurchaseOrderPayload) => createPurchaseOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not create purchase order.', color: 'red' });
    },
  });
}

export function useConfirmPurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => confirmPurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      notifications.show({ title: 'Order confirmed', message: 'Stock has been updated.', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not confirm order.', color: 'red' });
    },
  });
}

export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelPurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      notifications.show({ title: 'Order cancelled', message: '', color: 'orange' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not cancel order.', color: 'red' });
    },
  });
}
