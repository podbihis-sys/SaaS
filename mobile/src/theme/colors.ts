export const colors = {
  background: '#ffffff',
  foreground: '#0a0a0a',
  muted: '#f4f4f5',
  mutedForeground: '#71717a',
  border: '#e4e4e7',
  primary: '#6366f1',
  primaryForeground: '#ffffff',
  primary50: '#eef2ff',
  primary100: '#e0e7ff',
  primary600: '#4f46e5',
  success: '#10b981',
  warning: '#f59e0b',
  destructive: '#ef4444',
} as const;

export type ColorName = keyof typeof colors;
