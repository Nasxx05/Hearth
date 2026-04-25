import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, getSession } from '../lib/supabase';
import type { Habit, UserProfile, Reflection } from '../types/habit';

export function useSupabaseSync() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!supabase) return;
    getSession().then(async s => {
      setUserEmail(s?.user.email ?? null);
      if (s) {
        await supabase!.rpc('refill_freezes_weekly', { p_user_id: s.user.id });
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const syncUp = useCallback(async (habits: Habit[], profile: UserProfile, reflections: Reflection[]) => {
    if (!supabase) return;
    const session = await getSession();
    if (!session) return;
    setSyncing(true);
    try {
      const uid = session.user.id;

      await supabase.from('profiles').upsert({
        id: uid,
        name: profile.name,
        tagline: profile.tagline,
        avatar_url: profile.avatar,
        vacation_start: profile.vacationMode?.start ?? null,
        vacation_end: profile.vacationMode?.end ?? null,
        is_premium: profile.isPremium,
        updated_at: new Date().toISOString(),
      });

      for (const h of habits) {
        await supabase.from('habits').upsert({
          id: h.id,
          user_id: uid,
          name: h.name,
          icon: h.icon,
          color: h.color,
          category: h.category,
          target_value: h.targetValue,
          target_unit: h.targetUnit,
          schedule: h.schedule,
          reminder_time: h.reminderTime,
          streak_freezes: h.streakFreezes,
          last_freeze_refill: h.lastFreezeRefill || null,
          updated_at: new Date().toISOString(),
        });

        if (h.completionDates.length > 0) {
          await supabase.from('habit_completions').upsert(
            h.completionDates.map(d => ({ habit_id: h.id, user_id: uid, completed_on: d })),
            { onConflict: 'habit_id,completed_on' }
          );
        }

        if (h.skipDates.length > 0) {
          await supabase.from('habit_skips').upsert(
            h.skipDates.map(d => ({ habit_id: h.id, user_id: uid, skipped_on: d })),
            { onConflict: 'habit_id,skipped_on' }
          );
        }
      }

      if (reflections.length > 0) {
        await supabase.from('reflections').upsert(
          reflections.map(r => ({
            id: r.id,
            user_id: uid,
            habit_id: r.habitId,
            reflection_date: r.date,
            content: r.text,
          }))
        );
      }

      setLastSynced(new Date());
    } finally {
      setSyncing(false);
    }
  }, []);

  const debouncedSync = useCallback((habits: Habit[], profile: UserProfile, reflections: Reflection[]) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => syncUp(habits, profile, reflections), 2000);
  }, [syncUp]);

  return { userEmail, lastSynced, syncing, syncUp, debouncedSync };
}
