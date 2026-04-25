import { useEffect, useRef, useCallback } from 'react';
import type { Habit } from '../types/habit';
import { todayISO } from '../utils/dateHelpers';

export function useNotifications(habits: Habit[]) {
  const habitsRef = useRef<Habit[]>(habits);
  const sentTodayRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    habitsRef.current = habits;
  }, [habits]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'denied';
    if (Notification.permission !== 'default') return Notification.permission;
    return Notification.requestPermission();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    function pad(n: number) { return n.toString().padStart(2, '0'); }

    function tick() {
      if (Notification.permission !== 'granted') return;
      const now = new Date();
      const hhmm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
      const today = todayISO();

      for (const habit of habitsRef.current) {
        if (!habit.reminderTime || habit.reminderTime !== hhmm) continue;
        const key = habit.id;
        if (sentTodayRef.current.get(key) === today) continue;
        sentTodayRef.current.set(key, today);
        new Notification(`Time for: ${habit.name}`, {
          body: `Keep your streak going! 🔥`,
          icon: '/icon-192.png',
        });
      }

      if (hhmm === '21:00') {
        const eodKey = 'eod-nudge';
        if (sentTodayRef.current.get(eodKey) !== today) {
          const incomplete = habitsRef.current.filter(h => !h.completionDates.includes(today));
          if (incomplete.length > 0) {
            sentTodayRef.current.set(eodKey, today);
            const names = incomplete.map(h => h.name).join(', ');
            new Notification('Still time today!', {
              body: `Not done yet: ${names}`,
              icon: '/icon-192.png',
            });
          }
        }
      }
    }

    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return { requestPermission };
}
