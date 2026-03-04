import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHaptics } from '../../hooks/useHaptics';
import { useColorScheme } from '../../hooks/useColorScheme';

const TAB_ICONS: Record<string, string> = {
  Today: '☀️',
  Planner: '📅',
  Bible: '📖',
  Settings: '⚙️',
};

const TAB_LABELS: Record<string, string> = {
  Today: 'Today',
  Planner: 'Planner',
  Bible: 'Bible',
  Settings: 'Settings',
};

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const scale = useSharedValue(1);
  const haptics = useHaptics();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.85, { damping: 15, stiffness: 400 }),
      withSpring(1.0, { damping: 10, stiffness: 200 })
    );
    haptics.select();
  };

  return (
    <Animated.View style={[styles.iconWrapper, animatedStyle]}>
      <Text style={styles.icon}>{TAB_ICONS[name]}</Text>
      {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
    </Animated.View>
  );
}

export default function CustomBottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useColorScheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom + 4,
          backgroundColor: isDark ? 'rgba(28,28,30,0.95)' : 'rgba(255,255,255,0.95)',
          borderTopColor: colors.border,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const color = isFocused ? colors.primary : colors.textSecondary;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.7}
            onPress={onPress}
            style={styles.tab}
          >
            <TabIcon name={route.name} focused={isFocused} color={color} />
            <Text style={[styles.label, { color, fontFamily: isFocused ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
              {TAB_LABELS[route.name]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 32,
  },
  icon: {
    fontSize: 22,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
});
