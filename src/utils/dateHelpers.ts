import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInDays, parseISO, isSameDay, isToday, isBefore, isAfter } from 'date-fns';

export const TODAY = format(new Date(), 'yyyy-MM-dd');

export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  return format(date, 'EEEE, MMMM d');
}

export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d');
}

export function formatDayOfWeek(dateStr: string): string {
  return format(parseISO(dateStr), 'EEE');
}

export function formatDayNumber(dateStr: string): string {
  return format(parseISO(dateStr), 'd');
}

export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function getMonthDays(date: Date): Date[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const days: Date[] = [];
  let current = start;
  while (!isAfter(current, end)) {
    days.push(current);
    current = addDays(current, 1);
  }
  return days;
}

export function getDaysBetween(startDate: string, endDate: string): number {
  return differenceInDays(parseISO(endDate), parseISO(startDate));
}

export function addDaysToDateStr(dateStr: string, days: number): string {
  return formatDateKey(addDays(parseISO(dateStr), days));
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function timeStringToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export { isToday, isSameDay, isBefore, isAfter, parseISO, format, addDays };
