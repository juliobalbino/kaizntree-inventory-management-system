import { useState } from 'react';
import {
  Button,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { IconPhone, IconMail, IconMapPin } from '@tabler/icons-react';
import { z } from 'zod';
import { PageHeader } from '../../../shared/components/ui/PageHeader';
import { DataTable, type Column } from '../../../shared/components/ui/DataTable';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '../hooks/useSuppliers';
import { formatCurrency, formatDate, maskPhone, PHONE_REGEX } from '../../../lib/utils';
import type { Supplier, SupplierPayload } from '../model/types';

const supplierSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').or(z.literal('')),
  phone: z.string().regex(PHONE_REGEX, 'Invalid phone format (11 99999-9999)').or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export function SuppliersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure();
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure();
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure();
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const { data: paginated, isLoading } = useSuppliers({
    page,
    page_size: pageSize,
    search: search || undefined,
    ordering: sortDirection === 'desc' ? `-${sortField}` : sortField,
  });

  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier(selectedSupplier?.id ?? '');
  const deleteSupplier = useDeleteSupplier();

  const form = useForm<SupplierPayload>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
    },
    validate: zodResolver(supplierSchema),
  });

  const handleCreate = form.onSubmit((values) => {
    createSupplier.mutate(values, {
      onSuccess: () => {
        closeCreate();
        form.reset();
      },
    });
  });

  const handleEdit = form.onSubmit((values) => {
    updateSupplier.mutate(values, {
      onSuccess: () => {
        closeEdit();
        form.reset();
        setSelectedSupplier(null);
      },
    });
  });

  const handleDelete = () => {
    if (selectedSupplier) {
      deleteSupplier.mutate(selectedSupplier.id, {
        onSuccess: () => {
          closeDelete();
          setSelectedSupplier(null);
        },
      });
    }
  };

  const openEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    form.setValues({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      notes: supplier.notes,
    });
    openEdit();
  };

  const openDeleteModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    openDelete();
  };

  const columns: Column<Supplier>[] = [
    {
      key: 'name',
      header: 'Supplier Name',
      sortable: true,
      render: (s) => (
        <Stack gap={2}>
          <Text size="sm" fw={500}>{s.name}</Text>
          {s.notes && <Text size="xs" c="dimmed" lineClamp={1}>{s.notes}</Text>}
        </Stack>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (s) => (
        <Stack gap={2}>
          {s.email && (
            <Group gap={6} wrap="nowrap">
              <IconMail size={14} color="gray" />
              <Text size="xs">{s.email}</Text>
            </Group>
          )}
          {s.phone && (
            <Group gap={6} wrap="nowrap">
              <IconPhone size={14} color="gray" />
              <Text size="xs">{s.phone}</Text>
            </Group>
          )}
        </Stack>
      ),
    },
    {
      key: 'address',
      header: 'Address',
      render: (s) => s.address ? (
        <Group gap={6} wrap="nowrap" align="flex-start">
          <IconMapPin size={14} color="gray" style={{ marginTop: 2 }} />
          <Text size="xs" lineClamp={2}>{s.address}</Text>
        </Group>
      ) : <Text size="xs" c="dimmed">—</Text>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (s) => (
        <Group gap="xs" justify="flex-end">
          <Button variant="subtle" size="xs" onClick={() => openEditModal(s)}>
            Edit
          </Button>
          <Button variant="subtle" color="red" size="xs" onClick={() => openDeleteModal(s)}>
            Remove
          </Button>
        </Group>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Suppliers"
        description="Manage your supply chain partners"
        action={{ label: 'New Supplier', onClick: openCreate }}
      />

      <DataTable
        data={paginated?.results ?? []}
        columns={columns}
        totalCount={paginated?.count ?? 0}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        totalPages={Math.ceil((paginated?.count ?? 0) / pageSize)}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        onSearch={(s) => { setSearch(s); setPage(1); }}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={(field, dir) => { setSortField(field); setSortDirection(dir); }}
        searchPlaceholder="Search by name, email or phone..."
      />

      {/* Create Modal */}
      <Modal opened={createOpened} onClose={closeCreate} title="New Supplier">
        <form onSubmit={handleCreate}>
          <Stack gap="sm">
            <TextInput label="Name" placeholder="e.g. Acme Corp" required {...form.getInputProps('name')} />
            <Group grow>
              <TextInput label="Email" placeholder="supplier@example.com" {...form.getInputProps('email')} />
              <TextInput
                label="Phone"
                placeholder="11 99999-9999"
                {...form.getInputProps('phone')}
                onChange={(e) => form.setFieldValue('phone', maskPhone(e.currentTarget.value))}
              />
            </Group>
            <Textarea label="Address" placeholder="Full street address..." minRows={2} {...form.getInputProps('address')} />
            <Textarea label="Internal Notes" placeholder="Special pricing, contact person, etc." minRows={2} {...form.getInputProps('notes')} />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeCreate}>Cancel</Button>
              <Button type="submit" loading={createSupplier.isPending}>Create Supplier</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal opened={editOpened} onClose={closeEdit} title="Edit Supplier">
        <form onSubmit={handleEdit}>
          <Stack gap="sm">
            <TextInput label="Name" placeholder="e.g. Acme Corp" required {...form.getInputProps('name')} />
            <Group grow>
              <TextInput label="Email" placeholder="supplier@example.com" {...form.getInputProps('email')} />
              <TextInput
                label="Phone"
                placeholder="11 99999-9999"
                {...form.getInputProps('phone')}
                onChange={(e) => form.setFieldValue('phone', maskPhone(e.currentTarget.value))}
              />
            </Group>
            <Textarea label="Address" placeholder="Full street address..." minRows={2} {...form.getInputProps('address')} />
            <Textarea label="Internal Notes" placeholder="Special pricing, contact person, etc." minRows={2} {...form.getInputProps('notes')} />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeEdit}>Cancel</Button>
              <Button type="submit" loading={updateSupplier.isPending}>Save Changes</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal opened={deleteOpened} onClose={closeDelete} title="Delete Supplier" centered>
        <Stack>
          <Text size="sm">
            Are you sure you want to delete <strong>{selectedSupplier?.name}</strong>?
            This action cannot be undone and may affect associated purchase orders.
          </Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={closeDelete}>Cancel</Button>
            <Button color="red" loading={deleteSupplier.isPending} onClick={handleDelete}>
              Delete Supplier
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
