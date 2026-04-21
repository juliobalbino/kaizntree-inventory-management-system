import { useQuery } from '@tanstack/react-query';
import { fetchFinancialSummary, fetchProductFinancials } from '../api/financial.api';

export function useFinancialSummary() {
  return useQuery({
    queryKey: ['financial', 'summary'],
    queryFn: fetchFinancialSummary,
  });
}

export function useProductFinancials() {
  return useQuery({
    queryKey: ['financial', 'products'],
    queryFn: fetchProductFinancials,
  });
}
