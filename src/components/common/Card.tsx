import { View, StyleSheet, ViewStyle } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { cardShadow } from '../../utils/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  padding?: number;
}

export default function Card({ children, style, elevated = false, padding = 16 }: CardProps) {
  const { colors } = useColorScheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          padding,
        },
        elevated ? cardShadow : styles.flat,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  flat: {
    shadowOpacity: 0,
    elevation: 0,
  },
});
