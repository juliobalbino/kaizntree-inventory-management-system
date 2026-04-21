export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierPayload {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface SupplierQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}
