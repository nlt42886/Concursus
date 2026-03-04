import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBibleStore } from '../../store/bibleStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useHaptics } from '../../hooks/useHaptics';
import { BibleStackParamList } from '../../types/navigation.types';
import { fetchPassage } from '../../services/bibleApi';
import HapticButton from '../../components/common/HapticButton';
import { BiblePassageResponse } from '../../types/bible.types';

type Nav = StackNavigationProp<BibleStackParamList, 'PassageView'>;
type RouteType = RouteProp<BibleStackParamList, 'PassageView'>;

const TRANSLATIONS = [
  { id: 'kjv' as const, label: 'KJV', name: 'King James Version' },
  { id: 'web' as const, label: 'WEB', name: 'World English Bible' },
];

export default function PassageScreen({
  navigation,
  route,
}: {
  navigation: Nav;
  route: RouteType;
}) {
  const { passage, dayNumber } = route.params;
  const insets = useSafeAreaInsets();
  const { colors } = useColorScheme();
  const haptics = useHaptics();

  const bibleTranslation = useSettingsStore((s) => s.bibleTranslation);
  const setBibleTranslation = useSettingsStore((s) => s.setBibleTranslation);
  const { activePlan, markPassageRead, markDayComplete, getTodayReadings } = useBibleStore();

  const [data, setData] = useState<BiblePassageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(17);

  const isRead = activePlan?.completedPassages.includes(passage.id) ?? false;
  const todayReadings = getTodayReadings();
  const passageIdx = todayReadings?.passages.findIndex((p) => p.id === passage.id) ?? 0;
  const totalPassages = todayReadings?.passages.length ?? 1;

  useEffect(() => {
    load();
  }, [passage.id, bibleTranslation]);

  const load = async () => {
    setLoading(true);
    const result = await fetchPassage(passage, bibleTranslation);
    setData(result);
    setLoading(false);
  };

  const handleMarkRead = async () => {
    haptics.success();
    await markPassageRead(passage.id);

    if (todayReadings) {
      const allIds = todayReadings.passages.map((p) => p.id);
      const updatedCompleted = [...(activePlan?.completedPassages ?? []), passage.id];
      const allDone = allIds.every((id) => updatedCompleted.includes(id));
      if (allDone) {
        await markDayComplete(dayNumber);
      }
    }

    navigation.goBack();
  };

  const goToPassage = (idx: number) => {
    if (!todayReadings || idx < 0 || idx >= totalPassages) return;
    haptics.select();
    navigation.replace('PassageView', {
      passage: todayReadings.passages[idx],
      dayNumber,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Nav bar */}
      <View
        style={[
          styles.navBar,
          {
            paddingTop: insets.top + 8,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navSide} activeOpacity={0.7}>
          <Text style={[styles.navSideText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
            ‹ Back
          </Text>
        </TouchableOpacity>

        <View style={styles.navCenter}>
          <Text
            style={[styles.passageRef, { color: colors.textPrimary, fontFamily: 'Inter_600SemiBold' }]}
            numberOfLines={1}
          >
            {passage.displayText}
          </Text>
          {totalPassages > 1 && (
            <Text style={[styles.passageProgress, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
              {passageIdx + 1} of {totalPassages}
            </Text>
          )}
        </View>

        <View style={[styles.navSide, styles.fontControls]}>
          <TouchableOpacity
            onPress={() => setFontSize((s) => Math.max(13, s - 2))}
            activeOpacity={0.7}
            style={styles.fontBtn}
          >
            <Text style={[styles.fontBtnText, { color: colors.primary }]}>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFontSize((s) => Math.min(28, s + 2))}
            activeOpacity={0.7}
            style={styles.fontBtn}
          >
            <Text style={[styles.fontBtnText, { color: colors.primary }]}>A+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Translation selector */}
      <View style={[styles.translationBar, { backgroundColor: colors.surfaceAlt, borderBottomColor: colors.border }]}>
        {TRANSLATIONS.map((t) => {
          const isActive = bibleTranslation === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => { haptics.select(); setBibleTranslation(t.id); }}
              activeOpacity={0.8}
              style={[
                styles.transBtn,
                isActive && { backgroundColor: colors.primary, borderRadius: 8 },
              ]}
            >
              <Text
                style={[
                  styles.transBtnText,
                  {
                    color: isActive ? '#FFFFFF' : colors.textSecondary,
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

      {/* Content */}
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {isRead && (
          <View style={[styles.readBanner, { backgroundColor: colors.success + '1A', borderColor: colors.success + '55' }]}>
            <Text style={[styles.readBannerText, { color: colors.success, fontFamily: 'Inter_500Medium' }]}>
              ✓ You've read this passage
            </Text>
          </View>
        )}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
              Loading passage…
            </Text>
          </View>
        ) : data ? (
          <View style={styles.passageWrap}>
            <Text style={[styles.refHeader, { color: colors.textTertiary, fontFamily: 'Inter_400Regular' }]}>
              {data.reference} — {data.translation_name}
            </Text>
            {data.verses.map((verse, i) => (
              <View key={i} style={styles.verseRow}>
                <Text style={[styles.verseNum, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                  {verse.verse}
                </Text>
                <Text
                  style={[
                    styles.verseText,
                    {
                      color: colors.textPrimary,
                      fontFamily: 'Inter_400Regular',
                      fontSize,
                      lineHeight: fontSize * 1.65,
                    },
                  ]}
                >
                  {verse.text}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.center}>
            <Text style={[styles.errorText, { color: colors.textSecondary, fontFamily: 'Inter_400Regular' }]}>
              Could not load passage.{'\n'}Check your internet connection.
            </Text>
            <TouchableOpacity onPress={load} style={styles.retryBtn} activeOpacity={0.7}>
              <Text style={[styles.retryText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom bar */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom + 10,
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => goToPassage(passageIdx - 1)}
          disabled={passageIdx <= 0}
          activeOpacity={0.7}
          style={[styles.navPassageBtn, passageIdx <= 0 && styles.disabled]}
        >
          <Text style={[styles.navPassageText, { color: colors.primary }]}>‹ Prev</Text>
        </TouchableOpacity>

        <HapticButton
          onPress={handleMarkRead}
          label={isRead ? '✓ Read' : 'Mark as Read'}
          variant={isRead ? 'secondary' : 'primary'}
          size="md"
          style={styles.markReadBtn}
        />

        <TouchableOpacity
          onPress={() => goToPassage(passageIdx + 1)}
          disabled={passageIdx >= totalPassages - 1}
          activeOpacity={0.7}
          style={[styles.navPassageBtn, passageIdx >= totalPassages - 1 && styles.disabled]}
        >
          <Text style={[styles.navPassageText, { color: colors.primary }]}>Next ›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navSide: { width: 70 },
  navSideText: { fontSize: 17 },
  navCenter: { flex: 1, alignItems: 'center' },
  passageRef: { fontSize: 16, letterSpacing: -0.2 },
  passageProgress: { fontSize: 12, marginTop: 2 },
  fontControls: { flexDirection: 'row', justifyContent: 'flex-end', gap: 2 },
  fontBtn: { padding: 6 },
  fontBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  translationBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 7,
    gap: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  transBtn: { paddingHorizontal: 12, paddingVertical: 5 },
  transBtnText: { fontSize: 13 },
  scroll: { padding: 20 },
  readBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  readBannerText: { fontSize: 14 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 14 },
  loadingText: { fontSize: 15 },
  errorText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  retryBtn: { padding: 8 },
  retryText: { fontSize: 16 },
  passageWrap: { gap: 6 },
  refHeader: { fontSize: 12, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.6 },
  verseRow: { flexDirection: 'row', gap: 8, marginBottom: 2 },
  verseNum: { fontSize: 11, width: 22, paddingTop: 5, flexShrink: 0 },
  verseText: { flex: 1 },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  navPassageBtn: { width: 60, padding: 6 },
  navPassageText: { fontSize: 16, fontFamily: 'Inter_500Medium' },
  markReadBtn: { flex: 1 },
  disabled: { opacity: 0.3 },
});
