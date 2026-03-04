export type PlanId =
  | 'mcheyne-one-year'
  | 'chronological-one-year'
  | 'genesis-to-revelation'
  | '90-day'
  | 'nt-30-days'
  | 'ot-one-year'
  | 'psalms-proverbs';

export type BibleTranslation = 'kjv' | 'web' | 'esv';

export interface Passage {
  id: string; // e.g. 'GEN.1'
  bookCode: string; // 'GEN'
  bookName: string; // 'Genesis'
  chapter: number;
  startVerse?: number;
  endVerse?: number;
  displayText: string; // 'Genesis 1'
  apiQuery: string; // URL-ready: 'genesis+1'
}

export interface DailyReading {
  day: number; // 1-based
  passages: Passage[];
}

export interface BibleReadingPlan {
  id: PlanId;
  name: string;
  description: string;
  totalDays: number;
  estimatedMinutesPerDay: number;
  dailyReadings: DailyReading[];
}

export interface UserBiblePlan {
  id: string;
  planId: PlanId;
  startDate: string; // 'YYYY-MM-DD'
  currentDay: number;
  completedDays: number[]; // day numbers
  completedPassages: string[]; // passage IDs
  streak: number;
  lastReadDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface BibleVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BiblePassageResponse {
  reference: string;
  verses: BibleVerse[];
  text: string;
  translation_id: string;
  translation_name: string;
}

export interface PassageCache {
  passageId: string;
  translation: BibleTranslation;
  verseText: string;
  fetchedAt: string;
}
