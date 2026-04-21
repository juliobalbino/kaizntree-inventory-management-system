import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { extractApiError } from '../../../lib/api-client';
import { changePassword, getCurrentUser, login, updateProfile } from '../api/auth.api';
import type { LoginPayload } from '../model/types';

export function useCurrentUser() {
  const token = localStorage.getItem('access_token');
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: async (tokens) => {
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);

      const user = await getCurrentUser();
      localStorage.setItem('user_role', user.role ?? '');
      queryClient.setQueryData(['auth', 'me'], user);

      notifications.show({
        title: 'Welcome!',
        message: `Logged in as ${user.email}`,
        color: 'green',
      });

      if (user.role === 'admin') {
        navigate('/admin/organizations');
      } else {
        navigate('/dashboard');
      }
    },
    onError: () => {
      notifications.show({
        title: 'Login failed',
        message: 'Invalid email or password.',
        color: 'red',
      });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (user) => {
      queryClient.setQueryData(['auth', 'me'], user);
      notifications.show({ title: 'Profile updated', message: '', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Update failed', message: 'Could not update profile.', color: 'red' });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      notifications.show({ title: 'Password changed', message: 'Your password has been updated.', color: 'green' });
    },
    onError: (error) => {
      const message = extractApiError(error) ?? 'Could not change password.';
      notifications.show({ title: 'Error', message, color: 'red' });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    queryClient.clear();
    navigate('/login');
  };
}
