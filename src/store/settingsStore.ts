import { create } from 'zustand';
import { BibleTranslation } from '../types/bible.types';
import * as bibleRepository from '../db/bibleRepository';

type Theme = 'light' | 'dark' | 'auto';

interface SettingsStore {
  theme: Theme;
  bibleTranslation: BibleTranslation;
  hasOnboarded: boolean;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // 'HH:MM'
  isLoaded: boolean;

  loadSettings: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  setBibleTranslation: (translation: BibleTranslation) => Promise<void>;
  setHasOnboarded: (value: boolean) => Promise<void>;
  setDailyReminderEnabled: (enabled: boolean) => Promise<void>;
  setDailyReminderTime: (time: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: 'auto',
  bibleTranslation: 'kjv',
  hasOnboarded: false,
  dailyReminderEnabled: false,
  dailyReminderTime: '08:00',
  isLoaded: false,

  loadSettings: async () => {
    const [theme, translation, onboarded, reminder, reminderTime] = await Promise.all([
      bibleRepository.getSetting('theme'),
      bibleRepository.getSetting('bible_translation'),
      bibleRepository.getSetting('has_onboarded'),
      bibleRepository.getSetting('daily_reminder_enabled'),
      bibleRepository.getSetting('daily_reminder_time'),
    ]);
    set({
      theme: (theme as Theme) ?? 'auto',
      bibleTranslation: (translation as BibleTranslation) ?? 'kjv',
      hasOnboarded: onboarded === 'true',
      dailyReminderEnabled: reminder === 'true',
      dailyReminderTime: reminderTime ?? '08:00',
      isLoaded: true,
    });
  },

  setTheme: async (theme) => {
    await bibleRepository.setSetting('theme', theme);
    set({ theme });
  },

  setBibleTranslation: async (translation) => {
    await bibleRepository.setSetting('bible_translation', translation);
    set({ bibleTranslation: translation });
  },

  setHasOnboarded: async (value) => {
    await bibleRepository.setSetting('has_onboarded', value.toString());
    set({ hasOnboarded: value });
  },

  setDailyReminderEnabled: async (enabled) => {
    await bibleRepository.setSetting('daily_reminder_enabled', enabled.toString());
    set({ dailyReminderEnabled: enabled });
  },

  setDailyReminderTime: async (time) => {
    await bibleRepository.setSetting('daily_reminder_time', time);
    set({ dailyReminderTime: time });
  },
}));
