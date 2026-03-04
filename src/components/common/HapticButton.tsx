import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useHaptics } from '../../hooks/useHaptics';
import { useColorScheme } from '../../hooks/useColorScheme';

interface HapticButtonProps {
  onPress: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function HapticButton({
  onPress,
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}: HapticButtonProps) {
  const { colors } = useColorScheme();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (disabled || loading) return;
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    });
    haptics.light();
    onPress();
  };

  const bgColor = {
    primary: colors.primary,
    secondary: colors.primarySubtle,
    ghost: 'transparent',
    danger: colors.danger,
  }[variant];

  const textColor = {
    primary: '#FFFFFF',
    secondary: colors.primary,
    ghost: colors.primary,
    danger: '#FFFFFF',
  }[variant];

  const sizeStyles = {
    sm: { height: 36, paddingHorizontal: 14, borderRadius: 10 },
    md: { height: 48, paddingHorizontal: 20, borderRadius: 14 },
    lg: { height: 56, paddingHorizontal: 24, borderRadius: 16 },
  }[size];

  const fontSize = { sm: 14, md: 16, lg: 17 }[size];

  return (
    <AnimatedTouchable
      onPress={handlePress}
      activeOpacity={0.9}
      disabled={disabled || loading}
      style={[
        styles.button,
        sizeStyles,
        { backgroundColor: bgColor, opacity: disabled ? 0.5 : 1 },
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor, fontSize, fontFamily: 'Inter_600SemiBold' }, textStyle]}>
          {icon ? `${icon}  ${label}` : label}
        </Text>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    letterSpacing: -0.2,
  },
});
