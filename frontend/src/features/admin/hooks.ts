import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  fetchAdminOrgs,
  createAdminOrg,
  updateAdminOrg,
  deleteAdminOrg,
} from './api';
import type {
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
  CreateAdminOrgPayload,
  UpdateAdminOrgPayload,
} from './types';

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: fetchAdminUsers,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdminUserPayload) => createAdminUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      notifications.show({ title: 'User created', message: '', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not create user.', color: 'red' });
    },
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAdminUserPayload }) =>
      updateAdminUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      notifications.show({ title: 'User updated', message: '', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not update user.', color: 'red' });
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      notifications.show({ title: 'User deleted', message: '', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not delete user.', color: 'red' });
    },
  });
}

export function useAdminOrgs() {
  return useQuery({
    queryKey: ['admin', 'organizations'],
    queryFn: fetchAdminOrgs,
  });
}

export function useCreateAdminOrg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdminOrgPayload) => createAdminOrg(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
      notifications.show({ title: 'Organization created', message: '', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not create organization.', color: 'red' });
    },
  });
}

export function useUpdateAdminOrg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAdminOrgPayload }) =>
      updateAdminOrg(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
      notifications.show({ title: 'Organization updated', message: '', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not update organization.', color: 'red' });
    },
  });
}

export function useDeleteAdminOrg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminOrg(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
      notifications.show({ title: 'Organization deleted', message: '', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not delete organization.', color: 'red' });
    },
  });
}
