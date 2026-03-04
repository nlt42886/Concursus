import { create } from 'zustand';
import { Task, NewTask, UpdateTask } from '../types/task.types';
import * as taskRepository from '../db/taskRepository';
import { formatDateKey } from '../utils/dateHelpers';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

interface TaskStore {
  tasksByDate: Record<string, Task[]>;
  selectedDate: string;
  isLoading: boolean;
  error: string | null;

  setSelectedDate: (date: string) => void;
  loadTasksForDate: (date: string) => Promise<void>;
  loadTasksForWeek: (startDate: string, endDate: string) => Promise<void>;
  addTask: (task: NewTask) => Promise<Task>;
  updateTask: (id: string, updates: UpdateTask) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  uncompleteTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  reorderTasks: (date: string, orderedIds: string[]) => Promise<void>;
  getTasksForDate: (date: string) => Task[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasksByDate: {},
  selectedDate: formatDateKey(new Date()),
  isLoading: false,
  error: null,

  setSelectedDate: (date) => set({ selectedDate: date }),

  loadTasksForDate: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await taskRepository.getTasksByDate(date);
      set((state) => ({
        tasksByDate: { ...state.tasksByDate, [date]: tasks },
        isLoading: false,
      }));
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  loadTasksForWeek: async (startDate, endDate) => {
    set({ isLoading: true });
    try {
      const tasks = await taskRepository.getTasksForDateRange(startDate, endDate);
      const grouped: Record<string, Task[]> = {};
      for (const task of tasks) {
        if (!grouped[task.date]) grouped[task.date] = [];
        grouped[task.date].push(task);
      }
      set((state) => ({
        tasksByDate: { ...state.tasksByDate, ...grouped },
        isLoading: false,
      }));
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  addTask: async (newTask) => {
    const now = new Date().toISOString();
    const task: Task = {
      ...newTask,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    await taskRepository.insertTask(task);
    set((state) => {
      const existing = state.tasksByDate[task.date] ?? [];
      return {
        tasksByDate: {
          ...state.tasksByDate,
          [task.date]: [...existing, task],
        },
      };
    });
    return task;
  },

  updateTask: async (id, updates) => {
    await taskRepository.updateTask(id, updates);
    set((state) => {
      const newTasksByDate = { ...state.tasksByDate };
      for (const date in newTasksByDate) {
        newTasksByDate[date] = newTasksByDate[date].map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        );
      }
      return { tasksByDate: newTasksByDate };
    });
  },

  completeTask: async (id) => {
    const now = new Date().toISOString();
    await taskRepository.updateTask(id, { isCompleted: true, completedAt: now });
    set((state) => {
      const newTasksByDate = { ...state.tasksByDate };
      for (const date in newTasksByDate) {
        newTasksByDate[date] = newTasksByDate[date].map((t) =>
          t.id === id ? { ...t, isCompleted: true, completedAt: now, updatedAt: now } : t
        );
      }
      return { tasksByDate: newTasksByDate };
    });
  },

  uncompleteTask: async (id) => {
    const now = new Date().toISOString();
    await taskRepository.updateTask(id, { isCompleted: false, completedAt: undefined });
    set((state) => {
      const newTasksByDate = { ...state.tasksByDate };
      for (const date in newTasksByDate) {
        newTasksByDate[date] = newTasksByDate[date].map((t) =>
          t.id === id ? { ...t, isCompleted: false, completedAt: undefined, updatedAt: now } : t
        );
      }
      return { tasksByDate: newTasksByDate };
    });
  },

  deleteTask: async (id) => {
    await taskRepository.deleteTask(id);
    set((state) => {
      const newTasksByDate = { ...state.tasksByDate };
      for (const date in newTasksByDate) {
        newTasksByDate[date] = newTasksByDate[date].filter((t) => t.id !== id);
      }
      return { tasksByDate: newTasksByDate };
    });
  },

  reorderTasks: async (date, orderedIds) => {
    await taskRepository.reorderTasks(orderedIds);
    set((state) => {
      const tasks = state.tasksByDate[date] ?? [];
      const taskMap = Object.fromEntries(tasks.map((t) => [t.id, t]));
      const reordered = orderedIds.map((id, i) => ({ ...taskMap[id], sortOrder: i }));
      return {
        tasksByDate: { ...state.tasksByDate, [date]: reordered },
      };
    });
  },

  getTasksForDate: (date) => get().tasksByDate[date] ?? [],
}));
