import { apiClient, type PaginatedResponse } from '../../../lib/api-client';
import type { Product, ProductPayload } from '../model/types';

export interface ProductQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  unit?: string;
  ordering?: string;
}

export const fetchProducts = (params?: ProductQueryParams): Promise<PaginatedResponse<Product>> =>
  apiClient.get('/products/', { params }).then((r) => r.data);

export const fetchProduct = (id: string): Promise<Product> =>
  apiClient.get(`/products/${id}/`).then((r) => r.data);

export const createProduct = (payload: ProductPayload): Promise<Product> =>
  apiClient.post('/products/', payload).then((r) => r.data);

export const updateProduct = (id: string, payload: Partial<ProductPayload>): Promise<Product> =>
  apiClient.patch(`/products/${id}/`, payload).then((r) => r.data);

export const deleteProduct = (id: string): Promise<void> =>
  apiClient.delete(`/products/${id}/`).then(() => undefined);
