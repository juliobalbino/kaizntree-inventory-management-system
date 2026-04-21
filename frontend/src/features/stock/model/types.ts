export type StockSource = 'manual' | 'purchase_order' | 'sales_order';

export interface StockEntry {
  id: string;
  product: string;
  quantity: string;
  source: StockSource;
  reference: string | null;
  created_at: string;
}

export interface StockCreatePayload {
  product: string;
  quantity: number;
}
