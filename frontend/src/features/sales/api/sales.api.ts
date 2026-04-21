import { apiClient, type PaginatedResponse } from '../../../lib/api-client';
import type { SalesOrder, SalesOrderPayload } from '../model/types';

export interface SalesQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export const fetchSalesOrders = (params?: SalesQueryParams): Promise<PaginatedResponse<SalesOrder>> =>
  apiClient.get('/sales/', { params }).then((r) => r.data);

export const fetchSalesOrder = (id: string): Promise<SalesOrder> =>
  apiClient.get(`/sales/${id}/`).then((r) => r.data);

export const createSalesOrder = (payload: SalesOrderPayload): Promise<SalesOrder> =>
  apiClient.post('/sales/', payload).then((r) => r.data);

export const confirmSalesOrder = (id: string): Promise<SalesOrder> =>
  apiClient.post(`/sales/${id}/confirm/`).then((r) => r.data);

export const cancelSalesOrder = (id: string): Promise<SalesOrder> =>
  apiClient.post(`/sales/${id}/cancel/`).then((r) => r.data);
