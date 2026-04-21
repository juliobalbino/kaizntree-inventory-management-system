import { useCallback, useState } from 'react';
import {
  Badge,
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
import { DataTable } from '../../../shared/components/ui/DataTable';
import type { Column } from '../../../shared/components/ui/DataTable';
import { useCurrentUser } from '../../auth/hooks/useAuth';
import { useAddMember, useMembers, useRemoveMember } from '../hooks/useMembers';
import type { Member } from '../model/types';

const PAGE_SIZE = 20;

export function MembersPage() {
  const { data: user } = useCurrentUser();
  const orgId = user?.organization?.id ?? '';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('email');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const params = {
    page,
    search: search || undefined,
    ordering: sortDirection === 'desc' ? `-${sortField}` : sortField,
    page_size: PAGE_SIZE,
  };

  const { data: paginatedMembers, isLoading } = useMembers(orgId || undefined, params);
  const addMember = useAddMember(orgId);
  const removeMember = useRemoveMember(orgId);

  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure();
  const [deletingMemberId, setDeletingMemberId] = useState<number | null>(null);

  const addForm = useForm({
    initialValues: { email: '', password: '', first_name: '', last_name: '' },
    validate: {
      email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Invalid email'),
      password: (v) => (v.length >= 8 ? null : 'Minimum 8 characters'),
      first_name: (v) => (v.trim() ? null : 'Required'),
      last_name: (v) => (v.trim() ? null : 'Required'),
    },
  });

  const handleAdd = addForm.onSubmit((values) => {
    addMember.mutate(values, {
      onSuccess: () => {
        closeAdd();
        addForm.reset();
      },
    });
  });

  const handleDelete = () => {
    if (!deletingMemberId) return;
    removeMember.mutate(deletingMemberId, {
      onSuccess: () => setDeletingMemberId(null),
    });
  };

  const handleSearch = useCallback((q: string) => {
    setSearch(q);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
    setPage(1);
  }, []);

  const columns: Column<Member>[] = [
    { key: 'email', header: 'Email', sortable: true },
    { key: 'first_name', header: 'First Name', sortable: true },
    { key: 'last_name', header: 'Last Name', sortable: true },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (m) => (
        <Badge color={m.role === 'owner' ? 'indigo' : 'gray'}>{m.role}</Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (m) =>
        m.role === 'owner' ? null : (
          <Button
            size="xs"
            variant="subtle"
            color="red"
            onClick={() => setDeletingMemberId(m.id)}
          >
            Remove
          </Button>
        ),
    },
  ];

  const members = paginatedMembers?.results ?? [];
  const totalCount = paginatedMembers?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      <PageHeader
        title="Members"
        description="Manage who has access to your organization."
        action={{ label: 'Add Member', onClick: openAdd }}
      />

      <DataTable
        data={members}
        columns={columns}
        totalCount={totalCount}
        totalPages={totalPages}
        isLoading={isLoading}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onSearch={handleSearch}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        searchPlaceholder="Search by name or email..."
        emptyStateMessage="No members yet. Add members to your organization to get started."
      />

      <Modal opened={addOpened} onClose={closeAdd} title="Add Member">
        <form onSubmit={handleAdd}>
          <Stack>
            <TextInput label="Email" placeholder="user@example.com" required {...addForm.getInputProps('email')} />
            <Group grow>
              <TextInput label="First Name" required {...addForm.getInputProps('first_name')} />
              <TextInput label="Last Name" required {...addForm.getInputProps('last_name')} />
            </Group>
            <PasswordInput label="Password" required {...addForm.getInputProps('password')} />
            <Group justify="flex-end" mt="sm">
              <Button variant="outline" onClick={closeAdd}>Cancel</Button>
              <Button type="submit" loading={addMember.isPending}>Add</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal opened={!!deletingMemberId} onClose={() => setDeletingMemberId(null)} title="Remove Member">
        <Text>Are you sure you want to remove this member from the organization?</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={() => setDeletingMemberId(null)}>Cancel</Button>
          <Button color="red" loading={removeMember.isPending} onClick={handleDelete}>Remove</Button>
        </Group>
      </Modal>
    </>
  );
}
