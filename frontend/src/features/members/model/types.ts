export interface Member {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'owner' | 'member';
}

export interface AddMemberPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: 'owner' | 'member';
}

export interface UpdateMemberPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: 'owner' | 'member';
}
