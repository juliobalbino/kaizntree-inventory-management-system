import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../api/suppliers.api';
import type { SupplierPayload, SupplierQueryParams } from '../model/types';

export function useSuppliers(params?: SupplierQueryParams) {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => fetchSuppliers(params),
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      notifications.show({ title: 'Supplier created', message: '', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not create supplier.', color: 'red' });
    },
  });
}

export function useUpdateSupplier(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<SupplierPayload>) => updateSupplier(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      notifications.show({ title: 'Supplier updated', message: '', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not update supplier.', color: 'red' });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      notifications.show({ title: 'Supplier deleted', message: '', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not delete supplier.', color: 'red' });
    },
  });
}
