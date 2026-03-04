import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useHaptics } from '../../hooks/useHaptics';
import { useColorScheme } from '../../hooks/useColorScheme';

interface AnimatedCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  color?: string;
  size?: number;
}

export default function AnimatedCheckbox({ checked, onToggle, color, size = 24 }: AnimatedCheckboxProps) {
  const { colors } = useColorScheme();
  const haptics = useHaptics();
  const scale = useSharedValue(1);
  const fillOpacity = useSharedValue(checked ? 1 : 0);
  const checkColor = color ?? colors.primary;

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.85, { damping: 4, stiffness: 400 }),
      withSpring(1.0, { damping: 10, stiffness: 200 })
    );
    if (!checked) {
      fillOpacity.value = withTiming(1, { duration: 150 });
      haptics.success();
    } else {
      fillOpacity.value = withTiming(0, { duration: 100 });
      haptics.light();
    }
    onToggle();
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    opacity: fillOpacity.value,
  }));

  const borderColor = checked ? checkColor : colors.border;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={styles.touchable}>
      <Animated.View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: borderColor,
            borderWidth: checked ? 0 : 2,
          },
          containerStyle,
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: checkColor,
            },
            fillStyle,
          ]}
        >
          <Animated.Text style={[styles.check, { fontSize: size * 0.55 }]}>✓</Animated.Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    padding: 4,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  check: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    lineHeight: undefined,
  },
});
