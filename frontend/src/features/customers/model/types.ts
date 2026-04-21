export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerPayload {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface CustomerQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}
