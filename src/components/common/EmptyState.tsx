import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import HapticButton from './HapticButton';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ emoji = '✨', title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useColorScheme();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.title, { color: colors.textPrimary, fontFamily: 'Inter_600SemiBold' }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>{subtitle}</Text>
      )}
      {actionLabel && onAction && (
        <HapticButton
          onPress={onAction}
          label={actionLabel}
          variant="secondary"
          size="md"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 12,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: 8,
  },
});
