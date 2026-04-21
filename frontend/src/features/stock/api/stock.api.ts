import { apiClient, type PaginatedResponse } from '../../../lib/api-client';
import type { StockCreatePayload, StockEntry } from '../model/types';

export interface StockQueryParams {
  product?: string;
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  date_after?: string;
  date_before?: string;
}

export const fetchStockForProduct = (productId: string, params?: Omit<StockQueryParams, 'product'>): Promise<PaginatedResponse<StockEntry>> =>
  apiClient.get('/stock/', { params: { product: productId, ...params } }).then((r) => r.data);

export const createStock = (payload: StockCreatePayload): Promise<StockEntry> =>
  apiClient.post('/stock/', payload).then((r) => r.data);

export const removeStock = (productId: string, quantity: number): Promise<StockEntry> =>
  apiClient.post(`/stock/${productId}/remove/`, { quantity }).then((r) => r.data);
