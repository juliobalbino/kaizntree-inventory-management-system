import { apiClient } from '../../../lib/api-client';
import type { FinancialSummary, ProductFinancial, FinancialTimeline, GroupBy } from '../model/types';

export interface DateParams {
  date_from?: string;
  date_to?: string;
  product_ids?: string[];
}

export interface TimelineParams extends DateParams {
  group_by?: GroupBy;
}

export const fetchFinancialSummary = (params?: DateParams): Promise<FinancialSummary> =>
  apiClient.get('/financial/summary/', { params }).then((r) => r.data);

export const fetchProductFinancials = (params?: DateParams): Promise<ProductFinancial[]> =>
  apiClient.get('/financial/products/', { params }).then((r) => r.data);

export const fetchFinancialTimeline = (params?: TimelineParams): Promise<FinancialTimeline[]> =>
  apiClient.get('/financial/timeline/', { params }).then((r) => r.data);
