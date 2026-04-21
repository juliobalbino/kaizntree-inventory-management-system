import { apiClient, type PaginatedResponse } from '../../../lib/api-client';
import type { TableQueryParams } from '../../admin/api/admin.api';
import type { AddMemberPayload, Member, UpdateMemberPayload } from '../model/types';

export const fetchMembers = (
  orgId: string,
  params?: TableQueryParams
): Promise<PaginatedResponse<Member>> =>
  apiClient.get(`/organizations/${orgId}/members/`, { params }).then((r) => r.data);

export const addMember = (orgId: string, payload: AddMemberPayload): Promise<Member> =>
  apiClient.post(`/organizations/${orgId}/members/`, payload).then((r) => r.data);

export const updateMember = (
  orgId: string,
  userId: number,
  payload: UpdateMemberPayload
): Promise<Member> =>
  apiClient.patch(`/organizations/${orgId}/members/${userId}/`, payload).then((r) => r.data);

export const removeMember = (orgId: string, userId: number): Promise<void> =>
  apiClient.delete(`/organizations/${orgId}/members/${userId}/`).then(() => undefined);
