import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTaskStore } from '../../store/taskStore';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useHaptics } from '../../hooks/useHaptics';
import {
  formatDateKey,
  formatDisplayDate,
  formatDayOfWeek,
  formatDayNumber,
  getWeekDays,
  addDays,
  isToday,
  isSameDay,
  formatTime,
} from '../../utils/dateHelpers';
import { PlannerStackParamList } from '../../types/navigation.types';
import AnimatedCheckbox from '../../components/common/AnimatedCheckbox';
import SwipeableRow from '../../components/common/SwipeableRow';
import EmptyState from '../../components/common/EmptyState';
import { Task } from '../../types/task.types';
import { cardShadow } from '../../utils/colors';

type Nav = StackNavigationProp<PlannerStackParamList, 'SchedulerHome'>;

export default function SchedulerScreen({ navigation }: { navigation: Nav }) {
  const insets = useSafeAreaInsets();
  const { colors } = useColorScheme();
  const haptics = useHaptics();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(() => getWeekDays(new Date())[0]);

  const weekDays = getWeekDays(weekStart);

  const { loadTasksForDate, loadTasksForWeek, completeTask, uncompleteTask, deleteTask, getTasksForDate } =
    useTaskStore();

  const dateKey = formatDateKey(selectedDate);
  const tasks = getTasksForDate(dateKey);
  const incompleteTasks = sortByTime(tasks.filter((t) => !t.isCompleted));
  const completedTasks = sortByTime(tasks.filter((t) => t.isCompleted));

  useEffect(() => {
    const start = formatDateKey(weekDays[0]);
    const end = formatDateKey(weekDays[6]);
    loadTasksForWeek(start, end);
  }, [weekStart]);

  useEffect(() => {
    loadTasksForDate(dateKey);
  }, [dateKey]);

  const handleSelectDate = (date: Date) => {
    haptics.select();
    setSelectedDate(date);
  };

  const handlePrevWeek = () => {
    haptics.light();
    const newStart = addDays(weekStart, -7);
    setWeekStart(newStart);
    // Keep the same day-of-week in the new week
    const newWeek = getWeekDays(newStart);
    const matchingDay = newWeek.find((d) => d.getDay() === selectedDate.getDay()) ?? newWeek[0];
    setSelectedDate(matchingDay);
  };

  const handleNextWeek = () => {
    haptics.light();
    const newStart = addDays(weekStart, 7);
    setWeekStart(newStart);
    const newWeek = getWeekDays(newStart);
    const matchingDay = newWeek.find((d) => d.getDay() === selectedDate.getDay()) ?? newWeek[0];
    setSelectedDate(matchingDay);
  };

  const handleToggleTask = async (task: Task) => {
    if (task.isCompleted) {
      await uncompleteTask(task.id);
      haptics.light();
    } else {
      await completeTask(task.id);
      haptics.success();
    }
  };

  // FAB animation
  const fabScale = useSharedValue(1);
  const fabStyle = useAnimatedStyle(() => ({ transform: [{ scale: fabScale.value }] }));

  const handleFabPress = () => {
    fabScale.value = withSpring(0.88, { damping: 15 }, () => {
      fabScale.value = withSpring(1, { damping: 10 });
    });
    haptics.medium();
    navigation.navigate('AddTask', { date: dateKey });
  };

  const getTaskCount = (date: Date) =>
    getTasksForDate(formatDateKey(date)).filter((t) => !t.isCompleted).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Calendar header */}
      <View
        style={[
          styles.calHeader,
          {
            paddingTop: insets.top + 16,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.screenTitle, { color: colors.textPrimary, fontFamily: 'Inter_700Bold' }]}>
          Planner
        </Text>

        {/* Week nav */}
        <View style={styles.weekNav}>
          <TouchableOpacity onPress={handlePrevWeek} style={styles.weekNavBtn} activeOpacity={0.7}>
            <Text style={[styles.weekNavArrow, { color: colors.primary }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.weekLabel, { color: colors.textSecondary, fontFamily: 'Inter_500Medium' }]}>
            {shortDate(weekDays[0])} – {shortDate(weekDays[6])}
          </Text>
          <TouchableOpacity onPress={handleNextWeek} style={styles.weekNavBtn} activeOpacity={0.7}>
            <Text style={[styles.weekNavArrow, { color: colors.primary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayStrip}
        >
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const todayDay = isToday(day);
            const count = getTaskCount(day);
            return (
              <TouchableOpacity
                key={day.toISOString()}
                onPress={() => handleSelectDate(day)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.dayPill,
                    isSelected && { backgroundColor: colors.primary },
                    !isSelected && todayDay && { borderWidth: 1.5, borderColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayName,
                      { color: isSelected ? 'rgba(255,255,255,0.75)' : colors.textSecondary, fontFamily: 'Inter_500Medium' },
                    ]}
                  >
                    {formatDayOfWeek(formatDateKey(day)).slice(0, 3).toUpperCase()}
                  </Text>
                  <Text
                    style={[
                      styles.dayNum,
                      { color: isSelected ? '#FFFFFF' : colors.textPrimary, fontFamily: 'Inter_700Bold' },
                    ]}
                  >
                    {formatDayNumber(formatDateKey(day))}
                  </Text>
                  {count > 0 && (
                    <View
                      style={[
                        styles.dayDot,
                        { backgroundColor: isSelected ? 'rgba(255,255,255,0.6)' : colors.primary },
                      ]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Task list */}
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dayHeading}>
          <Text style={[styles.dayTitle, { color: colors.textPrimary, fontFamily: 'Inter_700Bold' }]}>
            {formatDisplayDate(dateKey)}
          </Text>
          <Text style={[styles.daySubtitle, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
            {tasks.length === 0
              ? 'No tasks'
              : `${incompleteTasks.length} remaining · ${completedTasks.length} done`}
          </Text>
        </View>

        {tasks.length === 0 ? (
          <EmptyState
            emoji="📅"
            title="Nothing planned"
            subtitle="Tap + to add a task"
            actionLabel="Add Task"
            onAction={handleFabPress}
          />
        ) : (
          <View style={[styles.taskList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {[...incompleteTasks, ...completedTasks].map((task, i, arr) => (
              <View key={task.id}>
                <SwipeableRow
                  onComplete={task.isCompleted ? undefined : () => handleToggleTask(task)}
                  onDelete={() => { deleteTask(task.id); haptics.heavy(); }}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                  >
                    <View style={[styles.taskRow, { backgroundColor: colors.surface }]}>
                      <View style={[styles.taskColorBar, { backgroundColor: task.color }]} />
                      <AnimatedCheckbox
                        checked={task.isCompleted}
                        onToggle={() => handleToggleTask(task)}
                        color={task.color}
                        size={22}
                      />
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
                      {task.priority === 'high' && <Text style={styles.priority}>🔴</Text>}
                      {task.priority === 'medium' && <Text style={styles.priority}>🟡</Text>}
                      <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
                    </View>
                  </TouchableOpacity>
                </SwipeableRow>
                {i < arr.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Animated.View style={[styles.fab, { bottom: insets.bottom + 82 }, fabStyle]}>
        <TouchableOpacity
          onPress={handleFabPress}
          style={[styles.fabBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </Animated.View>
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

function shortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  calHeader: { borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 10 },
  screenTitle: { fontSize: 28, letterSpacing: -0.8, paddingHorizontal: 20, marginBottom: 10 },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  weekNavBtn: { padding: 8 },
  weekNavArrow: { fontSize: 28, lineHeight: 32 },
  weekLabel: { fontSize: 14 },
  dayStrip: { paddingHorizontal: 12, gap: 6, paddingBottom: 4 },
  dayPill: {
    width: 44,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 14,
    gap: 2,
  },
  dayName: { fontSize: 10, letterSpacing: 0.4 },
  dayNum: { fontSize: 18, lineHeight: 22 },
  dayDot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 2 },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },
  dayHeading: { marginBottom: 16, gap: 3 },
  dayTitle: { fontSize: 22, letterSpacing: -0.5 },
  daySubtitle: { fontSize: 14 },
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
  priority: { fontSize: 13, marginHorizontal: 4 },
  chevron: { fontSize: 18 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  fab: { position: 'absolute', right: 20 },
  fabBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: { fontSize: 30, color: '#FFFFFF', lineHeight: 36 },
});
