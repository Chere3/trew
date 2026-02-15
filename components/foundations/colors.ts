/**
 * Color Palette
 * Professional SaaS design - clean red for action, Zinc neutrals dominant
 * Aligned with modern design systems (Linear, Vercel, Stripe)
 */

export const colors = {
  // Primary colors - Crisp rose for action (Tailwind Rose scale)
  // primary color: E11D48
  primary: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
    950: '#4c0519',
  },

  // Secondary colors - Zinc-based professional neutrals
  secondary: {
    50: '#fafafa',   // Very light zinc
    100: '#f4f4f5',  // Light zinc
    200: '#e4e4e7',  // Soft zinc
    300: '#d4d4d8',  // Medium zinc
    400: '#a1a1aa',  // Muted zinc
    500: '#71717a',  // Soft zinc-gray
    600: '#52525b',  // Medium zinc-gray
    700: '#3f3f46',  // Deep zinc-gray
    800: '#27272a',  // Very deep zinc-gray
    900: '#18181b',  // Dark zinc-gray
    950: '#09090b',  // Near black zinc
  },

  // Accent colors - Subtle pastel tones
  accent: {
    50: '#faf5ff',   // Very light lavender
    100: '#f3e8ff',  // Light lavender
    200: '#e9d5ff',  // Soft lavender
    300: '#d8b5ff',  // Pastel purple
    400: '#c089ff',  // Soft purple-pink
    500: '#a855f7',  // Medium lavender
    600: '#9333ea',  // Deeper lavender
    700: '#7e22ce',  // Deep lavender
    800: '#6b21a8',  // Very deep lavender
    900: '#581c87',  // Darkest lavender
    950: '#3b0764',  // Near black lavender
  },

  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Neutral colors - Zinc-based professional grays (matches secondary)
  neutral: {
    50: '#fafafa',   // Very light zinc
    100: '#f4f4f5',  // Light zinc
    200: '#e4e4e7',  // Soft zinc
    300: '#d4d4d8',  // Medium zinc
    400: '#a1a1aa',  // Muted zinc
    500: '#71717a',  // Soft zinc-gray
    600: '#52525b',  // Medium zinc-gray
    700: '#3f3f46',  // Deep zinc-gray
    800: '#27272a',  // Very deep zinc-gray
    900: '#18181b',  // Dark zinc-gray
    950: '#09090b',  // Near black zinc
  },
} as const;

export type Colors = typeof colors;
