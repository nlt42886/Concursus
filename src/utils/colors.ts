export const Colors = {
  primary: '#6366F1',
  primaryLight: '#A5B4FC',
  primaryDark: '#4338CA',
  primarySubtle: '#EEF2FF',

  success: '#34C759',
  warning: '#FF9F0A',
  danger: '#FF3B30',

  textPrimary: '#1C1C1E',
  textSecondary: '#6E6E73',
  textTertiary: '#AEAEB2',

  surface: '#FFFFFF',
  surfaceAlt: '#F2F2F7',
  border: '#E5E5EA',
  divider: '#C6C6C8',

  background: '#F2F2F7',

  // iOS-like system colors
  systemBlue: '#007AFF',
  systemGreen: '#34C759',
  systemRed: '#FF3B30',
  systemOrange: '#FF9500',
  systemPurple: '#AF52DE',
  systemPink: '#FF2D55',
  systemTeal: '#5AC8FA',
  systemYellow: '#FFCC00',

  // Task block colors (8 choices)
  taskColors: [
    '#6366F1', // indigo (default)
    '#EC4899', // pink
    '#F59E0B', // amber
    '#22C55E', // green
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#EF4444', // red
    '#06B6D4', // cyan
  ],
};

export const DarkColors = {
  ...Colors,
  textPrimary: '#F2F2F7',
  textSecondary: '#AEAEB2',
  textTertiary: '#636366',

  surface: '#1C1C1E',
  surfaceAlt: '#2C2C2E',
  border: '#38383A',
  divider: '#48484A',

  background: '#000000',
};

export const cardShadow = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
};

export const cardShadowStrong = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 16,
  elevation: 6,
};
