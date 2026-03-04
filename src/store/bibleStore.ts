import { create } from 'zustand';
import { UserBiblePlan, BibleTranslation, DailyReading, PlanId } from '../types/bible.types';
import * as bibleRepository from '../db/bibleRepository';
import { getPlanById, getDayReadings } from '../utils/planDefinitions';
import { formatDateKey, getDaysBetween } from '../utils/dateHelpers';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

interface BibleStore {
  activePlan: UserBiblePlan | null;
  isLoading: boolean;
  error: string | null;

  loadActivePlan: () => Promise<void>;
  setActivePlan: (planId: PlanId, startDate?: string) => Promise<void>;
  markPassageRead: (passageId: string) => Promise<void>;
  markDayComplete: (dayNumber: number) => Promise<void>;
  getTodayReadings: () => DailyReading | null;
  getCurrentDayNumber: () => number;
  getProgressPercent: () => number;
  updateStreak: () => Promise<void>;
}

export const useBibleStore = create<BibleStore>((set, get) => ({
  activePlan: null,
  isLoading: false,
  error: null,

  loadActivePlan: async () => {
    set({ isLoading: true });
    try {
      const plan = await bibleRepository.getActivePlan();
      set({ activePlan: plan, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  setActivePlan: async (planId, startDate) => {
    const start = startDate ?? formatDateKey(new Date());
    const plan: UserBiblePlan = {
      id: uuidv4(),
      planId,
      startDate: start,
      currentDay: 1,
      completedDays: [],
      completedPassages: [],
      streak: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    await bibleRepository.insertPlan(plan);
    set({ activePlan: plan });
  },

  markPassageRead: async (passageId) => {
    const plan = get().activePlan;
    if (!plan) return;
    if (plan.completedPassages.includes(passageId)) return;
    const updated = {
      ...plan,
      completedPassages: [...plan.completedPassages, passageId],
    };
    await bibleRepository.updatePlan(plan.id, { completedPassages: updated.completedPassages });
    set({ activePlan: updated });
  },

  markDayComplete: async (dayNumber) => {
    const plan = get().activePlan;
    if (!plan) return;
    if (plan.completedDays.includes(dayNumber)) return;
    const today = formatDateKey(new Date());
    const updated = {
      ...plan,
      completedDays: [...plan.completedDays, dayNumber],
      lastReadDate: today,
    };
    await bibleRepository.updatePlan(plan.id, {
      completedDays: updated.completedDays,
      lastReadDate: today,
    });
    set({ activePlan: updated });
    // Recalculate streak
    await get().updateStreak();
  },

  updateStreak: async () => {
    const plan = get().activePlan;
    if (!plan) return;
    const today = formatDateKey(new Date());
    const sortedDays = [...plan.completedDays].sort((a, b) => a - b);
    let streak = 0;
    let checkDate = today;
    for (let i = sortedDays.length - 1; i >= 0; i--) {
      const dayNum = sortedDays[i];
      const expectedDate = formatDateKey(
        new Date(new Date(plan.startDate).getTime() + (dayNum - 1) * 86400000)
      );
      if (expectedDate === checkDate) {
        streak++;
        checkDate = formatDateKey(new Date(new Date(checkDate).getTime() - 86400000));
      } else {
        break;
      }
    }
    await bibleRepository.updatePlan(plan.id, { streak });
    set({ activePlan: { ...plan, streak } });
  },

  getTodayReadings: () => {
    const plan = get().activePlan;
    if (!plan) return null;
    const dayNum = get().getCurrentDayNumber();
    return getDayReadings(plan.planId, dayNum);
  },

  getCurrentDayNumber: () => {
    const plan = get().activePlan;
    if (!plan) return 1;
    const today = formatDateKey(new Date());
    const diff = getDaysBetween(plan.startDate, today);
    const planDef = getPlanById(plan.planId);
    return Math.min(Math.max(diff + 1, 1), planDef?.totalDays ?? 365);
  },

  getProgressPercent: () => {
    const plan = get().activePlan;
    if (!plan) return 0;
    const planDef = getPlanById(plan.planId);
    if (!planDef) return 0;
    return Math.round((plan.completedDays.length / planDef.totalDays) * 100);
  },
}));
