import { addDays, nextMonday, nextTuesday, nextWednesday, nextThursday, nextFriday, nextSaturday, nextSunday, parse } from 'date-fns';
import { ParsedNLTask, RecurrenceRule } from '../types/task.types';

const TIME_PATTERN = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;
const TIME_24_PATTERN = /\b(\d{2}):(\d{2})\b/;
const DURATION_PATTERN = /\bfor\s+(\d+(?:\.\d+)?)\s*(min(?:utes?)?|hrs?|hours?)\b/i;
const REPEAT_PATTERN = /\b(every\s+day|daily|every\s+morning|every\s+night|every\s+(mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?))\b/i;
const DATE_PATTERN = /\b(today|tomorrow|yesterday|next\s+(?:mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?))\b/i;

export function parseNaturalLanguage(input: string): ParsedNLTask {
  let remaining = input;
  let date: Date | undefined;
  let startTime: string | undefined;
  let durationMinutes: number | undefined;
  let recurrence: RecurrenceRule | undefined;

  // Extract date
  const dateMatch = remaining.match(DATE_PATTERN);
  if (dateMatch) {
    const word = dateMatch[1].toLowerCase();
    const today = new Date();
    if (word === 'today') date = today;
    else if (word === 'tomorrow') date = addDays(today, 1);
    else if (word === 'yesterday') date = addDays(today, -1);
    else if (word.includes('mon')) date = nextMonday(today);
    else if (word.includes('tue')) date = nextTuesday(today);
    else if (word.includes('wed')) date = nextWednesday(today);
    else if (word.includes('thu')) date = nextThursday(today);
    else if (word.includes('fri')) date = nextFriday(today);
    else if (word.includes('sat')) date = nextSaturday(today);
    else if (word.includes('sun')) date = nextSunday(today);
    remaining = remaining.replace(dateMatch[0], '').trim();
  }

  // Extract 12-hour time
  const timeMatch = remaining.match(TIME_PATTERN);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const period = timeMatch[3].toLowerCase();
    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
    startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    remaining = remaining.replace(timeMatch[0], '').trim();
  }

  // Extract 24-hour time (if no 12-hr found)
  if (!startTime) {
    const time24Match = remaining.match(TIME_24_PATTERN);
    if (time24Match) {
      startTime = `${time24Match[1]}:${time24Match[2]}`;
      remaining = remaining.replace(time24Match[0], '').trim();
    }
  }

  // Extract duration
  const durMatch = remaining.match(DURATION_PATTERN);
  if (durMatch) {
    const amount = parseFloat(durMatch[1]);
    const unit = durMatch[2].toLowerCase();
    durationMinutes = unit.startsWith('h') ? Math.round(amount * 60) : Math.round(amount);
    remaining = remaining.replace(durMatch[0], '').trim();
  }

  // Extract recurrence
  const repeatMatch = remaining.match(REPEAT_PATTERN);
  if (repeatMatch) {
    const word = repeatMatch[1].toLowerCase();
    if (word === 'every day' || word === 'daily' || word === 'every morning' || word === 'every night') {
      recurrence = { type: 'daily' };
    } else {
      const dayMap: Record<string, number> = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0 };
      const dayKey = Object.keys(dayMap).find(k => word.includes(k));
      if (dayKey) recurrence = { type: 'weekly', daysOfWeek: [dayMap[dayKey]] };
    }
    remaining = remaining.replace(repeatMatch[0], '').trim();
  }

  // Clean up title
  const title = remaining
    .replace(/\s+/g, ' ')
    .replace(/^[,\s]+|[,\s]+$/g, '')
    .trim() || input.trim();

  return { title, date, startTime, durationMinutes, recurrence };
}
