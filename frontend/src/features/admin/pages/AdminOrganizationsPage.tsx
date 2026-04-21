import { useState } from 'react';
import {
  Badge,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { PageHeader } from '../../../shared/components/ui/PageHeader';
import { EmptyState } from '../../../shared/components/ui/EmptyState';
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
  const { data: orgs, isLoading } = useAdminOrgs();
  const { data: users } = useAdminUsers();
  const createOrg = useCreateAdminOrg();
  const updateOrg = useUpdateAdminOrg();
  const deleteOrg = useDeleteAdminOrg();

  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure();
  const [editingOrg, setEditingOrg] = useState<AdminOrganization | null>(null);
  const [deletingOrgId, setDeletingOrgId] = useState<string | null>(null);

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
      onError: (error: any) => {
        if (error.response?.data) {
          createForm.setErrors(error.response.data);
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
        onError: (error: any) => {
          if (error.response?.data) {
            editForm.setErrors(error.response.data);
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

  return (
    <>
      <PageHeader title="Organizations" action={{ label: 'New Organization', onClick: openCreate }} />

      {isLoading ? (
        <Text c="dimmed">Loading...</Text>
      ) : !orgs?.length ? (
        <EmptyState message="No organizations found." />
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Slug</Table.Th>
              <Table.Th>Owner</Table.Th>
              <Table.Th>Members</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {orgs.map((org) => (
              <Table.Tr key={org.id}>
                <Table.Td>{org.name}</Table.Td>
                <Table.Td>
                  <Badge variant="light" color="gray">{org.slug}</Badge>
                </Table.Td>
                <Table.Td>{getOwner(org)}</Table.Td>
                <Table.Td>{org.members.length}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button size="xs" variant="subtle" onClick={() => handleEditClick(org)}>
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      variant="subtle"
                      color="red"
                      onClick={() => setDeletingOrgId(org.id)}
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
