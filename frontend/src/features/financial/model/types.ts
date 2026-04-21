export interface FinancialSummary {
  total_cost: string;
  total_revenue: string;
  profit: string;
  margin: string;
}

export interface ProductFinancial {
  product_id: string;
  product_name: string;
  product_sku: string;
  units_sold: string;
  total_cost: string;
  total_revenue: string;
  profit: string;
  margin: string;
}

export type GroupBy = 'day' | 'month' | 'year';

export interface FinancialTimeline {
  period: string;
  revenue: string;
  cost: string;
  profit: string;
}
