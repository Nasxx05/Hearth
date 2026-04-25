import { toISO, addDays, isScheduledForDate } from './dateHelpers';
import type { PauseRange } from '../types/habit';

function isInRange(iso: string, ranges: PauseRange[], vacationMode: { start: string; end: string } | null): boolean {
  for (const r of ranges) {
    if (iso >= r.start && iso <= r.end) return true;
  }
  if (vacationMode && iso >= vacationMode.start && iso <= vacationMode.end) return true;
  return false;
}

export function calcCurrentStreak(
  completionDates: string[],
  schedule: number[],
  skipDates: string[],
  pauseRanges: PauseRange[] = [],
  vacationMode: { start: string; end: string } | null = null,
): number {
  const completedSet = new Set(completionDates);
  const skippedSet = new Set(skipDates);
  let streak = 0;
  let d = new Date();

  while (true) {
    const iso = toISO(d);
    if (skippedSet.has(iso) || isInRange(iso, pauseRanges, vacationMode)) {
      d = addDays(d, -1);
      continue;
    }
    if (!isScheduledForDate(schedule, iso)) {
      d = addDays(d, -1);
      if (streak === 0 && d < addDays(new Date(), -365)) break;
      continue;
    }
    if (completedSet.has(iso)) {
      streak++;
      d = addDays(d, -1);
    } else {
      if (iso === toISO(new Date())) {
        d = addDays(d, -1);
        continue;
      }
      break;
    }
    if (streak > 1000) break;
  }
  return streak;
}

export function calcLongestStreak(
  completionDates: string[],
  schedule: number[],
  skipDates: string[],
  pauseRanges: PauseRange[] = [],
  vacationMode: { start: string; end: string } | null = null,
): number {
  if (completionDates.length === 0) return 0;
  const sorted = [...completionDates].sort();
  const completedSet = new Set(sorted);
  const skippedSet = new Set(skipDates);
  let longest = 0;
  let current = 0;

  for (const iso of sorted) {
    if (skippedSet.has(iso) || isInRange(iso, pauseRanges, vacationMode)) continue;
    if (!isScheduledForDate(schedule, iso)) continue;
    const prev = toISO(addDays(new Date(iso), -1));
    if (completedSet.has(prev) || current === 0) {
      current++;
    } else {
      current = 1;
    }
    longest = Math.max(longest, current);
  }
  return longest;
}
