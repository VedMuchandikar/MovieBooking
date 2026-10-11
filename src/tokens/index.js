/**
 * CineShow Design System Tokens Entrypoint
 * Export all design tokens (colors, typography, spacing, etc.) for easy consumption.
 */

export { colors, default as defaultColors } from './colors'
export { typography, default as defaultTypography } from './typography'

import { colors } from './colors'
import { typography } from './typography'

export const tokens = {
  colors,
  typography,
}

export default tokens
