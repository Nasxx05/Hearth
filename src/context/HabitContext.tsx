import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import type { Habit, UserProfile, Reflection, Achievement, UndoAction, View, ThemeMode } from '../types/habit';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { todayISO, toISO, addDays } from '../utils/dateHelpers';
import { calcCurrentStreak, calcLongestStreak } from '../utils/streakCalculator';
import { useNotifications } from '../hooks/useNotifications';
import { useSupabaseSync } from '../hooks/useSupabaseSync';
import type { ExportPayload } from '../utils/exportImport';

// Wipe any previously stored data so the app always starts fresh.
// Change this token string to force another reset in the future.
const RESET_TOKEN = 'hearth_reset_v1';
if (typeof window !== 'undefined' && !localStorage.getItem(RESET_TOKEN)) {
  Object.keys(localStorage)
    .filter(k => k.startsWith('hearth_'))
    .forEach(k => localStorage.removeItem(k));
  localStorage.setItem(RESET_TOKEN, '1');
}

interface CelebrationInfo {
  habitName: string;
  habitIcon: string;
  habitColor: Habit['color'];
  streak: number;
  isPerfectDay: boolean;
}

interface StreakMilestone {
  habitName: string;
  streak: number;
  habitColor: Habit['color'];
}

interface HabitContextValue {
  habits: Habit[];
  profile: UserProfile;
  reflections: Reflection[];
  achievements: Achievement[];
  undoAction: UndoAction | null;
  celebration: CelebrationInfo | null;
  currentView: View;
  selectedHabitId: string | null;
  themeMode: ThemeMode;
  isDark: boolean;
  showPremiumGate: boolean;
  newlyUnlockedAchievement: Achievement | null;
  streakMilestone: StreakMilestone | null;

  addHabit: (h: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'longestStreak' | 'completionDates' | 'isCompletedToday' | 'skipDates' | 'quantityToday' | 'streakFreezes' | 'lastFreezeRefill'>) => void;
  updateHabit: (id: string, changes: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string, date?: string) => void;
  setQuantity: (id: string, qty: number) => void;
  skipToday: (id: string) => void;

  updateProfile: (p: Partial<UserProfile>) => void;
  addReflection: (r: Omit<Reflection, 'id' | 'createdAt'>) => void;

  navigate: (view: View, habitId?: string) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setShowPremiumGate: (v: boolean) => void;
  dismissUndo: () => void;
  executeUndo: () => void;
  dismissCelebration: () => void;
  dismissAchievementToast: () => void;
  dismissStreakMilestone: () => void;
  importAll: (payload: ExportPayload) => void;

  getHabit: (id: string) => Habit | undefined;
  todayCompletionRate: () => number;
  todayCompleted: () => number;
  weeklyReviewData: () => { week: number; rate: number; dayRates: number[] };
}

const HabitContext = createContext<HabitContextValue | null>(null);


function recompute(h: Habit, vacationMode: { start: string; end: string } | null = null): Habit {
  const today = todayISO();
  const currentStreak = calcCurrentStreak(h.completionDates, h.schedule, h.skipDates, h.pauseRanges ?? [], vacationMode);
  const longestStreak = Math.max(h.longestStreak, calcLongestStreak(h.completionDates, h.schedule, h.skipDates, h.pauseRanges ?? [], vacationMode));
  const isCompletedToday = h.completionDates.includes(today);
  return { ...h, currentStreak, longestStreak, isCompletedToday };
}

