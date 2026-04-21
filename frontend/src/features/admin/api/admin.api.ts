import { apiClient, type PaginatedResponse } from '../../../lib/api-client';
import type {
  AdminUser,
  AdminOrganization,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
  CreateAdminOrgPayload,
  UpdateAdminOrgPayload,
} from '../model/types';

export interface TableQueryParams {
  page?: number;
  search?: string;
  ordering?: string;
}

export const fetchAdminUsers = (params?: TableQueryParams): Promise<PaginatedResponse<AdminUser>> =>
  apiClient.get('/admin/users/', { params }).then((r) => r.data);

export const createAdminUser = (payload: CreateAdminUserPayload): Promise<AdminUser> =>
  apiClient.post('/admin/users/', payload).then((r) => r.data);

export const updateAdminUser = (id: number, payload: UpdateAdminUserPayload): Promise<AdminUser> =>
  apiClient.patch(`/admin/users/${id}/`, payload).then((r) => r.data);

export const deleteAdminUser = (id: number): Promise<void> =>
  apiClient.delete(`/admin/users/${id}/`).then(() => undefined);

export const fetchAdminOrgs = (params?: TableQueryParams): Promise<PaginatedResponse<AdminOrganization>> =>
  apiClient.get('/admin/organizations/', { params }).then((r) => r.data);

export const createAdminOrg = (payload: CreateAdminOrgPayload): Promise<AdminOrganization> =>
  apiClient.post('/admin/organizations/', payload).then((r) => r.data);

export const updateAdminOrg = (id: string, payload: UpdateAdminOrgPayload): Promise<AdminOrganization> =>
  apiClient.patch(`/admin/organizations/${id}/`, payload).then((r) => r.data);

export const deleteAdminOrg = (id: string): Promise<void> =>
  apiClient.delete(`/admin/organizations/${id}/`).then(() => undefined);
