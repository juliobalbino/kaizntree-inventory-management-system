export interface SalesOrderItemPayload {
  product: string;
  quantity: number;
  unit_price: number;
}

export interface SalesOrderPayload {
  customer?: string | null;
  notes?: string;
  items: SalesOrderItemPayload[];
}

export interface SalesOrderProductMin {
  id: string;
  name: string;
  sku: string;
  unit: string;
}

export interface SalesOrderCustomer {
  id: string;
  name: string;
}

export interface SalesOrderCreatedBy {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface SalesOrderItem {
  id: string;
  product: SalesOrderProductMin;
  quantity: string;
  unit_price: string;
}

export type SalesOrderStatus = 'pending' | 'confirmed' | 'cancelled';

export interface SalesOrder {
  id: string;
  customer: SalesOrderCustomer | null;
  created_by: SalesOrderCreatedBy | null;
  status: SalesOrderStatus;
  notes: string;
  items: SalesOrderItem[];
  created_at: string;
  updated_at: string;
}
