import { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useTaskStore } from '../../store/taskStore';
import { useBibleStore } from '../../store/bibleStore';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useHaptics } from '../../hooks/useHaptics';
import {
  formatDateKey,
  formatDisplayDate,
  getGreeting,
  formatTime,
} from '../../utils/dateHelpers';
import { MainTabParamList } from '../../types/navigation.types';
import Card from '../../components/common/Card';
import AnimatedCheckbox from '../../components/common/AnimatedCheckbox';
import SwipeableRow from '../../components/common/SwipeableRow';
import ProgressBar from '../../components/common/ProgressBar';
import EmptyState from '../../components/common/EmptyState';
import { Task } from '../../types/task.types';
import { getPlanById } from '../../utils/planDefinitions';
import { cardShadow } from '../../utils/colors';

type Nav = BottomTabNavigationProp<MainTabParamList>;

const TODAY = formatDateKey(new Date());

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useColorScheme();
  const haptics = useHaptics();
  const navigation = useNavigation<Nav>();

  const { loadTasksForDate, completeTask, uncompleteTask, deleteTask, getTasksForDate } =
    useTaskStore();
  const { activePlan, getTodayReadings, getProgressPercent, getCurrentDayNumber } = useBibleStore();

  const tasks = getTasksForDate(TODAY);
  const incompleteTasks = sortByTime(tasks.filter((t) => !t.isCompleted));
  const completedTasks = sortByTime(tasks.filter((t) => t.isCompleted));
  const todayReadings = getTodayReadings();
  const progressPct = getProgressPercent();
  const dayNumber = getCurrentDayNumber();
  const planDef = activePlan ? getPlanById(activePlan.planId) : null;

  // Header entrance
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(24);
  useEffect(() => {
    headerOpacity.value = withDelay(80, withTiming(1, { duration: 500 }));
    headerY.value = withDelay(80, withSpring(0, { damping: 20, stiffness: 130 }));
    loadTasksForDate(TODAY);
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasksForDate(TODAY);
    setRefreshing(false);
  }, []);

  const handleToggleTask = async (task: Task) => {
    if (task.isCompleted) {
      await uncompleteTask(task.id);
      haptics.light();
    } else {
      await completeTask(task.id);
      haptics.success();
    }
  };

  const greeting = getGreeting();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View style={[styles.header, { paddingTop: insets.top + 20 }, headerStyle]}>
          <Text style={[styles.greeting, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
            {greeting} ☀️
          </Text>
          <Text style={[styles.dateTitle, { color: colors.textPrimary, fontFamily: 'Inter_700Bold' }]}>
            {formatDisplayDate(TODAY)}
          </Text>
          <Text style={[styles.taskSummary, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
            {incompleteTasks.length === 0 && completedTasks.length === 0
              ? 'No tasks — enjoy your day!'
              : incompleteTasks.length === 0
              ? `All ${completedTasks.length} tasks done 🎉`
              : `${incompleteTasks.length} task${incompleteTasks.length !== 1 ? 's' : ''} remaining`}
          </Text>
        </Animated.View>

        {/* Bible Plan Widget */}
        {activePlan && planDef && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Bible')}
            activeOpacity={0.85}
            style={styles.section}
          >
            <Card elevated style={styles.bibleCard}>
              <View style={styles.bibleCardTop}>
                <View style={[styles.bibleIconWrap, { backgroundColor: colors.primarySubtle }]}>
                  <Text style={styles.bibleIcon}>📖</Text>
                </View>
                <View style={styles.bibleInfo}>
                  <Text
                    style={[styles.bibleCardPlan, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}
                  >
                    {planDef.name}
                  </Text>
                  <Text
                    style={[styles.bibleCardDay, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}
                  >
                    Day {dayNumber} · {activePlan.streak > 0 ? `🔥 ${activePlan.streak}-day streak` : 'Start your streak!'}
                  </Text>
                </View>
                <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
              </View>

              <ProgressBar progress={progressPct / 100} height={6} />

              {todayReadings && (
                <View style={styles.todayPassages}>
                  <Text
                    style={[styles.todayLabel, { color: colors.textTertiary, fontFamily: 'Inter_500Medium' }]}
                  >
                    TODAY'S READING
                  </Text>
                  <Text
                    style={[styles.passageList, { color: colors.textPrimary, fontFamily: 'Inter_400Regular' }]}
                    numberOfLines={2}
                  >
                    {todayReadings.passages.map((p) => p.displayText).join(' · ')}
                  </Text>
                </View>
              )}
            </Card>
          </TouchableOpacity>
        )}

        {/* Tasks section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'Inter_600SemiBold' }]}>
              Today's Tasks
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Planner')} activeOpacity={0.7}>
              <Text style={[styles.seeAll, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
                Open Planner ›
              </Text>
            </TouchableOpacity>
          </View>

          {tasks.length === 0 ? (
            <EmptyState
              emoji="✅"
              title="Nothing scheduled today"
              subtitle="Open the Planner tab to add tasks"
              actionLabel="Go to Planner"
              onAction={() => navigation.navigate('Planner')}
            />
          ) : (
            <View style={[styles.taskList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {incompleteTasks.map((task, i) => (
                <View key={task.id}>
                  <SwipeableRow
                    onComplete={() => handleToggleTask(task)}
                    onDelete={() => { deleteTask(task.id); haptics.heavy(); }}
                  >
                    <TaskRow task={task} onToggle={() => handleToggleTask(task)} colors={colors} />
                  </SwipeableRow>
                  {i < incompleteTasks.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                  )}
                </View>
              ))}

              {completedTasks.length > 0 && (
                <>
                  {incompleteTasks.length > 0 && (
                    <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                  )}
                  <View style={styles.completedHeader}>
                    <Text
                      style={[styles.completedLabel, { color: colors.textTertiary, fontFamily: 'Inter_500Medium' }]}
                    >
                      COMPLETED ({completedTasks.length})
                    </Text>
                  </View>
                  {completedTasks.map((task, i) => (
                    <View key={task.id}>
                      <SwipeableRow onDelete={() => { deleteTask(task.id); haptics.heavy(); }}>
                        <TaskRow task={task} onToggle={() => handleToggleTask(task)} colors={colors} />
                      </SwipeableRow>
                      {i < completedTasks.length - 1 && (
                        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                      )}
                    </View>
                  ))}
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function TaskRow({
  task,
  onToggle,
  colors,
}: {
  task: Task;
  onToggle: () => void;
  colors: any;
}) {
  return (
    <View style={[styles.taskRow, { backgroundColor: colors.surface }]}>
      <View style={[styles.taskColorBar, { backgroundColor: task.color }]} />
      <AnimatedCheckbox checked={task.isCompleted} onToggle={onToggle} color={task.color} size={22} />
      <View style={styles.taskContent}>
        <Text
          numberOfLines={1}
          style={[
            styles.taskTitle,
            {
              color: task.isCompleted ? colors.textTertiary : colors.textPrimary,
              fontFamily: 'Inter_500Medium',
            },
            task.isCompleted && styles.strikethrough,
          ]}
        >
          {task.title}
        </Text>
        {task.startTime && (
          <Text style={[styles.taskTime, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
            {formatTime(task.startTime)}
            {task.endTime ? ` – ${formatTime(task.endTime)}` : ''}
          </Text>
        )}
      </View>
      {task.priority === 'high' && <Text style={styles.priorityDot}>🔴</Text>}
      {task.priority === 'medium' && <Text style={styles.priorityDot}>🟡</Text>}
    </View>
  );
}

function sortByTime(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
    if (a.startTime) return -1;
    if (b.startTime) return 1;
    return a.sortOrder - b.sortOrder;
  });
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  header: { paddingBottom: 28, gap: 4 },
  greeting: { fontSize: 16 },
  dateTitle: { fontSize: 32, letterSpacing: -0.8, lineHeight: 38 },
  taskSummary: { fontSize: 15, marginTop: 2 },
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, letterSpacing: -0.3 },
  seeAll: { fontSize: 14 },
  bibleCard: { gap: 14 },
  bibleCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bibleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bibleIcon: { fontSize: 24 },
  bibleInfo: { flex: 1 },
  bibleCardPlan: { fontSize: 15, marginBottom: 2 },
  bibleCardDay: { fontSize: 13 },
  chevron: { fontSize: 22 },
  todayPassages: { gap: 5 },
  todayLabel: { fontSize: 11, letterSpacing: 0.8 },
  passageList: { fontSize: 14, lineHeight: 20 },
  taskList: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...cardShadow,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  taskColorBar: { width: 4, height: 34, borderRadius: 2, marginRight: 12 },
  taskContent: { flex: 1, marginLeft: 10 },
  taskTitle: { fontSize: 16, letterSpacing: -0.2 },
  strikethrough: { textDecorationLine: 'line-through' },
  taskTime: { fontSize: 13, marginTop: 2 },
  priorityDot: { fontSize: 13, marginLeft: 8 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  completedHeader: { paddingHorizontal: 16, paddingVertical: 8 },
  completedLabel: { fontSize: 11, letterSpacing: 0.8 },
});
