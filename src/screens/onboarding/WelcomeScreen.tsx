import { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingStackParamList } from '../../types/navigation.types';
import HapticButton from '../../components/common/HapticButton';

type Props = { navigation: StackNavigationProp<OnboardingStackParamList, 'Welcome'> };

const { width } = Dimensions.get('window');

const FEATURES = [
  { emoji: '📅', title: 'Smart Daily Planner', desc: 'Schedule tasks with time blocks, priorities & reminders' },
  { emoji: '📖', title: 'Bible Reading Plans', desc: '7 popular plans — read right in the app' },
  { emoji: '🔥', title: 'Streaks & Progress', desc: 'Build habits with daily tracking and streak counters' },
];

export default function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const logoOpacity = useSharedValue(0);
  const logoY = useSharedValue(30);
  const featuresOpacity = useSharedValue(0);
  const featuresY = useSharedValue(20);
  const btnOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    logoY.value = withDelay(200, withSpring(0, { damping: 20, stiffness: 120 }));
    featuresOpacity.value = withDelay(700, withTiming(1, { duration: 600 }));
    featuresY.value = withDelay(700, withSpring(0, { damping: 20, stiffness: 120 }));
    btnOpacity.value = withDelay(1100, withTiming(1, { duration: 500 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoY.value }],
  }));
  const featuresStyle = useAnimatedStyle(() => ({
    opacity: featuresOpacity.value,
    transform: [{ translateY: featuresY.value }],
  }));
  const btnStyle = useAnimatedStyle(() => ({ opacity: btnOpacity.value }));

  return (
    <LinearGradient colors={['#6366F1', '#4338CA']} style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <Animated.View style={[styles.hero, logoStyle]}>
        <Text style={styles.appIcon}>✝️</Text>
        <Text style={styles.appName}>Concursus</Text>
        <Text style={styles.tagline}>Plan your days.{'\n'}Grow your faith.</Text>
      </Animated.View>

      <Animated.View style={[styles.features, featuresStyle]}>
        {FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <View style={styles.featureIconWrap}>
              <Text style={styles.featureIcon}>{f.emoji}</Text>
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </Animated.View>

      <Animated.View style={[styles.footer, { paddingBottom: insets.bottom + 24 }, btnStyle]}>
        <HapticButton
          onPress={() => navigation.navigate('BiblePlanSetup')}
          label="Get Started"
          size="lg"
          style={styles.ctaBtn}
          textStyle={{ color: '#6366F1' }}
          variant="secondary"
        />
        <Text style={styles.footerNote}>Free · No account required</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  appIcon: { fontSize: 76, marginBottom: 4 },
  appName: {
    fontSize: 44,
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1.5,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 28,
  },
  features: { gap: 22, marginBottom: 48 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  featureIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: { fontSize: 26 },
  featureText: { flex: 1 },
  featureTitle: {
    fontSize: 17,
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 3,
  },
  featureDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  footer: { gap: 14, alignItems: 'center' },
  ctaBtn: { width: '100%', backgroundColor: '#FFFFFF' },
  footerNote: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'Inter_400Regular',
  },
});
