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
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '../hooks/useCustomers';
import { formatDate, maskPhone, PHONE_REGEX } from '../../../lib/utils';
import type { Customer, CustomerPayload } from '../model/types';

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').or(z.literal('')),
  phone: z.string().regex(PHONE_REGEX, 'Invalid phone format (11 99999-9999)').or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export function CustomersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure();
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure();
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data: paginated, isLoading } = useCustomers({
    page,
    page_size: pageSize,
    search: search || undefined,
    ordering: sortDirection === 'desc' ? `-${sortField}` : sortField,
  });

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer(selectedCustomer?.id ?? '');
  const deleteCustomer = useDeleteCustomer();

  const form = useForm<CustomerPayload>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
    },
    validate: zodResolver(customerSchema),
  });

  const handleCreate = form.onSubmit((values) => {
    createCustomer.mutate(values, {
      onSuccess: () => {
        closeCreate();
        form.reset();
      },
    });
  });

  const handleEdit = form.onSubmit((values) => {
    updateCustomer.mutate(values, {
      onSuccess: () => {
        closeEdit();
        form.reset();
        setSelectedCustomer(null);
      },
    });
  });

  const handleDelete = () => {
    if (selectedCustomer) {
      deleteCustomer.mutate(selectedCustomer.id, {
        onSuccess: () => {
          closeDelete();
          setSelectedCustomer(null);
        },
      });
    }
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    form.setValues({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes,
    });
    openEdit();
  };

  const openDeleteModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    openDelete();
  };

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Customer Name',
      sortable: true,
      render: (c) => (
        <Stack gap={2}>
          <Text size="sm" fw={500}>{c.name}</Text>
          {c.notes && <Text size="xs" c="dimmed" lineClamp={1}>{c.notes}</Text>}
        </Stack>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (c) => (
        <Stack gap={2}>
          {c.email && (
            <Group gap={6} wrap="nowrap">
              <IconMail size={14} color="gray" />
              <Text size="xs">{c.email}</Text>
            </Group>
          )}
          {c.phone && (
            <Group gap={6} wrap="nowrap">
              <IconPhone size={14} color="gray" />
              <Text size="xs">{c.phone}</Text>
            </Group>
          )}
        </Stack>
      ),
    },
    {
      key: 'address',
      header: 'Address',
      render: (c) => c.address ? (
        <Group gap={6} wrap="nowrap" align="flex-start">
          <IconMapPin size={14} color="gray" style={{ marginTop: 2 }} />
          <Text size="xs" lineClamp={2}>{c.address}</Text>
        </Group>
      ) : <Text size="xs" c="dimmed">—</Text>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <Group gap="xs" justify="flex-end">
          <Button variant="subtle" size="xs" onClick={() => openEditModal(c)}>
            Edit
          </Button>
          <Button variant="subtle" color="red" size="xs" onClick={() => openDeleteModal(c)}>
            Remove
          </Button>
        </Group>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Customers"
        description="Manage your client base"
        action={{ label: 'New Customer', onClick: openCreate }}
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
      <Modal opened={createOpened} onClose={closeCreate} title="New Customer">
        <form onSubmit={handleCreate}>
          <Stack gap="sm">
            <TextInput label="Name" placeholder="e.g. John Doe" required {...form.getInputProps('name')} />
            <Group grow>
              <TextInput label="Email" placeholder="customer@example.com" {...form.getInputProps('email')} />
              <TextInput
                label="Phone"
                placeholder="11 99999-9999"
                {...form.getInputProps('phone')}
                onChange={(e) => form.setFieldValue('phone', maskPhone(e.currentTarget.value))}
              />
            </Group>
            <Textarea label="Address" placeholder="Full street address..." minRows={2} {...form.getInputProps('address')} />
            <Textarea label="Internal Notes" placeholder="Preferences, tags, etc." minRows={2} {...form.getInputProps('notes')} />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeCreate}>Cancel</Button>
              <Button type="submit" loading={createCustomer.isPending}>Create Customer</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal opened={editOpened} onClose={closeEdit} title="Edit Customer">
        <form onSubmit={handleEdit}>
          <Stack gap="sm">
            <TextInput label="Name" placeholder="e.g. John Doe" required {...form.getInputProps('name')} />
            <Group grow>
              <TextInput label="Email" placeholder="customer@example.com" {...form.getInputProps('email')} />
              <TextInput
                label="Phone"
                placeholder="11 99999-9999"
                {...form.getInputProps('phone')}
                onChange={(e) => form.setFieldValue('phone', maskPhone(e.currentTarget.value))}
              />
            </Group>
            <Textarea label="Address" placeholder="Full street address..." minRows={2} {...form.getInputProps('address')} />
            <Textarea label="Internal Notes" placeholder="Preferences, tags, etc." minRows={2} {...form.getInputProps('notes')} />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeEdit}>Cancel</Button>
              <Button type="submit" loading={updateCustomer.isPending}>Save Changes</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal opened={deleteOpened} onClose={closeDelete} title="Delete Customer" centered>
        <Stack>
          <Text size="sm">
            Are you sure you want to delete <strong>{selectedCustomer?.name}</strong>?
            This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={closeDelete}>Cancel</Button>
            <Button color="red" loading={deleteCustomer.isPending} onClick={handleDelete}>
              Delete Customer
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
