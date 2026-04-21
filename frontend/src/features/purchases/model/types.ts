export interface PurchaseOrderItemPayload {
  product: string;
  quantity: number;
  unit_cost: number;
}

export interface PurchaseOrderPayload {
  supplier?: string | null;
  notes?: string;
  items: PurchaseOrderItemPayload[];
}

export interface PurchaseOrderProductMin {
  id: string;
  name: string;
  sku: string;
  unit: string;
}

export interface PurchaseOrderSupplier {
  id: string;
  name: string;
}

export interface PurchaseOrderCreatedBy {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface PurchaseOrderItem {
  id: string;
  product: PurchaseOrderProductMin;
  quantity: string;
  unit_cost: string;
}

export type PurchaseOrderStatus = 'pending' | 'confirmed' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  supplier: PurchaseOrderSupplier | null;
  created_by: PurchaseOrderCreatedBy | null;
  status: PurchaseOrderStatus;
  notes: string;
  items: PurchaseOrderItem[];
  created_at: string;
  updated_at: string;
}
