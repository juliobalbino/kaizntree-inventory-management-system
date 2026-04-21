import { apiClient, type PaginatedResponse } from '../../../lib/api-client';
import type { Supplier, SupplierPayload, SupplierQueryParams } from '../model/types';

export const fetchSuppliers = (params?: SupplierQueryParams): Promise<PaginatedResponse<Supplier>> =>
  apiClient.get('/suppliers/', { params }).then((r) => r.data);

export const createSupplier = (payload: SupplierPayload): Promise<Supplier> =>
  apiClient.post('/suppliers/', payload).then((r) => r.data);

export const updateSupplier = (id: string, payload: Partial<SupplierPayload>): Promise<Supplier> =>
  apiClient.patch(`/suppliers/${id}/`, payload).then((r) => r.data);

export const deleteSupplier = (id: string): Promise<void> =>
  apiClient.delete(`/suppliers/${id}/`).then((r) => r.data);
