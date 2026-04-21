import { apiClient } from '../../../lib/api-client';
import type { AuthTokens, LoginPayload, User } from '../model/types';

export async function login(payload: LoginPayload): Promise<AuthTokens> {
  const { data } = await apiClient.post<AuthTokens>('/auth/login/', payload);
  return data;
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<User>('/auth/me/');
  return data;
}

export async function updateProfile(payload: Partial<{ first_name: string; last_name: string; organization_id: string }>): Promise<User> {
  const { data } = await apiClient.patch<User>('/auth/me/', payload);
  return data;
}

export async function changePassword(payload: { old_password: string; new_password: string }): Promise<void> {
  await apiClient.post('/auth/me/change-password/', payload);
}
