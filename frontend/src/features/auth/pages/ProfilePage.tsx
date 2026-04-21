import { useEffect } from 'react';
import { Button, Divider, Group, Paper, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import { PageHeader } from '../../../shared/components/ui/PageHeader';
import { useChangePassword, useCurrentUser, useUpdateProfile } from '../hooks/useAuth';

const profileSchema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
});

const passwordSchema = z.object({
  old_password: z.string().min(1, 'Required'),
  new_password: z.string().min(8, 'Minimum 8 characters'),
});

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export function ProfilePage() {
  const { data: user } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const profileForm = useForm<ProfileValues>({
    initialValues: { first_name: '', last_name: '' },
    validate: zodResolver(profileSchema),
  });

  const passwordForm = useForm<PasswordValues>({
    initialValues: { old_password: '', new_password: '' },
    validate: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) profileForm.setValues({ first_name: user.first_name, last_name: user.last_name });
  }, [user?.id]);

  const handleProfileSubmit = profileForm.onSubmit((values) => {
    updateProfile.mutate(values);
  });

  const handlePasswordSubmit = passwordForm.onSubmit((values) => {
    changePassword.mutate(values, {
      onSuccess: () => passwordForm.reset(),
    });
  });

  return (
    <>
      <PageHeader title="Profile" description="Manage your personal information and password." />

      <Stack gap="lg" maw={560}>
        <Paper p="lg">
          <Title order={3} mb="md">Personal Information</Title>
          <form onSubmit={handleProfileSubmit}>
            <Stack>
              <TextInput label="Email" value={user?.email ?? ''} disabled />
              <Group grow>
                <TextInput label="First Name" required {...profileForm.getInputProps('first_name')} />
                <TextInput label="Last Name" required {...profileForm.getInputProps('last_name')} />
              </Group>
              <Divider />
              <Group justify="flex-end">
                <Button type="submit" loading={updateProfile.isPending}>
                  Save changes
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>

        <Paper p="lg">
          <Title order={3} mb="md">Change Password</Title>
          <form onSubmit={handlePasswordSubmit}>
            <Stack>
              <PasswordInput label="Current Password" required {...passwordForm.getInputProps('old_password')} />
              <PasswordInput
                label="New Password"
                description="Minimum 8 characters"
                required
                {...passwordForm.getInputProps('new_password')}
              />
              <Divider />
              <Group justify="flex-end">
                <Button type="submit" loading={changePassword.isPending}>
                  Change password
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>

        {user?.organization && (
          <Paper p="lg">
            <TextInput label="Organization" value={user.organization.name} disabled />
          </Paper>
        )}
      </Stack>
    </>
  );
}
