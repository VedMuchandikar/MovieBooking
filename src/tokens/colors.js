/**
 * CineShow Design System — Color Tokens (Nordic Heritage Arthouse Cinema Theme)
 * Inspired by Bio Fågel Blå Stockholm 1926
 * Use this module to reference theme colors in JavaScript, charts, and styling utilities.
 */

export const colors = {
  // Brand identity
  brand: {
    primary: '#222226',
    primaryHover: '#111113',
    primaryDark: '#050505',
    primaryForeground: '#ffffff',
    glow: 'rgba(194, 120, 47, 0.22)',
    glowSubtle: 'rgba(34, 34, 38, 0.08)',
    gradient: 'linear-gradient(135deg, #222226 0%, #111113 100%)',
  },

  // Accents
  accents: {
    amber: '#c2782f',
    amberHover: '#aa6522',
    amberGlow: 'rgba(194, 120, 47, 0.25)',
    amberSoft: 'rgba(194, 120, 47, 0.12)',

    cyan: '#607d9b',
    cyanGlow: 'rgba(96, 125, 155, 0.25)',
    cyanSoft: 'rgba(96, 125, 155, 0.12)',

    purple: '#8b7355',
    purpleGlow: 'rgba(139, 115, 85, 0.22)',
    purpleSoft: 'rgba(139, 115, 85, 0.12)',

    emerald: '#3d7a5a',
    emeraldGlow: 'rgba(61, 122, 90, 0.25)',
    emeraldSoft: 'rgba(61, 122, 90, 0.12)',

    destructive: '#b85244',
    destructiveHover: '#9e3f32',
    destructiveSoft: 'rgba(184, 82, 68, 0.12)',
  },

  // Nordic Warm Surfaces & Backgrounds
  surfaces: {
    app: '#f9f6f0',
    surface1: '#f3efe6',
    surface2: '#ffffff',
    surface3: '#ede7da',
    card: '#ffffff',
    cardGlass: 'rgba(255, 255, 255, 0.92)',
  },

  // Borders & Dividers
  borders: {
    subtle: '#eae4d8',
    medium: '#d8d0c2',
    active: '#222226',
  },

  // Text Hierarchy
  text: {
    white: '#ffffff',
    heading: '#18181b',
    body: '#403d38',
    muted: '#716c64',
  },

  // Seat Matrix Tiers
  tiers: {
    recliner: '#c2782f',
    premium: '#8b7355',
    regular: '#607d9b',
    booked: '#a39c91',
  },

  // Chart Gradients & Visualizations
  charts: {
    revenueLineStart: '#c2782f',
    revenueLineEnd: '#aa6522',
    revenueFill: '#c2782f',
    gridStroke: 'rgba(34, 34, 38, 0.08)',
    axisTick: '#716c64',
    cursorStroke: 'rgba(194, 120, 47, 0.4)',
  },
}

export default colors