function migrateHabits(raw: unknown[]): Habit[] {
  return raw.map((h: unknown) => {
    const habit = h as Record<string, unknown>;
    return {
      id: habit.id as string ?? uuid(),
      name: habit.name as string ?? '',
      icon: (habit.icon as string) ?? (habit.shape ? 'Flame' : 'Flame'),
      color: (habit.color as string) ?? 'moss',
      category: (habit.category as string) ?? 'General',
      targetValue: (habit.targetValue as number) ?? 1,
      targetUnit: (habit.targetUnit as string) ?? (habit.target as string ? (habit.target as string).split(' ')[1] ?? 'times' : 'times'),
      createdAt: (habit.createdAt as string) ?? new Date().toISOString(),
      currentStreak: (habit.currentStreak as number) ?? 0,
      longestStreak: (habit.longestStreak as number) ?? 0,
      completionDates: (habit.completionDates as string[]) ?? [],
      isCompletedToday: (habit.isCompletedToday as boolean) ?? false,
      schedule: (habit.schedule as number[]) ?? [0, 1, 2, 3, 4, 5, 6],
      reminderTime: (habit.reminderTime as string | null) ?? null,
      skipDates: (habit.skipDates as string[]) ?? [],
      quantityToday: (habit.quantityToday as number) ?? 0,
      pauseRanges: (habit.pauseRanges as { start: string; end: string }[]) ?? [],
      streakFreezes: (habit.streakFreezes as number) ?? 0,
      lastFreezeRefill: (habit.lastFreezeRefill as string) ?? '',
    } as Habit;
  });
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'You',
  tagline: 'Building quiet daily wins.',
  joinDate: new Date().toISOString(),
  avatar: '',
  vacationMode: null,
  isPremium: false,
};

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', name: '7 days', description: 'Complete any habit 7 days in a row', icon: '🔥', unlocked: false, unlockedAt: null },
  { id: 'a2', name: '30 days', description: '30-day streak on any habit', icon: '🔥', unlocked: false, unlockedAt: null },
  { id: 'a3', name: '100 days', description: '100-day streak on any habit', icon: '🔥', unlocked: false, unlockedAt: null },
  { id: 'a4', name: '365 days', description: 'One full year streak', icon: '🔥', unlocked: false, unlockedAt: null },
  { id: 'a5', name: 'First habit', description: 'Add your first habit', icon: '✦', unlocked: false, unlockedAt: null },
  { id: 'a6', name: '5 habits', description: 'Track 5 habits at once', icon: '✦', unlocked: false, unlockedAt: null },
  { id: 'a7', name: 'Perfect week', description: 'Complete all habits every day for a week', icon: '★', unlocked: false, unlockedAt: null },
  { id: 'a8', name: 'Perfect month', description: 'Perfect week four times in a row', icon: '★', unlocked: false, unlockedAt: null },
];

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

