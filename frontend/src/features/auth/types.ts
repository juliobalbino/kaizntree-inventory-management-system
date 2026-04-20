export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface CurrentOrganization {
  id: string;
  name: string;
  slug: string;
}

export type UserRole = 'admin' | 'owner' | 'member';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  current_organization: CurrentOrganization | null;
  role: UserRole | null;
}
