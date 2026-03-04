import { useColorScheme as useRNColorScheme } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { Colors, DarkColors } from '../utils/colors';

export function useColorScheme() {
  const systemScheme = useRNColorScheme();
  const { theme } = useSettingsStore();

  const isDark = theme === 'dark' || (theme === 'auto' && systemScheme === 'dark');
  const colors = isDark ? DarkColors : Colors;

  return { isDark, colors, systemScheme };
}
