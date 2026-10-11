/**
 * CineShow Design System — Color Tokens
 * Use this module to reference theme colors in JavaScript, charts, and styling utilities.
 * Easily customize any brand, surface, or tier colors here.
 */

export const colors = {
  // Brand identity
  brand: {
    primary: '#f84464',
    primaryHover: '#e03150',
    primaryDark: '#d82d4b',
    primaryForeground: '#ffffff',
    glow: 'rgba(248, 68, 100, 0.35)',
    glowSubtle: 'rgba(248, 68, 100, 0.15)',
    gradient: 'linear-gradient(135deg, #f84464 0%, #d82d4b 100%)',
  },

  // Accents
  accents: {
    amber: '#f59e0b',
    amberHover: '#d97706',
    amberGlow: 'rgba(245, 158, 11, 0.25)',
    amberSoft: 'rgba(245, 158, 11, 0.15)',

    cyan: '#06b6d4',
    cyanGlow: 'rgba(6, 182, 212, 0.2)',
    cyanSoft: 'rgba(6, 182, 212, 0.12)',

    purple: '#a855f7',
    purpleGlow: 'rgba(168, 85, 247, 0.2)',
    purpleSoft: 'rgba(168, 85, 247, 0.12)',

    emerald: '#10b981',
    emeraldGlow: 'rgba(16, 185, 129, 0.25)',
    emeraldSoft: 'rgba(16, 185, 129, 0.12)',

    destructive: '#ef4444',
    destructiveHover: '#dc2626',
    destructiveSoft: 'rgba(239, 68, 68, 0.12)',
  },

  // Cinema Midnight Surfaces & Backgrounds
  surfaces: {
    app: '#080c14',
    surface1: '#0e1524',
    surface2: '#141e33',
    surface3: '#1a2642',
    card: '#141e33',
    cardGlass: 'rgba(20, 30, 51, 0.75)',
  },

  // Borders & Dividers
  borders: {
    subtle: '#1c273e',
    medium: '#263554',
    active: '#f84464',
  },

  // Text Hierarchy
  text: {
    white: '#f8fafc',
    heading: '#e2e8f0',
    body: '#94a3b8',
    muted: '#64748b',
  },

  // Seat Matrix Tiers
  tiers: {
    recliner: '#f59e0b',
    premium: '#a855f7',
    regular: '#06b6d4',
    booked: '#ef4444',
  },

  // Chart Gradients & Visualizations
  charts: {
    revenueLineStart: '#f84464',
    revenueLineEnd: '#f59e0b',
    revenueFill: '#f84464',
    gridStroke: 'rgba(255, 255, 255, 0.06)',
    axisTick: '#8b8e99',
    cursorStroke: 'rgba(248, 68, 100, 0.4)',
  },
}

export default colors
