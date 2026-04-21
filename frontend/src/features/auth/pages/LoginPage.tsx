import { Box, Button, Container, Paper, PasswordInput, Stack, TextInput, Title, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Navigate } from 'react-router-dom';
import { useLogin, useCurrentUser } from '../hooks/useAuth';
import { z } from 'zod';
import { zodResolver } from '../../../lib/zod-resolver';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export function LoginPage() {
  const login = useLogin();
  const { data: user } = useCurrentUser();

  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: zodResolver(loginSchema),
  });

  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/organizations" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'var(--mantine-color-gray-0)' }}>
      <Container size={420} w="100%">
        <Stack align="center" mb="xl" gap={4}>
          <Title order={2}>Welcome back</Title>
          <Text c="dimmed" size="sm">Please enter your details to sign in</Text>
        </Stack>

        <Paper p={30} radius="md" shadow="sm">
          <form onSubmit={form.onSubmit((values) => login.mutate(values))}>
            <Stack>
              <TextInput
                label="Email"
                placeholder="you@example.com"
                required
                {...form.getInputProps('email')}
              />
              <PasswordInput
                label="Password"
                placeholder="Your password"
                required
                {...form.getInputProps('password')}
              />
              <Button type="submit" fullWidth mt="xs" loading={login.isPending}>
                Sign in
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
