import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingStackParamList } from '../../types/navigation.types';
import { useSettingsStore } from '../../store/settingsStore';
import { useBibleStore } from '../../store/bibleStore';
import { ALL_PLANS } from '../../utils/planDefinitions';
import HapticButton from '../../components/common/HapticButton';
import { useHaptics } from '../../hooks/useHaptics';
import { PlanId } from '../../types/bible.types';
import { Colors, cardShadow } from '../../utils/colors';

type Props = { navigation: StackNavigationProp<OnboardingStackParamList, 'BiblePlanSetup'> };

const PLAN_EMOJIS: Record<string, string> = {
  'mcheyne-one-year': '📚',
  'genesis-to-revelation': '🌅',
  'chronological-one-year': '🗓',
  '90-day': '⚡',
  'nt-30-days': '✝️',
  'psalms-proverbs': '🎵',
  'ot-one-year': '📜',
};

export default function BiblePlanSetupScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId | null>(null);
  const [loading, setLoading] = useState(false);
  const setHasOnboarded = useSettingsStore((s) => s.setHasOnboarded);
  const setActivePlan = useBibleStore((s) => s.setActivePlan);

  const handleSkip = async () => {
    haptics.light();
    await setHasOnboarded(true);
  };

  const handleStart = async () => {
    if (!selectedPlanId) return;
    setLoading(true);
    haptics.success();
    await setActivePlan(selectedPlanId);
    await setHasOnboarded(true);
    setLoading(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose a Bible Plan</Text>
        <Text style={styles.subtitle}>
          Select a plan to follow. You can change this any time in the Bible tab.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {ALL_PLANS.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              onPress={() => { haptics.select(); setSelectedPlanId(plan.id); }}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                ]}
              >
                <View style={styles.planTop}>
                  <Text style={styles.planEmoji}>{PLAN_EMOJIS[plan.id] ?? '📖'}</Text>
                  <View style={styles.planInfo}>
                    <Text style={[styles.planName, isSelected && styles.planNameSelected]}>
                      {plan.name}
                    </Text>
                    <View style={styles.planMeta}>
                      <Text style={styles.planMetaText}>📅 {plan.totalDays} days</Text>
                      <Text style={styles.planMetaText}>⏱ ~{plan.estimatedMinutesPerDay} min/day</Text>
                    </View>
                  </View>
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>
                <Text style={styles.planDesc}>{plan.description}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <HapticButton
          onPress={handleStart}
          label="Start Reading Plan"
          size="lg"
          disabled={!selectedPlanId}
          loading={loading}
          style={styles.startBtn}
        />
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20, gap: 8 },
  title: {
    fontSize: 28,
    color: Colors.textPrimary,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },
  list: { paddingHorizontal: 20, gap: 12 },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 10,
    ...cardShadow,
  },
  planCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySubtle,
  },
  planTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planEmoji: { fontSize: 30 },
  planInfo: { flex: 1 },
  planName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  planNameSelected: { color: Colors.primary },
  planMeta: { flexDirection: 'row', gap: 12 },
  planMetaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
  planDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: Colors.primary },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: Colors.primary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 10,
    backgroundColor: Colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  startBtn: {},
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'Inter_500Medium',
  },
});
