import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../store/settingsStore';
import { useBibleStore } from '../../store/bibleStore';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useHaptics } from '../../hooks/useHaptics';
import { BibleTranslation } from '../../types/bible.types';
import { getPlanById } from '../../utils/planDefinitions';
import {
  scheduleDailyReminder,
  cancelDailyReminders,
} from '../../services/notificationService';

type Theme = 'light' | 'dark' | 'auto';

const THEMES: { id: Theme; label: string; emoji: string }[] = [
  { id: 'light', label: 'Light', emoji: '☀️' },
  { id: 'dark', label: 'Dark', emoji: '🌙' },
  { id: 'auto', label: 'Auto', emoji: '🔄' },
];

const TRANSLATIONS: { id: BibleTranslation; label: string; full: string }[] = [
  { id: 'kjv', label: 'KJV', full: 'King James Version' },
  { id: 'web', label: 'WEB', full: 'World English Bible' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useColorScheme();
  const haptics = useHaptics();

  const {
    theme,
    setTheme,
    bibleTranslation,
    setBibleTranslation,
    dailyReminderEnabled,
    setDailyReminderEnabled,
    dailyReminderTime,
  } = useSettingsStore();

  const { activePlan } = useBibleStore();
  const planDef = activePlan ? getPlanById(activePlan.planId) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.screenTitle,
            { paddingTop: insets.top + 20, color: colors.textPrimary, fontFamily: 'Inter_700Bold' },
          ]}
        >
          Settings
        </Text>

        {/* Appearance */}
        <Section title="Appearance" colors={colors}>
          <View style={styles.sectionContent}>
            <Text style={[styles.optionLabel, { color: colors.textSecondary, fontFamily: 'Inter_500Medium' }]}>
              Theme
            </Text>
            <View style={styles.segmentRow}>
              {THEMES.map((t) => {
                const isActive = theme === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => { haptics.select(); setTheme(t.id); }}
                    activeOpacity={0.8}
                    style={[
                      styles.segmentBtn,
                      {
                        borderColor: isActive ? colors.primary : colors.border,
                        backgroundColor: isActive ? colors.primarySubtle : 'transparent',
                      },
                    ]}
                  >
                    <Text style={styles.segmentEmoji}>{t.emoji}</Text>
                    <Text
                      style={[
                        styles.segmentLabel,
                        {
                          color: isActive ? colors.primary : colors.textSecondary,
                          fontFamily: isActive ? 'Inter_600SemiBold' : 'Inter_400Regular',
                        },
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Section>

        {/* Bible */}
        <Section title="Bible" colors={colors}>
          <View style={styles.sectionContent}>
            <Text style={[styles.optionLabel, { color: colors.textSecondary, fontFamily: 'Inter_500Medium' }]}>
              Translation
            </Text>
            <View style={styles.segmentRow}>
              {TRANSLATIONS.map((t) => {
                const isActive = bibleTranslation === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => { haptics.select(); setBibleTranslation(t.id); }}
                    activeOpacity={0.8}
                    style={[
                      styles.segmentBtn,
                      {
                        flex: 1,
                        borderColor: isActive ? colors.primary : colors.border,
                        backgroundColor: isActive ? colors.primarySubtle : 'transparent',
                        paddingVertical: 14,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.translationLabel,
                        { color: isActive ? colors.primary : colors.textPrimary, fontFamily: 'Inter_700Bold' },
                      ]}
                    >
                      {t.label}
                    </Text>
                    <Text
                      style={[
                        styles.translationFull,
                        { color: isActive ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      {t.full}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {planDef && (
            <SettingRow
              label="Current Plan"
              value={planDef.name}
              colors={colors}
              noBorder
            />
          )}
        </Section>

        {/* Notifications */}
        <Section title="Notifications" colors={colors}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary, fontFamily: 'Inter_500Medium' }]}>
                Daily Reminder
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
                Get a daily nudge to plan and read
              </Text>
            </View>
            <Switch
              value={dailyReminderEnabled}
              onValueChange={async (v) => {
                haptics.select();
                await setDailyReminderEnabled(v);
                if (v) {
                  const [h, m] = dailyReminderTime.split(':').map(Number);
                  await scheduleDailyReminder(h, m);
                } else {
                  await cancelDailyReminders();
                }
              }}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor="#FFFFFF"
            />
          </View>
          {dailyReminderEnabled && (
            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary, fontFamily: 'Inter_500Medium' }]}>
                Reminder Time
              </Text>
              <TextInput
                value={dailyReminderTime}
                onChangeText={async (v) => {
                  await setDailyReminderTime(v);
                  if (/^\d{2}:\d{2}$/.test(v)) {
                    const [h, m] = v.split(':').map(Number);
                    await scheduleDailyReminder(h, m);
                  }
                }}
                placeholder="HH:MM"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numbers-and-punctuation"
                style={[
                  styles.timeInput,
                  {
                    color: colors.textPrimary,
                    borderColor: colors.border,
                    fontFamily: 'Inter_500Medium',
                  },
                ]}
              />
            </View>
          )}
        </Section>

        {/* About */}
        <Section title="About" colors={colors}>
          <SettingRow label="Version" value="1.0.0" colors={colors} />
          <SettingRow label="Bible API" value="bible-api.com" colors={colors} />
          <SettingRow label="Open Source" value="MIT License" colors={colors} noBorder />
        </Section>

        <Text style={[styles.madeWith, { color: colors.textTertiary, fontFamily: 'Inter_400Regular' }]}>
          Made with ✝️ and ☕
        </Text>
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: any;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontFamily: 'Inter_500Medium' }]}>
        {title.toUpperCase()}
      </Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

function SettingRow({
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
        styles.settingRow,
        noBorder && { borderBottomWidth: 0 },
      ]}
    >
      <Text style={[styles.settingTitle, { color: colors.textPrimary, fontFamily: 'Inter_500Medium' }]}>
        {label}
      </Text>
      <Text style={[styles.settingValue, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  screenTitle: { fontSize: 28, letterSpacing: -0.8, marginBottom: 32 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 11, letterSpacing: 1.1, marginBottom: 8 },
  sectionCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  sectionContent: { padding: 16, gap: 12 },
  optionLabel: { fontSize: 15 },
  segmentRow: { flexDirection: 'row', gap: 8 },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 4,
  },
  segmentEmoji: { fontSize: 20 },
  segmentLabel: { fontSize: 13 },
  translationLabel: { fontSize: 20, textAlign: 'center' },
  translationFull: { fontSize: 11, textAlign: 'center', fontFamily: 'Inter_400Regular' },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  timeInput: {
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    width: 90,
    textAlign: 'center',
  },
  settingLeft: { flex: 1 },
  settingTitle: { fontSize: 15 },
  settingSubtitle: { fontSize: 13, marginTop: 2 },
  settingValue: { fontSize: 15 },
  madeWith: { textAlign: 'center', fontSize: 14, marginTop: 8, marginBottom: 16 },
});
