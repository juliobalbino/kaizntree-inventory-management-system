import { useQuery } from '@tanstack/react-query';
import {
  fetchFinancialSummary,
  fetchProductFinancials,
  fetchFinancialTimeline,
} from '../api/financial.api';
import type { DateParams, TimelineParams } from '../api/financial.api';

export function useFinancialSummary(params?: DateParams) {
  return useQuery({
    queryKey: ['financial', 'summary', params],
    queryFn: () => fetchFinancialSummary(params),
  });
}

export function useProductFinancials(params?: DateParams) {
  return useQuery({
    queryKey: ['financial', 'products', params],
    queryFn: () => fetchProductFinancials(params),
  });
}

export function useFinancialTimeline(params?: TimelineParams) {
  return useQuery({
    queryKey: ['financial', 'timeline', params],
    queryFn: () => fetchFinancialTimeline(params),
  });
}
