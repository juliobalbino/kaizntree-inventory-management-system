import { useState } from 'react';
import {
  Button,
  Group,
  Modal,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { PageHeader } from '../../../shared/components/ui/PageHeader';
import { EmptyState } from '../../../shared/components/ui/EmptyState';
import { DataTable, type Column } from '../../../shared/components/ui/DataTable';
import {
  useAdminUsers,
  useCreateAdminUser,
  useUpdateAdminUser,
  useDeleteAdminUser,
} from '../hooks/useAdmin';
import type { AdminUser } from '../model/types';
import { z } from 'zod';
import { zodResolver } from '../../../lib/zod-resolver';

const userSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
});

const editUserSchema = z.object({
  email: z.string().email('Invalid email'),
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  password: z.string().refine((val) => !val || val.length >= 8, {
    message: 'Minimum 8 characters',
  }).optional().or(z.literal('')),
});

export function AdminUsersPage() {
  const createUser = useCreateAdminUser();
  const updateUser = useUpdateAdminUser();
  const deleteUser = useDeleteAdminUser();

  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure();
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string>('email');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { data, isLoading } = useAdminUsers({
    page,
    page_size: pageSize,
    search,
    ordering: sortDirection === 'desc' ? `-${sortField}` : sortField,
  });

  const users = data?.results ?? [];
  const totalPages = data?.count ? Math.ceil(data.count / pageSize) : 1;



  const createForm = useForm({
    initialValues: { email: '', password: '', first_name: '', last_name: '' },
    validate: zodResolver(userSchema),
  });

  const editForm = useForm({
    initialValues: { email: '', first_name: '', last_name: '', password: '' },
    validate: zodResolver(editUserSchema),
  });

  const handleCreate = createForm.onSubmit((values) => {
    createUser.mutate(values, {
      onSuccess: () => {
        closeCreate();
        createForm.reset();
      },
      onError: (error: any) => {
        if (error.response?.data) {
          createForm.setErrors(error.response.data);
        }
      },
    });
  });

  const handleEdit = editForm.onSubmit((values) => {
    if (!editingUser) return;
    const payload = { ...values };
    if (!payload.password) delete payload.password;
    updateUser.mutate(
      { id: editingUser.id, payload },
      {
        onSuccess: () => {
          setEditingUser(null);
          editForm.reset();
        },
        onError: (error: any) => {
          if (error.response?.data) {
            editForm.setErrors(error.response.data);
          }
        },
      }
    );
  });

  const handleEditClick = (user: AdminUser) => {
    setEditingUser(user);
    editForm.setValues({ email: user.email, first_name: user.first_name, last_name: user.last_name, password: '' });
  };

  const handleDelete = () => {
    if (!deletingUserId) return;
    deleteUser.mutate(deletingUserId, {
      onSuccess: () => setDeletingUserId(null),
    });
  };

  const columns: Column<AdminUser>[] = [
    { key: 'email', header: 'Email', sortable: true },
    { key: 'first_name', header: 'First Name', sortable: true },
    { key: 'last_name', header: 'Last Name', sortable: true },
    {
      key: 'organizations',
      header: 'Organizations',
      render: (item) =>
        item.organizations.length ? item.organizations.map((o) => o.name).join(', ') : '—',
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
            onClick={() => setDeletingUserId(item.id)}
          >
            Delete
          </Button>
        </Group>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Users" action={{ label: 'New User', onClick: openCreate }} />

      <DataTable
        data={users}
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

      <Modal opened={createOpened} onClose={closeCreate} title="New User">
        <form onSubmit={handleCreate}>
          <Stack>
            <TextInput label="Email" placeholder="user@example.com" required {...createForm.getInputProps('email')} />
            <TextInput label="First Name" required {...createForm.getInputProps('first_name')} />
            <TextInput label="Last Name" required {...createForm.getInputProps('last_name')} />
            <PasswordInput label="Password" required {...createForm.getInputProps('password')} />
            <Group justify="flex-end" mt="sm">
              <Button variant="outline" onClick={closeCreate}>Cancel</Button>
              <Button type="submit" loading={createUser.isPending}>Create</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal opened={!!editingUser} onClose={() => setEditingUser(null)} title="Edit User">
        <form onSubmit={handleEdit}>
          <Stack>
            <TextInput label="Email" required {...editForm.getInputProps('email')} />
            <TextInput label="First Name" required {...editForm.getInputProps('first_name')} />
            <TextInput label="Last Name" required {...editForm.getInputProps('last_name')} />
            <PasswordInput
              label="New Password"
              placeholder="Leave blank to keep current"
              {...editForm.getInputProps('password')}
            />
            <Group justify="flex-end" mt="sm">
              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button type="submit" loading={updateUser.isPending}>Save</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal opened={!!deletingUserId} onClose={() => setDeletingUserId(null)} title="Delete User">
        <Text>Are you sure you want to delete this user? This action cannot be undone.</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={() => setDeletingUserId(null)}>Cancel</Button>
          <Button color="red" loading={deleteUser.isPending} onClick={handleDelete}>Delete</Button>
        </Group>
      </Modal>
    </>
  );
}
