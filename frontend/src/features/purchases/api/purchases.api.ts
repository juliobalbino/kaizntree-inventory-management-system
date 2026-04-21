import { apiClient, type PaginatedResponse } from '../../../lib/api-client';
import type { PurchaseOrder, PurchaseOrderPayload } from '../model/types';

export interface PurchaseQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export const fetchPurchaseOrders = (params?: PurchaseQueryParams): Promise<PaginatedResponse<PurchaseOrder>> =>
  apiClient.get('/purchases/', { params }).then((r) => r.data);

export const fetchPurchaseOrder = (id: string): Promise<PurchaseOrder> =>
  apiClient.get(`/purchases/${id}/`).then((r) => r.data);

export const createPurchaseOrder = (payload: PurchaseOrderPayload): Promise<PurchaseOrder> =>
  apiClient.post('/purchases/', payload).then((r) => r.data);

export const confirmPurchaseOrder = (id: string): Promise<PurchaseOrder> =>
  apiClient.post(`/purchases/${id}/confirm/`).then((r) => r.data);

export const cancelPurchaseOrder = (id: string): Promise<PurchaseOrder> =>
  apiClient.post(`/purchases/${id}/cancel/`).then((r) => r.data);
