import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTaskStore } from '../../store/taskStore';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useHaptics } from '../../hooks/useHaptics';
import { PlannerStackParamList } from '../../types/navigation.types';
import HapticButton from '../../components/common/HapticButton';
import { formatDateKey, formatDisplayDate } from '../../utils/dateHelpers';
import { Priority } from '../../types/task.types';
import { parseNaturalLanguage } from '../../services/naturalLanguageParser';

type Nav = StackNavigationProp<PlannerStackParamList, 'AddTask'>;
type RouteType = RouteProp<PlannerStackParamList, 'AddTask'>;

const TASK_COLORS = [
  '#6366F1', '#EC4899', '#F59E0B', '#22C55E',
  '#3B82F6', '#8B5CF6', '#EF4444', '#06B6D4',
];

const PRIORITIES: { value: Priority; label: string; emoji: string }[] = [
  { value: 'low', label: 'Low', emoji: '🟢' },
  { value: 'medium', label: 'Medium', emoji: '🟡' },
  { value: 'high', label: 'High', emoji: '🔴' },
];

export default function AddTaskModal({
  navigation,
  route,
}: {
  navigation: Nav;
  route: RouteType;
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useColorScheme();
  const haptics = useHaptics();
  const addTask = useTaskStore((s) => s.addTask);

  const paramDate = route.params?.date ?? formatDateKey(new Date());
  const paramTime = route.params?.startTime ?? '';

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(paramDate);
  const [startTime, setStartTime] = useState(paramTime);
  const [priority, setPriority] = useState<Priority>('low');
  const [selectedColor, setSelectedColor] = useState(TASK_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(timer);
  }, []);

  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (text.length > 4) {
      try {
        const parsed = parseNaturalLanguage(text);
        if (parsed.startTime && !startTime) setStartTime(parsed.startTime);
        if (parsed.date) setDate(formatDateKey(parsed.date));
      } catch {
        // ignore parse errors
      }
    }
  };

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      haptics.error();
      return;
    }
    setSaving(true);
    haptics.success();
    await addTask({
      title: trimmed,
      date,
      startTime: startTime.trim() || undefined,
      priority,
      color: selectedColor,
      isCompleted: false,
      tags: [],
      recurrence: { type: 'none' },
      sortOrder: 0,
    });
    setSaving(false);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={() => navigation.goBack()}
      />
      <View
        style={[
          styles.sheet,
          { backgroundColor: colors.surface, paddingBottom: insets.bottom + 16 },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleArea}>
          <View style={[styles.handle, { backgroundColor: colors.divider }]} />
        </View>

        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: colors.textPrimary, fontFamily: 'Inter_700Bold' }]}>
            New Task
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={[styles.closeText, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Title Input */}
          <View style={[styles.inputWrap, { borderColor: colors.border }]}>
            <TextInput
              ref={inputRef}
              value={title}
              onChangeText={handleTitleChange}
              placeholder="What do you need to do?"
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.titleInput,
                { color: colors.textPrimary, fontFamily: 'Inter_500Medium' },
              ]}
              multiline
              blurOnSubmit
            />
          </View>

          <Text style={[styles.nlHint, { color: colors.textTertiary, fontFamily: 'Inter_400Regular' }]}>
            💡 Type naturally — "Call John at 3pm tomorrow" auto-fills details
          </Text>

          {/* Date row */}
          <View style={[styles.fieldRow, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: 'Inter_500Medium' }]}>
              📅  Date
            </Text>
            <Text style={[styles.fieldValue, { color: colors.textPrimary, fontFamily: 'Inter_500Medium' }]}>
              {formatDisplayDate(date)}
            </Text>
          </View>

          {/* Time row */}
          <View style={[styles.fieldRow, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: 'Inter_500Medium' }]}>
              ⏰  Time
            </Text>
            <TextInput
              value={startTime}
              onChangeText={setStartTime}
              placeholder="HH:MM (optional)"
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.timeInput,
                {
                  color: colors.textPrimary,
                  borderColor: colors.border,
                  fontFamily: 'Inter_400Regular',
                },
              ]}
              keyboardType="numbers-and-punctuation"
            />
          </View>

          {/* Priority */}
          <View style={styles.pickerSection}>
            <Text style={[styles.pickerLabel, { color: colors.textSecondary, fontFamily: 'Inter_500Medium' }]}>
              Priority
            </Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map((p) => {
                const isSelected = priority === p.value;
                return (
                  <TouchableOpacity
                    key={p.value}
                    onPress={() => { setPriority(p.value); haptics.select(); }}
                    activeOpacity={0.8}
                    style={[
                      styles.priorityBtn,
                      {
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: isSelected ? colors.primarySubtle : 'transparent',
                      },
                    ]}
                  >
                    <Text style={styles.priorityEmoji}>{p.emoji}</Text>
                    <Text
                      style={[
                        styles.priorityLabel,
                        {
                          color: isSelected ? colors.primary : colors.textSecondary,
                          fontFamily: 'Inter_500Medium',
                        },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Color */}
          <View style={styles.pickerSection}>
            <Text style={[styles.pickerLabel, { color: colors.textSecondary, fontFamily: 'Inter_500Medium' }]}>
              Color
            </Text>
            <View style={styles.colorRow}>
              {TASK_COLORS.map((c) => {
                const isSelected = selectedColor === c;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => { setSelectedColor(c); haptics.select(); }}
                    activeOpacity={0.8}
                    style={[
                      styles.colorDot,
                      { backgroundColor: c },
                      isSelected && styles.colorDotSelected,
                    ]}
                  >
                    {isSelected && (
                      <Text style={styles.colorCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={{ height: 8 }} />
        </ScrollView>

        <HapticButton
          onPress={handleSave}
          label="Add Task"
          size="lg"
          loading={saving}
          disabled={!title.trim()}
          style={styles.saveBtn}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    maxHeight: '92%',
  },
  handleArea: { alignItems: 'center', paddingVertical: 8 },
  handle: { width: 38, height: 4, borderRadius: 2 },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 22, letterSpacing: -0.4 },
  closeBtn: { padding: 4 },
  closeText: { fontSize: 20 },
  inputWrap: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
  },
  titleInput: { fontSize: 17, minHeight: 56, lineHeight: 24 },
  nlHint: { fontSize: 13, lineHeight: 18, marginBottom: 20 },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fieldLabel: { fontSize: 15 },
  fieldValue: { fontSize: 15 },
  timeInput: {
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    width: 130,
    textAlign: 'center',
  },
  pickerSection: { paddingVertical: 14 },
  pickerLabel: { fontSize: 15, marginBottom: 12 },
  priorityRow: { flexDirection: 'row', gap: 10 },
  priorityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  priorityEmoji: { fontSize: 15 },
  priorityLabel: { fontSize: 14 },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotSelected: {
    transform: [{ scale: 1.2 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 4,
  },
  colorCheck: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_700Bold' },
  saveBtn: { marginTop: 16 },
});
