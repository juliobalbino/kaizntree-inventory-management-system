import { apiClient, type PaginatedResponse } from '../../../lib/api-client';
import type { Customer, CustomerPayload, CustomerQueryParams } from '../model/types';

export const fetchCustomers = (params?: CustomerQueryParams): Promise<PaginatedResponse<Customer>> =>
  apiClient.get('/customers/', { params }).then((r) => r.data);

export const createCustomer = (payload: CustomerPayload): Promise<Customer> =>
  apiClient.post('/customers/', payload).then((r) => r.data);

export const updateCustomer = (id: string, payload: Partial<CustomerPayload>): Promise<Customer> =>
  apiClient.patch(`/customers/${id}/`, payload).then((r) => r.data);

export const deleteCustomer = (id: string): Promise<void> =>
  apiClient.delete(`/customers/${id}/`).then((r) => r.data);
