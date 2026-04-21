import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProduct,
  deleteProduct,
  fetchProduct,
  fetchProducts,
  updateProduct,
  type ProductQueryParams,
} from '../api/products.api';
import type { ProductPayload } from '../model/types';

export function useProducts(params?: ProductQueryParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductPayload) => createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      notifications.show({ title: 'Product created', message: '', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not create product.', color: 'red' });
    },
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ProductPayload>) => updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      notifications.show({ title: 'Product updated', message: '', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not update product.', color: 'red' });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      notifications.show({ title: 'Product deleted', message: '', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not delete product.', color: 'red' });
    },
  });
}
