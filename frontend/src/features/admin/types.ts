export interface AdminUserOrg {
  id: string;
  name: string;
  role: 'owner' | 'member';
}

export interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  organizations: AdminUserOrg[];
}

export interface CreateAdminUserPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface UpdateAdminUserPayload {
  email?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
}

export interface AdminOrgMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'owner' | 'member';
}

export interface AdminOrganization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  members: AdminOrgMember[];
}

export interface CreateAdminOrgPayload {
  name: string;
  owner_email: string;
}

export interface UpdateAdminOrgPayload {
  name: string;
}
