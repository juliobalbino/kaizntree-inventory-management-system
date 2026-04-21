import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrganization } from '../api/organizations.api';
import type { UpdateOrganizationPayload } from '../model/types';

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOrganizationPayload }) =>
      updateOrganization(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      notifications.show({ title: 'Organization updated', message: '', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Error', message: 'Could not update organization.', color: 'red' });
    },
  });
}
