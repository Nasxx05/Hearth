export function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function startOfWeek(date: Date, startDay = 0): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day - startDay + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

export function formatDay(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function formatDateLabel(iso: string): string {
  const d = parseISO(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getDayOfWeek(iso: string): number {
  return parseISO(iso).getDay();
}

export function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => toISO(addDays(new Date(), i - 6)));
}

export function getLast14Days(): string[] {
  return Array.from({ length: 14 }, (_, i) => toISO(addDays(new Date(), i - 13)));
}

export function getLast30Days(): string[] {
  return Array.from({ length: 30 }, (_, i) => toISO(addDays(new Date(), i - 29)));
}

export function getMonthDays(year: number, month: number): { date: Date; iso: string }[] {
  const days: { date: Date; iso: string }[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    days.push({ date: new Date(d), iso: toISO(d) });
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function get17WeekGrid(): string[] {
  return Array.from({ length: 17 * 7 }, (_, i) =>
    toISO(addDays(new Date(), i - (17 * 7 - 1)))
  );
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function isScheduledForDate(schedule: number[], iso: string): boolean {
  if (schedule.length === 0) return true;
  return schedule.includes(getDayOfWeek(iso));
}

export function daysAgo(n: number): string {
  return toISO(addDays(new Date(), -n));
}
