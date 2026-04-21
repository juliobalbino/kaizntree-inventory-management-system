export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface UpdateOrganizationPayload {
  name: string;
}
