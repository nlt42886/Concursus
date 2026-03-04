import { Task, NewTask, UpdateTask } from '../types/task.types';
import { getDatabase } from './database';

function rowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    date: row.date,
    startTime: row.start_time ?? undefined,
    endTime: row.end_time ?? undefined,
    durationMinutes: row.duration_minutes ?? undefined,
    isCompleted: row.is_completed === 1,
    completedAt: row.completed_at ?? undefined,
    priority: row.priority,
    color: row.color,
    recurrence: JSON.parse(row.recurrence_json ?? '{"type":"none"}'),
    parentRecurringId: row.parent_recurring_id ?? undefined,
    tags: JSON.parse(row.tags_json ?? '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sortOrder: row.sort_order,
  };
}

export async function getTasksByDate(date: string): Promise<Task[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM tasks WHERE date = ? ORDER BY sort_order ASC, start_time ASC`,
    [date]
  );
  return rows.map(rowToTask);
}

export async function getTasksForDateRange(startDate: string, endDate: string): Promise<Task[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM tasks WHERE date >= ? AND date <= ? ORDER BY date ASC, sort_order ASC`,
    [startDate, endDate]
  );
  return rows.map(rowToTask);
}

export async function getTaskById(id: string): Promise<Task | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync(`SELECT * FROM tasks WHERE id = ?`, [id]);
  return row ? rowToTask(row) : null;
}

export async function insertTask(task: Task): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO tasks (
      id, title, description, date, start_time, end_time,
      duration_minutes, is_completed, completed_at, priority, color,
      recurrence_json, parent_recurring_id, tags_json, sort_order,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      task.id, task.title, task.description ?? null, task.date,
      task.startTime ?? null, task.endTime ?? null,
      task.durationMinutes ?? null, task.isCompleted ? 1 : 0,
      task.completedAt ?? null, task.priority, task.color,
      JSON.stringify(task.recurrence), task.parentRecurringId ?? null,
      JSON.stringify(task.tags), task.sortOrder, task.createdAt, task.updatedAt,
    ]
  );
}

export async function updateTask(id: string, updates: UpdateTask): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();
  const fields: string[] = ['updated_at = ?'];
  const values: any[] = [now];

  if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
  if (updates.date !== undefined) { fields.push('date = ?'); values.push(updates.date); }
  if (updates.startTime !== undefined) { fields.push('start_time = ?'); values.push(updates.startTime); }
  if (updates.endTime !== undefined) { fields.push('end_time = ?'); values.push(updates.endTime); }
  if (updates.durationMinutes !== undefined) { fields.push('duration_minutes = ?'); values.push(updates.durationMinutes); }
  if (updates.isCompleted !== undefined) { fields.push('is_completed = ?'); values.push(updates.isCompleted ? 1 : 0); }
  if (updates.completedAt !== undefined) { fields.push('completed_at = ?'); values.push(updates.completedAt); }
  if (updates.priority !== undefined) { fields.push('priority = ?'); values.push(updates.priority); }
  if (updates.color !== undefined) { fields.push('color = ?'); values.push(updates.color); }
  if (updates.recurrence !== undefined) { fields.push('recurrence_json = ?'); values.push(JSON.stringify(updates.recurrence)); }
  if (updates.tags !== undefined) { fields.push('tags_json = ?'); values.push(JSON.stringify(updates.tags)); }
  if (updates.sortOrder !== undefined) { fields.push('sort_order = ?'); values.push(updates.sortOrder); }

  values.push(id);
  await db.runAsync(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteTask(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync(`DELETE FROM tasks WHERE id = ?`, [id]);
}

export async function reorderTasks(orderedIds: string[]): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();
  for (let i = 0; i < orderedIds.length; i++) {
    await db.runAsync(
      `UPDATE tasks SET sort_order = ?, updated_at = ? WHERE id = ?`,
      [i, now, orderedIds[i]]
    );
  }
}
