export type ProductUnit = 'kg' | 'g' | 'L' | 'mL' | 'unit';

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  unit: ProductUnit;
  unit_cost: string | null;
  unit_price: string | null;
  stock_total: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductPayload {
  name: string;
  description?: string;
  sku: string;
  unit: ProductUnit;
  unit_cost?: number | null;
  unit_price?: number | null;
}
