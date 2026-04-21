import { isAxiosError } from 'axios';
import { useState } from 'react';
import {
  Badge,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { PageHeader } from '../../../shared/components/ui/PageHeader';
import { DataTable, type Column } from '../../../shared/components/ui/DataTable';
import {
  useAdminOrgs,
  useCreateAdminOrg,
  useUpdateAdminOrg,
  useDeleteAdminOrg,
  useAdminUsers,
} from '../hooks/useAdmin';
import type { AdminOrganization } from '../model/types';
import { z } from 'zod';
import { zodResolver } from '../../../lib/zod-resolver';

const orgSchema = z.object({
  name: z.string().min(1, 'Required'),
  owner_email: z.string().min(1, 'Owner is required'),
});

const editOrgSchema = z.object({
  name: z.string().min(1, 'Required'),
});

export function AdminOrganizationsPage() {
  const createOrg = useCreateAdminOrg();
  const updateOrg = useUpdateAdminOrg();
  const deleteOrg = useDeleteAdminOrg();

  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure();
  const [editingOrg, setEditingOrg] = useState<AdminOrganization | null>(null);
  const [deletingOrgId, setDeletingOrgId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { data, isLoading } = useAdminOrgs({
    page,
    page_size: pageSize,
    search,
    ordering: sortDirection === 'desc' ? `-${sortField}` : sortField,
  });
  
  const orgs = data?.results ?? [];
  const totalPages = data?.count ? Math.ceil(data.count / pageSize) : 1;

  const { data: usersData } = useAdminUsers();
  const users = usersData?.results ?? [];

  const userOptions =
    users
      ?.filter((u) => !u.organizations || u.organizations.length === 0)
      .map((u) => ({
        value: u.email,
        label: `${u.first_name} ${u.last_name} (${u.email})`,
      })) ?? [];

  const createForm = useForm({
    initialValues: { name: '', owner_email: '' },
    validate: zodResolver(orgSchema),
  });

  const editForm = useForm({
    initialValues: { name: '' },
    validate: zodResolver(editOrgSchema),
  });

  const handleCreate = createForm.onSubmit((values) => {
    createOrg.mutate(values, {
      onSuccess: () => {
        closeCreate();
        createForm.reset();
      },
      onError: (error: unknown) => {
        if (isAxiosError(error) && error.response?.data) {
          createForm.setErrors(error.response.data as Record<string, React.ReactNode>);
        }
      },
    });
  });

  const handleEdit = editForm.onSubmit((values) => {
    if (!editingOrg) return;
    updateOrg.mutate(
      { id: editingOrg.id, payload: values },
      {
        onSuccess: () => {
          setEditingOrg(null);
          editForm.reset();
        },
        onError: (error: unknown) => {
          if (isAxiosError(error) && error.response?.data) {
            editForm.setErrors(error.response.data as Record<string, React.ReactNode>);
          }
        },
      }
    );
  });

  const handleEditClick = (org: AdminOrganization) => {
    setEditingOrg(org);
    editForm.setValues({ name: org.name });
  };

  const handleDelete = () => {
    if (!deletingOrgId) return;
    deleteOrg.mutate(deletingOrgId, {
      onSuccess: () => setDeletingOrgId(null),
    });
  };

  const getOwner = (org: AdminOrganization) => {
    const owner = org.members.find((m) => m.role === 'owner');
    return owner ? `${owner.first_name} ${owner.last_name}` : '—';
  };

  const columns: Column<AdminOrganization>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { 
      key: 'slug', 
      header: 'Slug', 
      sortable: true,
      render: (item) => <Badge variant="light" color="gray">{item.slug}</Badge>
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (item) => getOwner(item)
    },
    {
      key: 'members',
      header: 'Members',
      render: (item) => item.members.length
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <Group gap="xs">
          <Button size="xs" variant="subtle" onClick={() => handleEditClick(item)}>
            Edit
          </Button>
          <Button
            size="xs"
            variant="subtle"
            color="red"
            onClick={() => setDeletingOrgId(item.id)}
          >
            Delete
          </Button>
        </Group>
      )
    }
  ];

  return (
    <>
      <PageHeader title="Organizations" action={{ label: 'New Organization', onClick: openCreate }} />

      <DataTable
        data={orgs}
        columns={columns}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        onSearch={(query) => { setSearch(query); setPage(1); }}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={(field, direction) => { setSortField(field); setSortDirection(direction); }}
        totalPages={totalPages}
        totalCount={data?.count ?? 0}
      />

      <Modal opened={createOpened} onClose={closeCreate} title="New Organization">
        <form onSubmit={handleCreate}>
          <Stack>
            <TextInput label="Organization Name" required {...createForm.getInputProps('name')} />
            <Select
              label="Owner"
              placeholder="Select owner"
              data={userOptions}
              searchable
              required
              {...createForm.getInputProps('owner_email')}
            />
            <Group justify="flex-end" mt="sm">
              <Button variant="outline" onClick={closeCreate}>Cancel</Button>
              <Button type="submit" loading={createOrg.isPending}>Create</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal opened={!!editingOrg} onClose={() => setEditingOrg(null)} title="Edit Organization">
        <form onSubmit={handleEdit}>
          <Stack>
            <TextInput label="Organization Name" required {...editForm.getInputProps('name')} />
            <Group justify="flex-end" mt="sm">
              <Button variant="outline" onClick={() => setEditingOrg(null)}>Cancel</Button>
              <Button type="submit" loading={updateOrg.isPending}>Save</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal opened={!!deletingOrgId} onClose={() => setDeletingOrgId(null)} title="Delete Organization">
        <Text>Are you sure you want to delete this organization? All associated data will be lost.</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={() => setDeletingOrgId(null)}>Cancel</Button>
          <Button color="red" loading={deleteOrg.isPending} onClick={handleDelete}>Delete</Button>
        </Group>
      </Modal>
    </>
  );
}
