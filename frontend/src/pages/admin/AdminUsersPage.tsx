import { useState } from 'react';
import {
  Button,
  Group,
  Modal,
  PasswordInput,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  useAdminUsers,
  useCreateAdminUser,
  useUpdateAdminUser,
  useDeleteAdminUser,
} from '../../features/admin/hooks';
import type { AdminUser } from '../../features/admin/types';

export function AdminUsersPage() {
  const { data: users, isLoading } = useAdminUsers();
  const createUser = useCreateAdminUser();
  const updateUser = useUpdateAdminUser();
  const deleteUser = useDeleteAdminUser();

  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure();
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  const createForm = useForm({
    initialValues: { email: '', password: '', first_name: '', last_name: '' },
    validate: {
      email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Invalid email'),
      password: (v) => (v.length >= 8 ? null : 'Minimum 8 characters'),
      first_name: (v) => (v.trim() ? null : 'Required'),
      last_name: (v) => (v.trim() ? null : 'Required'),
    },
  });

  const editForm = useForm({
    initialValues: { email: '', first_name: '', last_name: '', password: '' },
    validate: {
      email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Invalid email'),
      first_name: (v) => (v.trim() ? null : 'Required'),
      last_name: (v) => (v.trim() ? null : 'Required'),
      password: (v) => (!v || v.length >= 8 ? null : 'Minimum 8 characters'),
    },
  });

  const handleCreate = createForm.onSubmit((values) => {
    createUser.mutate(values, {
      onSuccess: () => {
        closeCreate();
        createForm.reset();
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

  return (
    <>
      <PageHeader title="Users" action={{ label: 'New User', onClick: openCreate }} />

      {isLoading ? (
        <Text c="dimmed">Loading...</Text>
      ) : !users?.length ? (
        <EmptyState message="No users found." />
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Email</Table.Th>
              <Table.Th>First Name</Table.Th>
              <Table.Th>Last Name</Table.Th>
              <Table.Th>Organizations</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>{user.email}</Table.Td>
                <Table.Td>{user.first_name}</Table.Td>
                <Table.Td>{user.last_name}</Table.Td>
                <Table.Td>
                  {user.organizations.length
                    ? user.organizations.map((o) => o.name).join(', ')
                    : '—'}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button size="xs" variant="subtle" onClick={() => handleEditClick(user)}>
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      variant="subtle"
                      color="red"
                      onClick={() => setDeletingUserId(user.id)}
                    >
                      Delete
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

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
