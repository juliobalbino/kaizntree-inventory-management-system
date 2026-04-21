import { useMemo, useState } from 'react';
import {
  Alert, Box, Button, Checkbox, Group, Modal,
  Paper, SegmentedControl, SimpleGrid, Skeleton,
  Stack, Table, Text, TextInput,
} from '@mantine/core';
import {
  IconAlertCircle, IconChartBar, IconCurrencyDollar, IconShoppingCart,
  IconTrendingUp, IconX,
} from '@tabler/icons-react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { PageHeader } from '../../../shared/components/ui/PageHeader';
import {
  useFinancialSummary,
  useFinancialTimeline,
  useProductFinancials,
} from '../hooks/useFinancial';
import type { DateParams } from '../api/financial.api';
import type { GroupBy, ProductFinancial } from '../model/types';
import { formatCurrency } from '../../../lib/utils';

type MetricKey = 'revenue' | 'cost' | 'profit' | 'margin';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CurrencyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <Paper withBorder p="xs" shadow="sm" style={{ minWidth: 160 }}>
      <Text size="xs" fw={600} mb={4}>{label}</Text>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((entry: any) => (
        <Text key={entry.name} size="xs" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </Text>
      ))}
    </Paper>
  );
}

function StatCard({ title, value, icon: Icon, color, onClick }: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
}) {
  return (
    <Paper
      withBorder p="lg" radius="md"
      onClick={onClick}
      style={{ cursor: 'pointer', userSelect: 'none', transition: 'transform 0.12s' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
    >
      <Group justify="space-between" mb={6}>
        <Text size="xs" c="dimmed" fw={500} tt="uppercase" style={{ letterSpacing: '0.04em' }}>
          {title}
        </Text>
        <Icon size={18} color={`var(--mantine-color-${color}-6)`} />
      </Group>
      <Text size="xl" fw={700} ff="monospace">{value}</Text>
      <Text size="xs" c="dimmed" mt={4}>Click for details</Text>
    </Paper>
  );
}

function StatDetailModal({
  metric,
  products,
  timeline,
  timelineLoading,
  groupBy,
  onGroupByChange,
  onClose,
}: {
  metric: MetricKey | null;
  products: ProductFinancial[];
  timeline: any[];
  timelineLoading: boolean;
  groupBy: GroupBy;
  onGroupByChange: (v: GroupBy) => void;
  onClose: () => void;
}) {
  if (!metric) return null;

  const titles: Record<MetricKey, string> = {
    revenue: 'Revenue vs Cost Comparison',
    cost: 'Revenue vs Cost Comparison',
    profit: 'Financial Timeline',
    margin: 'Profit Margin by Product',
  };

  if (metric === 'revenue' || metric === 'cost') {
    const comparisonData = products.map((p) => ({
      name: p.product_name.length > 12 ? `${p.product_name.slice(0, 12)}…` : p.product_name,
      revenue: Number(p.total_revenue),
      cost: Number(p.total_cost),
    }));

    return (
      <Modal opened onClose={onClose} title={titles[metric]} size="xl">
        <Stack gap="md">
          <Text size="sm" c="dimmed">Comparing revenue and cost across selected products.</Text>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={comparisonData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CurrencyTooltip />} />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Bar dataKey="revenue" name="Revenue" fill="#228be6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" name="Cost" fill="#fa5252" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Stack>
      </Modal>
    );
  }

  if (metric === 'profit') {
    return (
      <Modal opened onClose={onClose} title={titles[metric]} size="xl">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">Financial trends over time for selected products.</Text>
            <SegmentedControl
              size="xs"
              value={groupBy}
              onChange={(v) => onGroupByChange(v as GroupBy)}
              data={[
                { label: 'Day', value: 'day' },
                { label: 'Month', value: 'month' },
                { label: 'Year', value: 'year' },
              ]}
            />
          </Group>
          <Box pos="relative">
            {timelineLoading && <Skeleton height={350} radius="md" />}
            {!timelineLoading && timeline.length === 0 ? (
              <Stack align="center" justify="center" style={{ height: 350 }}>
                <Text c="dimmed" size="sm">No timeline data for these products/period.</Text>
              </Stack>
            ) : !timelineLoading && (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={timeline} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#228be6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#228be6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fa5252" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#fa5252" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#40c057" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#40c057" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CurrencyTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#228be6" fill="url(#gradRevenue)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="cost" name="Cost" stroke="#fa5252" fill="url(#gradCost)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="profit" name="Profit" stroke="#40c057" fill="url(#gradProfit)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Stack>
      </Modal>
    );
  }

  const barData = products
    .map((p) => ({
      name: p.product_name.length > 20 ? `${p.product_name.slice(0, 20)}…` : p.product_name,
      value: Number(p.margin),
    }))
    .filter((p) => p.value !== 0)
    .sort((a, b) => b.value - a.value);

  const barHeight = Math.max(300, barData.length * 36);

  return (
    <Modal opened onClose={onClose} title={titles[metric]} size="lg">
      <Stack gap="sm">
        <Text size="sm" c="dimmed">Profit margin percentage per product.</Text>
        <Box style={{ height: barHeight, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={barData} margin={{ left: 10, right: 30, top: 0, bottom: 5 }}>
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => `${v.toFixed(0)}%`}
              />
              <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Margin']} />
              <Bar dataKey="value" name="Margin" radius={[0, 3, 3, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.value >= 0 ? '#7950f2' : '#fa5252'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Stack>
    </Modal>
  );
}

export function DashboardPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [groupBy, setGroupBy]   = useState<GroupBy>('month');
  const [openModal, setOpenModal]     = useState<MetricKey | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedProductIds = useMemo(
    () => selectedIds.size === 0 ? undefined : Array.from(selectedIds),
    [selectedIds],
  );

  const financialParams: DateParams = {
    date_from:   dateFrom   || undefined,
    date_to:     dateTo     || undefined,
    product_ids: selectedProductIds,
  };

  const { data: summary,  isLoading: summaryLoading,  isError: summaryError  } = useFinancialSummary(financialParams);
  const { data: products, isLoading: productsLoading, isError: productsError } = useProductFinancials({
    date_from: dateFrom || undefined,
    date_to:   dateTo   || undefined,
  });
  const { data: timeline, isLoading: timelineLoading } = useFinancialTimeline({ ...financialParams, group_by: groupBy });

  const totalRevenue = Number(summary?.total_revenue ?? 0);
  const totalCost    = Number(summary?.total_cost    ?? 0);
  const margin       = Number(summary?.margin        ?? 0);
  const allProducts = products ?? [];
  const displayProducts = useMemo(
    () => selectedIds.size === 0 ? allProducts : allProducts.filter((p) => selectedIds.has(p.product_id)),
    [allProducts, selectedIds],
  );

  const hasFilters = !!dateFrom || !!dateTo || selectedIds.size > 0;

  const timelineData = useMemo(() => (timeline ?? []).map((t) => ({
    period:  t.period,
    revenue: Number(t.revenue),
    cost:    Number(t.cost),
    profit:  Number(t.profit),
  })), [timeline]);

  const handleProductToggle = (productId: string, checked: boolean) => {
    const current = new Set(selectedIds);
    if (checked) current.add(productId);
    else         current.delete(productId);
    setSelectedIds(current);
  };

  const toggleAll = () => {
    if (selectedIds.size === allProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allProducts.map((p) => p.product_id)));
    }
  };

  const filters = (
    <Group gap="xs">
      <TextInput
        type="date" size="xs" value={dateFrom}
        onChange={(e) => setDateFrom(e.currentTarget.value)}
        style={{ width: 140 }}
      />
      <TextInput
        type="date" size="xs" value={dateTo}
        onChange={(e) => setDateTo(e.currentTarget.value)}
        style={{ width: 140 }}
      />
      {hasFilters && (
        <Button
          size="xs" variant="subtle" color="gray"
          leftSection={<IconX size={12} />}
          onClick={() => { setDateFrom(''); setDateTo(''); setSelectedIds(new Set()); }}
        >
          Clear Filters
        </Button>
      )}
    </Group>
  );

  return (
    <>
      <PageHeader title="Dashboard" description="Financial overview of your organization." actions={filters} />

      {summaryError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
          Failed to load financial summary.
        </Alert>
      )}

      {/* ── KPI Cards ─────────────────────────────────────────────── */}
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} mb="lg">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Paper key={i} withBorder p="lg" radius="md">
              <Skeleton height={12} width="55%" mb={8} />
              <Skeleton height={26} width="75%" />
            </Paper>
          ))
        ) : (
          <>
            <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={IconCurrencyDollar} color="blue"   onClick={() => setOpenModal('revenue')} />
            <StatCard title="Total Cost"    value={formatCurrency(totalCost)}    icon={IconShoppingCart}   color="red"    onClick={() => setOpenModal('cost')} />
            <StatCard title="Profit"        value={formatCurrency(Number(summary?.profit ?? 0))} icon={IconTrendingUp} color="green"  onClick={() => setOpenModal('profit')} />
            <StatCard title="Profit Margin" value={`${margin.toFixed(1)}%`}      icon={IconChartBar}       color="violet" onClick={() => setOpenModal('margin')} />
          </>
        )}
      </SimpleGrid>


      {/* ── Per-Product Table ─────────────────────────────────────── */}
      <Paper withBorder radius="md">
        <Group
          px="lg" py="md" justify="space-between"
          style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
        >
          <Stack gap={2}>
            <Text size="sm" fw={600}>Per-Product Breakdown</Text>
            <Text size="xs" c="dimmed">Revenue, cost and margin per SKU — confirmed orders only.</Text>
          </Stack>
        </Group>

        {productsError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" m="md">
            Failed to load product financials.
          </Alert>
        )}

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 40 }}>
                <Checkbox
                  size="xs"
                  checked={allProducts.length > 0 && selectedIds.size === allProducts.length}
                  indeterminate={selectedIds.size > 0 && selectedIds.size < allProducts.length}
                  onChange={toggleAll}
                />
              </Table.Th>
              <Table.Th>Product</Table.Th>
              <Table.Th>SKU</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Units Sold</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Revenue</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Cost</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Profit</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Margin</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {productsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Table.Tr key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <Table.Td key={j}><Skeleton height={14} /></Table.Td>
                  ))}
                </Table.Tr>
              ))
            ) : !products || products.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Stack align="center" py="xl" gap={4}>
                    <Text c="dimmed" size="sm">No products found.</Text>
                  </Stack>
                </Table.Td>
              </Table.Tr>
            ) : (
              products.map((p) => {
                const profitNum    = Number(p.profit);
                const marginNum    = Number(p.margin);
                const marginBarPct = Math.min(100, Math.max(0, marginNum));
                const isSelected   = selectedIds.has(p.product_id);

                return (
                  <Table.Tr key={p.product_id} style={{ background: isSelected ? 'var(--mantine-color-blue-0)' : undefined }}>
                    <Table.Td>
                      <Checkbox
                        size="xs"
                        checked={isSelected}
                        onChange={(e) => handleProductToggle(p.product_id, e.currentTarget.checked)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>{p.product_name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed" ff="monospace">{p.product_sku}</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Text size="sm" ff="monospace">{Number(p.units_sold).toLocaleString()}</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Text size="sm" ff="monospace" fw={500}>{formatCurrency(p.total_revenue)}</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Text size="sm" ff="monospace" c="dimmed">{formatCurrency(p.total_cost)}</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Text size="sm" ff="monospace" fw={500} c={profitNum >= 0 ? 'green' : 'red'}>
                        {profitNum >= 0 ? '+' : ''}{formatCurrency(profitNum)}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Group gap={8} justify="flex-end" wrap="nowrap">
                        <Box
                          visibleFrom="md"
                          style={{
                            width: 64, height: 6, borderRadius: 99,
                            background: 'var(--mantine-color-default-border)',
                            overflow: 'hidden', flexShrink: 0,
                          }}
                        >
                          <Box
                            style={{
                              width: `${marginBarPct}%`, height: '100%',
                              background: 'var(--mantine-color-green-6)', borderRadius: 99,
                            }}
                          />
                        </Box>
                        <Text size="sm" ff="monospace" fw={500}>{marginNum.toFixed(0)}%</Text>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      <StatDetailModal
        metric={openModal}
        products={displayProducts}
        timeline={timelineData}
        timelineLoading={timelineLoading}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        onClose={() => setOpenModal(null)}
      />
    </>
  );
}
