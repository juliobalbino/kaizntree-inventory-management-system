import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'indigo',
  primaryShade: { light: 5, dark: 6 },
  defaultRadius: 'sm',

  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  fontFamilyMonospace: '"JetBrains Mono", ui-monospace, monospace',

  fontSizes: {
    xs: '12px',
    sm: '13px',
    md: '14px',
    lg: '15px',
    xl: '16px',
  },

  lineHeights: {
    xs: '1.4',
    sm: '1.5',
    md: '1.55',
    lg: '1.5',
    xl: '1.5',
  },

  radius: {
    xs: '3px',
    sm: '6px',
    md: '8px',
    lg: '10px',
    xl: '16px',
  },

  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '20px',
    xl: '32px',
  },

  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.04)',
    md: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.06), 0 4px 6px -4px rgba(0,0,0,0.06)',
  },

  headings: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '600',
    sizes: {
      h1: { fontSize: '22px', lineHeight: '1.3' },
      h2: { fontSize: '15px', lineHeight: '1.4' },
      h3: { fontSize: '14px', lineHeight: '1.4' },
    },
  },

  components: {
    Button: { defaultProps: { size: 'sm', radius: 'sm' } },
    TextInput: { defaultProps: { size: 'sm', radius: 'sm' } },
    PasswordInput: { defaultProps: { size: 'sm', radius: 'sm' } },
    Select: { defaultProps: { size: 'sm', radius: 'sm' } },
    Textarea: { defaultProps: { size: 'sm', radius: 'sm' } },
    NumberInput: { defaultProps: { size: 'sm', radius: 'sm' } },
    Paper: { defaultProps: { radius: 'md', withBorder: true } },
    Badge: { defaultProps: { variant: 'light', radius: 'xl' } },
    Modal: {
      defaultProps: {
        radius: 'md',
        centered: true,
        overlayProps: { backgroundOpacity: 0.5, blur: 2 },
      },
    },
    Table: { defaultProps: { verticalSpacing: 'sm', horizontalSpacing: 'md' } },
  },
});
