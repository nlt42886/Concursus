import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTaskStore } from '../../store/taskStore';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useHaptics } from '../../hooks/useHaptics';
import { PlannerStackParamList } from '../../types/navigation.types';
import AnimatedCheckbox from '../../components/common/AnimatedCheckbox';
import HapticButton from '../../components/common/HapticButton';
import { formatDisplayDate, formatTime } from '../../utils/dateHelpers';
import { cardShadow } from '../../utils/colors';

type Nav = StackNavigationProp<PlannerStackParamList, 'TaskDetail'>;
type RouteType = RouteProp<PlannerStackParamList, 'TaskDetail'>;

export default function TaskDetailScreen({
  navigation,
  route,
}: {
  navigation: Nav;
  route: RouteType;
}) {
  const { taskId } = route.params;
  const insets = useSafeAreaInsets();
  const { colors } = useColorScheme();
  const haptics = useHaptics();

  const { tasksByDate, updateTask, completeTask, uncompleteTask, deleteTask } = useTaskStore();
  const task = Object.values(tasksByDate).flat().find((t) => t.id === taskId);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task?.title ?? '');
  const [editingTime, setEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState(task?.startTime ?? '');

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.navBar, { paddingTop: insets.top + 8, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn} activeOpacity={0.7}>
            <Text style={[styles.navText, { color: colors.primary }]}>‹ Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Task not found.</Text>
        </View>
      </View>
    );
  }

  const handleToggle = async () => {
    if (task.isCompleted) {
      await uncompleteTask(task.id);
      haptics.light();
    } else {
      await completeTask(task.id);
      haptics.success();
    }
  };

  const handleSaveTitle = async () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== task.title) {
      await updateTask(task.id, { title: trimmed });
      haptics.light();
    }
    setEditing(false);
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'This task will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          haptics.heavy();
          await deleteTask(task.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleCyclePriority = async () => {
    const cycle: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    const next = cycle[(cycle.indexOf(task.priority) + 1) % 3];
    haptics.select();
    await updateTask(task.id, { priority: next });
  };

  const handleSaveTime = async () => {
    setEditingTime(false);
    const trimmed = timeInput.trim();
    if (!trimmed) {
      if (task.startTime) { await updateTask(task.id, { startTime: undefined }); haptics.light(); }
      return;
    }
    if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
      const [h, m] = trimmed.split(':').map(Number);
      if (h >= 0 && h < 24 && m >= 0 && m < 60) {
        const normalized = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        if (normalized !== task.startTime) { await updateTask(task.id, { startTime: normalized }); haptics.light(); }
        return;
      }
    }
    setTimeInput(task.startTime ?? '');
  };

  const priorityLabel = { low: 'Low 🟢', medium: 'Medium 🟡', high: 'High 🔴' }[task.priority];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Nav bar */}
      <View
        style={[
          styles.navBar,
          { paddingTop: insets.top + 8, backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn} activeOpacity={0.7}>
          <Text style={[styles.navText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>‹ Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => (editing ? handleSaveTitle() : setEditing(true))}
          style={styles.navBtn}
          activeOpacity={0.7}
        >
          <Text style={[styles.navText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
            {editing ? 'Save' : 'Edit Title'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title card */}
        <View
          style={[
            styles.titleCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderLeftColor: task.color,
            },
          ]}
        >
          <View style={styles.titleRow}>
            <AnimatedCheckbox
              checked={task.isCompleted}
              onToggle={handleToggle}
              color={task.color}
              size={28}
            />
            {editing ? (
              <TextInput
                value={title}
                onChangeText={setTitle}
                onBlur={handleSaveTitle}
                autoFocus
                multiline
                style={[
                  styles.titleInput,
                  { color: colors.textPrimary, fontFamily: 'Inter_600SemiBold' },
                ]}
              />
            ) : (
              <Text
                style={[
                  styles.taskTitle,
                  { color: task.isCompleted ? colors.textTertiary : colors.textPrimary, fontFamily: 'Inter_600SemiBold' },
                  task.isCompleted && styles.strikethrough,
                ]}
              >
                {task.title}
              </Text>
            )}
          </View>
        </View>

        {/* Details card */}
        {(() => {
          const hasTags = task.tags.length > 0;
          const hasRecurrence = task.recurrence.type !== 'none';
          const priorityIsLast = !hasTags && !hasRecurrence;
          return (
            <View style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {/* Date — read only */}
              <DetailRow label="📅  Date" value={formatDisplayDate(task.date)} colors={colors} />

              {/* Time — inline editable */}
              <TouchableOpacity
                onPress={() => { setEditingTime(true); setTimeInput(task.startTime ?? ''); }}
                activeOpacity={0.75}
              >
                <View style={[styles.detailRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider }]}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
                    ⏰  Time
                  </Text>
                  {editingTime ? (
                    <TextInput
                      value={timeInput}
                      onChangeText={setTimeInput}
                      onBlur={handleSaveTime}
                      autoFocus
                      keyboardType="numbers-and-punctuation"
                      placeholder="HH:MM"
                      placeholderTextColor={colors.textTertiary}
                      style={[styles.detailTimeInput, { color: colors.textPrimary, borderColor: colors.border, fontFamily: 'Inter_500Medium' }]}
                    />
                  ) : (
                    <Text style={[styles.detailValue, { color: task.startTime ? colors.textPrimary : colors.primary, fontFamily: 'Inter_500Medium' }]}>
                      {task.startTime
                        ? `${formatTime(task.startTime)}${task.endTime ? ` – ${formatTime(task.endTime)}` : ''}`
                        : 'Add time +'}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              {/* Priority — tap to cycle */}
              <TouchableOpacity onPress={handleCyclePriority} activeOpacity={0.75}>
                <View style={[
                  styles.detailRow,
                  !priorityIsLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
                ]}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
                    🎯  Priority
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.textPrimary, fontFamily: 'Inter_500Medium' }]}>
                    {priorityLabel} ›
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Tags — read only */}
              {hasTags && (
                <DetailRow label="🏷  Tags" value={task.tags.join(', ')} colors={colors} noBorder={!hasRecurrence} />
              )}

              {/* Recurrence — read only */}
              {hasRecurrence && (
                <DetailRow
                  label="🔁  Repeat"
                  value={task.recurrence.type.charAt(0).toUpperCase() + task.recurrence.type.slice(1)}
                  colors={colors}
                  noBorder
                />
              )}
            </View>
          );
        })()}

        {/* Completed banner */}
        {task.isCompleted && task.completedAt && (
          <View
            style={[
              styles.completedBanner,
              { backgroundColor: colors.success + '18', borderColor: colors.success + '44' },
            ]}
          >
            <Text style={[styles.completedBannerText, { color: colors.success, fontFamily: 'Inter_500Medium' }]}>
              ✓ Completed{' '}
              {new Date(task.completedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>
        )}

        <HapticButton
          onPress={handleDelete}
          label="Delete Task"
          variant="danger"
          size="md"
          style={styles.deleteBtn}
          icon="🗑"
        />
      </ScrollView>
    </View>
  );
}

function DetailRow({
  label,
  value,
  colors,
  noBorder = false,
}: {
  label: string;
  value: string;
  colors: any;
  noBorder?: boolean;
}) {
  return (
    <View
      style={[
        styles.detailRow,
        !noBorder && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
      ]}
    >
      <Text style={[styles.detailLabel, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
        {label}
      </Text>
      <Text style={[styles.detailValue, { color: colors.textPrimary, fontFamily: 'Inter_500Medium' }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navBtn: { padding: 4, minWidth: 70 },
  navText: { fontSize: 17 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16 },
  scroll: { padding: 20, gap: 16 },
  titleCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 5,
    padding: 20,
    ...cardShadow,
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  titleInput: { flex: 1, fontSize: 22, lineHeight: 30, letterSpacing: -0.4 },
  taskTitle: { flex: 1, fontSize: 22, lineHeight: 30, letterSpacing: -0.4 },
  strikethrough: { textDecorationLine: 'line-through' },
  detailCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...cardShadow,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  detailLabel: { fontSize: 15 },
  detailValue: { fontSize: 15, maxWidth: '55%', textAlign: 'right' },
  detailTimeInput: {
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: 100,
    textAlign: 'center',
  },
  completedBanner: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  completedBannerText: { fontSize: 14 },
  deleteBtn: {},
});
