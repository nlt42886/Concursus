export type RecurrenceRule =
  | { type: 'none' }
  | { type: 'daily' }
  | { type: 'weekly'; daysOfWeek: number[] } // 0=Sun, 6=Sat
  | { type: 'monthly'; dayOfMonth: number }
  | { type: 'custom'; intervalDays: number };

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // 'YYYY-MM-DD'
  startTime?: string; // 'HH:MM' 24hr
  endTime?: string;
  durationMinutes?: number;
  isCompleted: boolean;
  completedAt?: string;
  priority: Priority;
  color: string; // Hex color for time block
  recurrence: RecurrenceRule;
  parentRecurringId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
}

export type NewTask = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTask = Partial<Omit<Task, 'id' | 'createdAt'>>;

export interface ParsedNLTask {
  title: string;
  date?: Date;
  startTime?: string;
  durationMinutes?: number;
  recurrence?: RecurrenceRule;
}