function checkAchievements(
  habits: Habit[],
  achievements: Achievement[],
): { updated: Achievement[]; newlyUnlocked: Achievement | null } {
  const now = new Date().toISOString();
  let newlyUnlocked: Achievement | null = null;
  const maxStreak = Math.max(0, ...habits.map(h => h.currentStreak));
  const updatedAchievements = achievements.map(a => {
    if (a.unlocked) return a;
    let shouldUnlock = false;
    switch (a.id) {
      case 'a1': shouldUnlock = maxStreak >= 7; break;
      case 'a2': shouldUnlock = maxStreak >= 30; break;
      case 'a3': shouldUnlock = maxStreak >= 100; break;
      case 'a4': shouldUnlock = maxStreak >= 365; break;
      case 'a5': shouldUnlock = habits.length >= 1; break;
      case 'a6': shouldUnlock = habits.length >= 5; break;
      case 'a7': {
        const today = new Date();
        const allComplete = Array.from({ length: 7 }, (_, i) => toISO(addDays(today, -i)))
          .every(iso => habits.length > 0 && habits.every(h => !h.schedule.includes(new Date(iso + 'T12:00:00').getDay()) || h.completionDates.includes(iso) || h.skipDates.includes(iso)));
        shouldUnlock = allComplete;
        break;
      }
      case 'a8': shouldUnlock = false; break;
    }
    if (shouldUnlock) {
      const unlocked = { ...a, unlocked: true, unlockedAt: now };
      if (!newlyUnlocked) newlyUnlocked = unlocked;
      return unlocked;
    }
    return a;
  });
  return { updated: updatedAchievements, newlyUnlocked };
}

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [rawHabits, setRawHabits] = useLocalStorage<unknown[]>('hearth_habits', []);
  const [hasOnboarded, setHasOnboarded] = useLocalStorage<boolean>('hearth_onboarded', false);
  const [profile, setProfile] = useLocalStorage<UserProfile>('hearth_profile', DEFAULT_PROFILE);
  const [reflections, setReflections] = useLocalStorage<Reflection[]>('hearth_reflections', []);
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>('hearth_achievements', DEFAULT_ACHIEVEMENTS);
  const [currentView, setCurrentView] = useLocalStorage<View>('hearth_view', 'onboarding');
  const [selectedHabitId, setSelectedHabitId] = useLocalStorage<string | null>('hearth_selected', null);
  const [themeMode, setThemeModeStored] = useLocalStorage<ThemeMode>('hearth_theme', 'system');
  const [undoAction, setUndoAction] = useLocalStorage<UndoAction | null>('hearth_undo', null);
  const [celebration, setCelebration] = useState<CelebrationInfo | null>(null);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState<Achievement | null>(null);
  const [streakMilestone, setStreakMilestone] = useState<StreakMilestone | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { debouncedSync } = useSupabaseSync();

  const habits: Habit[] = migrateHabits(rawHabits).map(h => recompute(h, profile.vacationMode ?? null));
  useNotifications(habits);

  const isDark = themeMode === 'dark' ||
    (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  // Monday freeze refill on mount
  useEffect(() => {
    const today = todayISO();
    const dayOfWeek = new Date().getDay(); // 0=Sun,1=Mon
    if (dayOfWeek !== 1) return;
    const needsRefill = habits.some(h => h.lastFreezeRefill < today);
    if (!needsRefill) return;
    const updated = habits.map(h => ({
      ...h,
      streakFreezes: Math.min(2, h.streakFreezes + 2),
      lastFreezeRefill: today,
    }));
    setRawHabits(updated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveHabitsAndSync = useCallback((updated: Habit[]) => {
    setRawHabits(updated);
    debouncedSync(updated, profile, reflections);
  }, [setRawHabits, debouncedSync, profile, reflections]);

  const runCheckAchievements = useCallback((currentHabits: Habit[]) => {
    const { updated, newlyUnlocked } = checkAchievements(currentHabits, achievements);
    if (newlyUnlocked) {
      setAchievements(updated);
      setNewlyUnlockedAchievement(newlyUnlocked);
    }
  }, [achievements, setAchievements]);

  const addHabit = useCallback((data: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'longestStreak' | 'completionDates' | 'isCompletedToday' | 'skipDates' | 'quantityToday' | 'streakFreezes' | 'lastFreezeRefill'>) => {
    if (!profile.isPremium && habits.length >= 3) {
      setShowPremiumGate(true);
      return;
    }
    const newHabit: Habit = {
      ...data,
      id: uuid(),
      createdAt: new Date().toISOString(),
      currentStreak: 0,
      longestStreak: 0,
      completionDates: [],
      isCompletedToday: false,
      skipDates: [],
      quantityToday: 0,
      streakFreezes: 0,
      lastFreezeRefill: '',
    };
    const updated = [...habits, newHabit];
    saveHabitsAndSync(updated);
    runCheckAchievements(updated);
  }, [habits, profile.isPremium, saveHabitsAndSync, runCheckAchievements]);

  const updateHabit = useCallback((id: string, changes: Partial<Habit>) => {
    const updated = habits.map(h => h.id === id ? recompute({ ...h, ...changes }) : h);
    saveHabitsAndSync(updated);
  }, [habits, saveHabitsAndSync]);

  const deleteHabit = useCallback((id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    setUndoAction({ type: 'delete', habitId: id, habitData: habit, timestamp: Date.now() });
    saveHabitsAndSync(habits.filter(h => h.id !== id));
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndoAction(null), 5000);
  }, [habits, saveHabitsAndSync, setUndoAction]);

  const toggleHabit = useCallback((id: string, date?: string) => {
    const targetDate = date ?? todayISO();
    const today = todayISO();
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const wasCompleted = habit.completionDates.includes(targetDate);
    if (targetDate === today) {
      setUndoAction({ type: 'toggle', habitId: id, timestamp: Date.now() });
    }

    let newDates = wasCompleted
      ? habit.completionDates.filter(d => d !== targetDate)
      : [...habit.completionDates, targetDate];

    let newFreezes = habit.streakFreezes;

    // Streak freeze: bridge missed yesterday when completing today (premium only)
    if (!wasCompleted && targetDate === today && profile.isPremium && habit.streakFreezes > 0) {
      const yesterday = toISO(addDays(new Date(), -1));
      const yesterdayDayOfWeek = new Date(yesterday + 'T12:00:00').getDay();
      const isScheduledYesterday = habit.schedule.includes(yesterdayDayOfWeek);
      const missedYesterday = isScheduledYesterday &&
        !habit.completionDates.includes(yesterday) &&
        !habit.skipDates.includes(yesterday);
      if (missedYesterday) {
        newDates = [...newDates, yesterday];
        newFreezes = habit.streakFreezes - 1;
      }
    }

    const updatedHabit = recompute({ ...habit, completionDates: newDates, streakFreezes: newFreezes });
    const updated = habits.map(h => h.id === id ? updatedHabit : h);
    saveHabitsAndSync(updated);

    if (!wasCompleted) {
      const newStreak = updatedHabit.currentStreak;
      const othersDone = habits.filter(h => h.id !== id && h.completionDates.includes(today)).length;
      const isPerfectDay = targetDate === today && othersDone === habits.length - 1;
      setCelebration({ habitName: habit.name, habitIcon: habit.icon, habitColor: habit.color, streak: newStreak, isPerfectDay });

      if (STREAK_MILESTONES.includes(newStreak)) {
        setStreakMilestone({ habitName: habit.name, streak: newStreak, habitColor: habit.color });
      }

      runCheckAchievements(updated);
    }

    if (targetDate === today) {
      if (undoTimer.current) clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(() => setUndoAction(null), 4000);
    }
  }, [habits, profile.isPremium, saveHabitsAndSync, setUndoAction, runCheckAchievements]);

  const setQuantity = useCallback((id: string, qty: number) => {
    const updated = habits.map(h => h.id === id ? { ...h, quantityToday: qty } : h);
    saveHabitsAndSync(updated);
  }, [habits, saveHabitsAndSync]);

  const skipToday = useCallback((id: string) => {
    const today = todayISO();
    const updated = habits.map(h =>
      h.id === id ? recompute({ ...h, skipDates: [...h.skipDates, today] }) : h
    );
    saveHabitsAndSync(updated);
  }, [habits, saveHabitsAndSync]);

  const updateProfile = useCallback((p: Partial<UserProfile>) => {
    const updated = { ...profile, ...p };
    setProfile(updated);
    debouncedSync(habits, updated, reflections);
  }, [profile, setProfile, debouncedSync, habits, reflections]);

  const addReflection = useCallback((r: Omit<Reflection, 'id' | 'createdAt'>) => {
    const newRef: Reflection = { ...r, id: uuid(), createdAt: new Date().toISOString() };
    setReflections([...reflections, newRef]);
  }, [reflections, setReflections]);

  const navigate = useCallback((view: View, habitId?: string) => {
    if (habitId !== undefined) setSelectedHabitId(habitId);
    setCurrentView(view);
    if (view === 'home' && !hasOnboarded) setHasOnboarded(true);
  }, [setCurrentView, setSelectedHabitId, hasOnboarded, setHasOnboarded]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeStored(mode);
  }, [setThemeModeStored]);

  const dismissUndo = useCallback(() => {
    setUndoAction(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  }, [setUndoAction]);

  const dismissCelebration = useCallback(() => setCelebration(null), []);
  const dismissAchievementToast = useCallback(() => setNewlyUnlockedAchievement(null), []);
  const dismissStreakMilestone = useCallback(() => setStreakMilestone(null), []);

  const executeUndo = useCallback(() => {
    if (!undoAction) return;
    if (undoAction.type === 'toggle') {
      toggleHabit(undoAction.habitId);
    } else if (undoAction.type === 'delete' && undoAction.habitData) {
      saveHabitsAndSync([...habits, undoAction.habitData]);
    }
    setUndoAction(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  }, [undoAction, habits, toggleHabit, saveHabitsAndSync, setUndoAction]);

  const importAll = useCallback((payload: ExportPayload) => {
    setRawHabits(payload.habits);
    setProfile(payload.profile);
    setReflections(payload.reflections);
    setAchievements(payload.achievements);
  }, [setRawHabits, setProfile, setReflections, setAchievements]);

  const getHabit = useCallback((id: string) => habits.find(h => h.id === id), [habits]);

  const todayCompleted = useCallback(() => {
    const today = todayISO();
    return habits.filter(h => h.completionDates.includes(today)).length;
  }, [habits]);

  const todayCompletionRate = useCallback(() => {
    if (habits.length === 0) return 0;
    return Math.round((todayCompleted() / habits.length) * 100);
  }, [habits, todayCompleted]);

  const weeklyReviewData = useCallback(() => {
    const today = new Date();
    const weekNum = Math.ceil((today.getDate()) / 7);
    const dayRates: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const iso = toISO(addDays(today, -i));
      const completed = habits.filter(h => h.completionDates.includes(iso)).length;
      dayRates.push(habits.length > 0 ? completed / habits.length : 0);
    }
    const rate = Math.round(dayRates.reduce((a, b) => a + b, 0) / 7 * 100);
    return { week: weekNum, rate, dayRates };
  }, [habits]);

  const value: HabitContextValue = {
    habits, profile, reflections, achievements, undoAction, celebration,
    currentView, selectedHabitId, themeMode, isDark,
    showPremiumGate, newlyUnlockedAchievement, streakMilestone,
    addHabit, updateHabit, deleteHabit, toggleHabit, setQuantity, skipToday,
    updateProfile, addReflection,
    navigate, setThemeMode, setShowPremiumGate, dismissUndo, executeUndo,
    dismissCelebration, dismissAchievementToast, dismissStreakMilestone, importAll,
    getHabit, todayCompletionRate, todayCompleted, weeklyReviewData,
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}

export function useHabits(): HabitContextValue {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error('useHabits must be used inside HabitProvider');
  return ctx;
}
