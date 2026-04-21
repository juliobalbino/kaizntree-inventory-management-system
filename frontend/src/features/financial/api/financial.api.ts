import { apiClient } from '../../../lib/api-client';
import type { FinancialSummary, ProductFinancial } from '../model/types';

export const fetchFinancialSummary = (): Promise<FinancialSummary> =>
  apiClient.get('/financial/summary/').then((r) => r.data);

export const fetchProductFinancials = (): Promise<ProductFinancial[]> =>
  apiClient.get('/financial/products/').then((r) => r.data);
