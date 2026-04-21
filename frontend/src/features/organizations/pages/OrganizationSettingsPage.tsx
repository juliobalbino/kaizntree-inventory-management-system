import { useEffect } from 'react';
import { Badge, Button, Divider, Group, Paper, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { PageHeader } from '../../../shared/components/ui/PageHeader';
import { useCurrentUser } from '../../auth/hooks/useAuth';
import { useUpdateOrganization } from '../hooks/useOrganizations';

export function OrganizationSettingsPage() {
  const { data: user } = useCurrentUser();
  const org = user?.organization;
  const updateOrg = useUpdateOrganization();

  const form = useForm({
    initialValues: { name: '' },
    validate: {
      name: (v) => (v.trim() ? null : 'Required'),
    },
  });

  useEffect(() => {
    if (org) form.setValues({ name: org.name });
  }, [org?.id]);

  const handleSubmit = form.onSubmit((values) => {
    if (!org) return;
    updateOrg.mutate({ id: org.id, payload: values });
  });

  return (
    <>
      <PageHeader
        title="Organization Settings"
        description="Manage your organization's details."
      />

      <Paper p="lg" maw={560}>
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Organization Name"
              required
              {...form.getInputProps('name')}
            />
            <Divider />
            <Group gap="sm" align="center">
              <Text size="sm" fw={500}>Slug</Text>
              <Badge variant="light" color="gray" ff="monospace">
                {org?.slug ?? '—'}
              </Badge>
            </Group>
            <Group justify="flex-end" mt="xs">
              <Button type="submit" loading={updateOrg.isPending}>
                Save changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </>
  );
}
