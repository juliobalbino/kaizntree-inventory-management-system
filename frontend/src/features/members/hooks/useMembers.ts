import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TableQueryParams } from '../../admin/api/admin.api';
import { addMember, fetchMembers, removeMember, updateMember } from '../api/members.api';
import type { AddMemberPayload, UpdateMemberPayload } from '../model/types';

export function useMembers(orgId: string | undefined, params?: TableQueryParams) {
  return useQuery({
    queryKey: ['members', orgId, params],
    queryFn: () => fetchMembers(orgId!, params),
    enabled: !!orgId,
  });
}

export function useAddMember(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddMemberPayload) => addMember(orgId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', orgId] });
      notifications.show({ title: 'Member added', message: '', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not add member.', color: 'red' });
    },
  });
}

export function useUpdateMember(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: UpdateMemberPayload }) =>
      updateMember(orgId, userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', orgId] });
      notifications.show({ title: 'Member updated', message: '', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not update member.', color: 'red' });
    },
  });
}

export function useRemoveMember(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => removeMember(orgId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', orgId] });
      notifications.show({ title: 'Member removed', message: '', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not remove member.', color: 'red' });
    },
  });
}
