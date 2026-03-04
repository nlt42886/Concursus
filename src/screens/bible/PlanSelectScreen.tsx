import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBibleStore } from '../../store/bibleStore';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useHaptics } from '../../hooks/useHaptics';
import { BibleStackParamList } from '../../types/navigation.types';
import HapticButton from '../../components/common/HapticButton';
import { ALL_PLANS } from '../../utils/planDefinitions';
import { PlanId } from '../../types/bible.types';
import { cardShadow } from '../../utils/colors';

type Nav = StackNavigationProp<BibleStackParamList, 'PlanSelect'>;

const PLAN_EMOJIS: Record<string, string> = {
  'mcheyne-one-year': '📚',
  'genesis-to-revelation': '🌅',
  'chronological-one-year': '🗓',
  '90-day': '⚡',
  'nt-30-days': '✝️',
  'psalms-proverbs': '🎵',
  'ot-one-year': '📜',
};

export default function PlanSelectScreen({ navigation }: { navigation: Nav }) {
  const insets = useSafeAreaInsets();
  const { colors } = useColorScheme();
  const haptics = useHaptics();
  const { activePlan, setActivePlan } = useBibleStore();

  const [selectedId, setSelectedId] = useState<PlanId | null>(activePlan?.planId ?? null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedId) return;
    const isSame = activePlan?.planId === selectedId;
    if (isSame) {
      navigation.goBack();
      return;
    }
    if (activePlan) {
      Alert.alert(
        'Change Reading Plan?',
        'Starting a new plan will reset your current progress. This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start New Plan',
            style: 'destructive',
            onPress: async () => {
              setLoading(true);
              haptics.success();
              await setActivePlan(selectedId);
              setLoading(false);
              navigation.goBack();
            },
          },
        ],
      );
    } else {
      setLoading(true);
      haptics.success();
      await setActivePlan(selectedId);
      setLoading(false);
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 16,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={[styles.backText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
            ‹ Back
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontFamily: 'Inter_600SemiBold' }]}>
          Reading Plans
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {ALL_PLANS.map((plan) => {
          const isSelected = selectedId === plan.id;
          const isCurrent = activePlan?.planId === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              onPress={() => { setSelectedId(plan.id); haptics.select(); }}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.planCard,
                  {
                    backgroundColor: isSelected ? colors.primarySubtle : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <View style={styles.planTop}>
                  <Text style={styles.planEmoji}>{PLAN_EMOJIS[plan.id] ?? '📖'}</Text>
                  <View style={styles.planInfo}>
                    <View style={styles.planNameRow}>
                      <Text
                        style={[
                          styles.planName,
                          {
                            color: isSelected ? colors.primary : colors.textPrimary,
                            fontFamily: 'Inter_600SemiBold',
                          },
                        ]}
                      >
                        {plan.name}
                      </Text>
                      {isCurrent && (
                        <View style={[styles.currentBadge, { backgroundColor: colors.primary }]}>
                          <Text style={styles.currentBadgeText}>Active</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.planMeta}>
                      <Text style={[styles.planMetaText, { color: colors.textSecondary }]}>
                        📅 {plan.totalDays} days
                      </Text>
                      <Text style={[styles.planMetaText, { color: colors.textSecondary }]}>
                        ⏱ ~{plan.estimatedMinutesPerDay} min/day
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.radio, { borderColor: isSelected ? colors.primary : colors.border }]}>
                    {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                  </View>
                </View>
                <Text style={[styles.planDesc, { color: colors.textSecondary }]}>{plan.description}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 8 }} />
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        <HapticButton
          onPress={handleConfirm}
          label={activePlan?.planId === selectedId ? 'Done' : 'Start This Plan'}
          size="lg"
          disabled={!selectedId}
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { minWidth: 60 },
  backText: { fontSize: 17 },
  headerTitle: { fontSize: 17, letterSpacing: -0.3 },
  headerRight: { minWidth: 60 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  planCard: {
    borderRadius: 18,
    borderWidth: 2,
    padding: 16,
    gap: 10,
    ...cardShadow,
  },
  planTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planEmoji: { fontSize: 30 },
  planInfo: { flex: 1 },
  planNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' },
  planName: { fontSize: 16, letterSpacing: -0.2 },
  currentBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  currentBadgeText: { color: '#FFFFFF', fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  planMeta: { flexDirection: 'row', gap: 12 },
  planMetaText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  planDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 11, height: 11, borderRadius: 5.5 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
