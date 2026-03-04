import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useBibleStore } from '../../store/bibleStore';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useHaptics } from '../../hooks/useHaptics';
import { BibleStackParamList } from '../../types/navigation.types';
import Card from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';
import AnimatedCheckbox from '../../components/common/AnimatedCheckbox';
import EmptyState from '../../components/common/EmptyState';
import { getPlanById } from '../../utils/planDefinitions';
import { cardShadow } from '../../utils/colors';

type Nav = StackNavigationProp<BibleStackParamList, 'BibleHome'>;

export default function BibleHomeScreen({ navigation }: { navigation: Nav }) {
  const insets = useSafeAreaInsets();
  const { colors } = useColorScheme();
  const haptics = useHaptics();

  const { activePlan, getTodayReadings, getProgressPercent, getCurrentDayNumber, markPassageRead } =
    useBibleStore();

  const todayReadings = getTodayReadings();
  const progress = getProgressPercent();
  const dayNumber = getCurrentDayNumber();
  const planDef = activePlan ? getPlanById(activePlan.planId) : null;

  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
  }, []);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!activePlan || !planDef) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Text style={[styles.screenTitle, { color: colors.textPrimary, fontFamily: 'Inter_700Bold' }]}>
            Bible
          </Text>
        </View>
        <EmptyState
          emoji="📖"
          title="No reading plan selected"
          subtitle="Choose a Bible reading plan to start your journey"
          actionLabel="Choose a Plan"
          onAction={() => navigation.navigate('PlanSelect')}
        />
      </View>
    );
  }

  const completedToday = todayReadings
    ? todayReadings.passages.filter((p) => activePlan.completedPassages.includes(p.id)).length
    : 0;
  const totalToday = todayReadings?.passages.length ?? 0;
  const allTodayDone = completedToday === totalToday && totalToday > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { paddingTop: insets.top + 20 }, fadeStyle]}>
          <Text style={[styles.screenTitle, { color: colors.textPrimary, fontFamily: 'Inter_700Bold' }]}>
            Bible
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('PlanSelect')}
            activeOpacity={0.7}
          >
            <Text style={[styles.changePlan, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
              Change Plan
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Plan progress card */}
        <View style={styles.section}>
          <Card elevated style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressLeft}>
                <Text style={[styles.planName, { color: colors.textPrimary, fontFamily: 'Inter_700Bold' }]}>
                  {planDef.name}
                </Text>
                <Text style={[styles.planDay, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
                  Day {dayNumber} of {planDef.totalDays}
                </Text>
              </View>
              <View style={styles.streakBlock}>
                <Text style={styles.streakFire}>🔥</Text>
                <Text style={[styles.streakNum, { color: colors.textPrimary, fontFamily: 'Inter_700Bold' }]}>
                  {activePlan.streak}
                </Text>
                <Text style={[styles.streakLabel, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
                  {activePlan.streak === 1 ? 'day' : 'days'}
                </Text>
              </View>
            </View>
            <ProgressBar
              progress={progress / 100}
              height={8}
              showLabel
              label={`${activePlan.completedDays.length} of ${planDef.totalDays} days completed`}
            />
          </Card>
        </View>

        {/* Today's Reading */}
        {todayReadings && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'Inter_600SemiBold' }]}>
                Today's Reading
              </Text>
              {allTodayDone ? (
                <View style={[styles.doneBadge, { backgroundColor: colors.success }]}>
                  <Text style={styles.doneBadgeText}>All Done ✓</Text>
                </View>
              ) : (
                <Text style={[styles.passageCount, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
                  {completedToday}/{totalToday} read
                </Text>
              )}
            </View>

            <View style={[styles.passageList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {todayReadings.passages.map((passage, i) => {
                const isRead = activePlan.completedPassages.includes(passage.id);
                return (
                  <View key={passage.id}>
                    <TouchableOpacity
                      onPress={() => {
                        haptics.select();
                        navigation.navigate('PassageView', { passage, dayNumber });
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.passageRow, { backgroundColor: colors.surface }]}>
                        <AnimatedCheckbox
                          checked={isRead}
                          onToggle={() => {
                            haptics.success();
                            markPassageRead(passage.id);
                          }}
                          color={colors.primary}
                          size={22}
                        />
                        <View style={styles.passageContent}>
                          <Text
                            style={[
                              styles.passageName,
                              {
                                color: isRead ? colors.textTertiary : colors.textPrimary,
                                fontFamily: 'Inter_500Medium',
                              },
                              isRead && { textDecorationLine: 'line-through' },
                            ]}
                          >
                            {passage.displayText}
                          </Text>
                        </View>
                        <Text style={[styles.readNow, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
                          Read ›
                        </Text>
                      </View>
                    </TouchableOpacity>
                    {i < todayReadings.passages.length - 1 && (
                      <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'Inter_600SemiBold', marginBottom: 14 }]}>
            Your Progress
          </Text>
          <View style={styles.statsRow}>
            <StatCard emoji="📅" value={activePlan.completedDays.length} label="Days Read" colors={colors} />
            <StatCard emoji="📖" value={activePlan.completedPassages.length} label="Passages" colors={colors} />
            <StatCard emoji="🔥" value={activePlan.streak} label="Day Streak" colors={colors} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({
  emoji,
  value,
  label,
  colors,
}: {
  emoji: string;
  value: number;
  label: string;
  colors: any;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color: colors.textPrimary, fontFamily: 'Inter_700Bold' }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  screenTitle: { fontSize: 28, letterSpacing: -0.8 },
  changePlan: { fontSize: 15 },
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, letterSpacing: -0.3 },
  progressCard: { gap: 18 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  progressLeft: { flex: 1 },
  planName: { fontSize: 19, letterSpacing: -0.4, marginBottom: 4 },
  planDay: { fontSize: 14 },
  streakBlock: { alignItems: 'center', gap: 1 },
  streakFire: { fontSize: 28 },
  streakNum: { fontSize: 24, lineHeight: 28 },
  streakLabel: { fontSize: 12 },
  passageCount: { fontSize: 14 },
  doneBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  doneBadgeText: { color: '#FFFFFF', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  passageList: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...cardShadow,
  },
  passageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  passageContent: { flex: 1, marginLeft: 12 },
  passageName: { fontSize: 16, letterSpacing: -0.2 },
  readNow: { fontSize: 13 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    ...cardShadow,
  },
  statEmoji: { fontSize: 26 },
  statValue: { fontSize: 24, letterSpacing: -0.5 },
  statLabel: { fontSize: 12 },
});
