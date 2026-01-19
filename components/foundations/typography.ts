/**
 * Typography Scale
 * Typography tokens optimized for conversational UI
 */

export const typography = {
  // Font families
  fontFamily: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "ui-monospace, 'SF Mono', Monaco, 'Cascadia Code', monospace",
  },

  // Font sizes
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],   // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }],         // 48px
  },

  // Font weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Letter spacing - Modernist aesthetic with tighter tracking
  letterSpacing: {
    tighter: '-0.03em',    // Slightly less tight for readability
    tight: '-0.015em',     // Subtle tight tracking
    normal: '-0.01em',     // Slightly tighter than default for modern feel
    wide: '0.01em',        // Subtle wide tracking
    wider: '0.025em',      // Moderate wide tracking
    widest: '0.05em',      // Wide tracking for emphasis
  },
} as const;

export type Typography = typeof typography;
