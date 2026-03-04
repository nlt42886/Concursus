import { UserBiblePlan, PassageCache, BibleTranslation } from '../types/bible.types';
import { getDatabase } from './database';

function rowToPlan(row: any): UserBiblePlan {
  return {
    id: row.id,
    planId: row.plan_id,
    startDate: row.start_date,
    currentDay: row.current_day,
    completedDays: JSON.parse(row.completed_days_json ?? '[]'),
    completedPassages: JSON.parse(row.completed_passages_json ?? '[]'),
    streak: row.streak,
    lastReadDate: row.last_read_date ?? undefined,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
  };
}

export async function getActivePlan(): Promise<UserBiblePlan | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync(
    `SELECT * FROM user_bible_plans WHERE is_active = 1 LIMIT 1`
  );
  return row ? rowToPlan(row) : null;
}

export async function getPlanById(id: string): Promise<UserBiblePlan | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync(`SELECT * FROM user_bible_plans WHERE id = ?`, [id]);
  return row ? rowToPlan(row) : null;
}

export async function insertPlan(plan: UserBiblePlan): Promise<void> {
  const db = getDatabase();
  // Deactivate all other plans
  await db.runAsync(`UPDATE user_bible_plans SET is_active = 0`);
  await db.runAsync(
    `INSERT OR REPLACE INTO user_bible_plans (
      id, plan_id, start_date, current_day, completed_days_json,
      completed_passages_json, streak, last_read_date, is_active, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      plan.id, plan.planId, plan.startDate, plan.currentDay,
      JSON.stringify(plan.completedDays), JSON.stringify(plan.completedPassages),
      plan.streak, plan.lastReadDate ?? null, plan.isActive ? 1 : 0, plan.createdAt,
    ]
  );
}

export async function updatePlan(id: string, updates: Partial<UserBiblePlan>): Promise<void> {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.currentDay !== undefined) { fields.push('current_day = ?'); values.push(updates.currentDay); }
  if (updates.completedDays !== undefined) { fields.push('completed_days_json = ?'); values.push(JSON.stringify(updates.completedDays)); }
  if (updates.completedPassages !== undefined) { fields.push('completed_passages_json = ?'); values.push(JSON.stringify(updates.completedPassages)); }
  if (updates.streak !== undefined) { fields.push('streak = ?'); values.push(updates.streak); }
  if (updates.lastReadDate !== undefined) { fields.push('last_read_date = ?'); values.push(updates.lastReadDate); }
  if (updates.isActive !== undefined) { fields.push('is_active = ?'); values.push(updates.isActive ? 1 : 0); }

  if (fields.length === 0) return;
  values.push(id);
  await db.runAsync(`UPDATE user_bible_plans SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function getCachedPassage(passageId: string, translation: BibleTranslation): Promise<PassageCache | null> {
  const db = getDatabase();
  const cacheKey = `${passageId}:${translation}`;
  const row = await db.getFirstAsync(
    `SELECT * FROM bible_passage_cache WHERE passage_id = ?`,
    [cacheKey]
  );
  if (!row) return null;
  return {
    passageId: (row as any).passage_id,
    translation: (row as any).translation as BibleTranslation,
    verseText: (row as any).verse_text,
    fetchedAt: (row as any).fetched_at,
  };
}

export async function cachePassage(cache: PassageCache): Promise<void> {
  const db = getDatabase();
  const cacheKey = `${cache.passageId}:${cache.translation}`;
  await db.runAsync(
    `INSERT OR REPLACE INTO bible_passage_cache (passage_id, translation, verse_text, fetched_at)
     VALUES (?, ?, ?, ?)`,
    [cacheKey, cache.translation, cache.verseText, cache.fetchedAt]
  );
}

export async function getSetting(key: string): Promise<string | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync(`SELECT value FROM settings WHERE key = ?`, [key]);
  return row ? (row as any).value : null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [key, value]);
}
