import { View, StyleSheet, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, useEffect } from 'react-native-reanimated';
import { useColorScheme } from '../../hooks/useColorScheme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  color?: string;
  showLabel?: boolean;
  label?: string;
}

export default function ProgressBar({ progress, height = 6, color, showLabel = false, label }: ProgressBarProps) {
  const { colors } = useColorScheme();
  const width = useSharedValue(0);
  const barColor = color ?? colors.primary;

  useEffect(() => {
    width.value = withTiming(Math.min(Math.max(progress, 0), 1), { duration: 600 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
            {label ?? 'Progress'}
          </Text>
          <Text style={[styles.label, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor: colors.surfaceAlt, borderRadius: height / 2 }]}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: barColor, height, borderRadius: height / 2 },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    minWidth: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
  },
});
