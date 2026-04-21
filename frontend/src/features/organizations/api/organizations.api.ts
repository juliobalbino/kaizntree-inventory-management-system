import { apiClient } from '../../../lib/api-client';
import type { Organization, UpdateOrganizationPayload } from '../model/types';

export const updateOrganization = (id: string, payload: UpdateOrganizationPayload): Promise<Organization> =>
  apiClient.patch(`/organizations/${id}/`, payload).then((r) => r.data);
