import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

const CREATE_TASKS_SQL = `
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    duration_minutes INTEGER,
    is_completed INTEGER DEFAULT 0,
    completed_at TEXT,
    priority TEXT DEFAULT 'medium',
    color TEXT DEFAULT '#6366F1',
    recurrence_json TEXT DEFAULT '{"type":"none"}',
    parent_recurring_id TEXT,
    tags_json TEXT DEFAULT '[]',
    sort_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`;

const CREATE_BIBLE_PLANS_SQL = `
  CREATE TABLE IF NOT EXISTS user_bible_plans (
    id TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL,
    start_date TEXT NOT NULL,
    current_day INTEGER DEFAULT 1,
    completed_days_json TEXT DEFAULT '[]',
    completed_passages_json TEXT DEFAULT '[]',
    streak INTEGER DEFAULT 0,
    last_read_date TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL
  );
`;

const CREATE_PASSAGE_CACHE_SQL = `
  CREATE TABLE IF NOT EXISTS bible_passage_cache (
    passage_id TEXT PRIMARY KEY,
    translation TEXT NOT NULL,
    verse_text TEXT NOT NULL,
    fetched_at TEXT NOT NULL
  );
`;

const CREATE_SETTINGS_SQL = `
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;

export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync('concursus.db');
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync(CREATE_TASKS_SQL);
  await db.execAsync(CREATE_BIBLE_PLANS_SQL);
  await db.execAsync(CREATE_PASSAGE_CACHE_SQL);
  await db.execAsync(CREATE_SETTINGS_SQL);

  // Seed default settings
  await db.runAsync(
    `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
    ['theme', 'auto']
  );
  await db.runAsync(
    `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
    ['bible_translation', 'kjv']
  );
  await db.runAsync(
    `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
    ['has_onboarded', 'false']
  );
  await db.runAsync(
    `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
    ['daily_reminder_enabled', 'false']
  );
  await db.runAsync(
    `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
    ['daily_reminder_time', '08:00']
  );
}

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}
