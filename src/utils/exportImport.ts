import type { Habit, UserProfile, Reflection, Achievement } from '../types/habit';
import { todayISO } from './dateHelpers';

export interface ExportPayload {
  version: 1;
  exportedAt: string;
  habits: Habit[];
  profile: UserProfile;
  reflections: Reflection[];
  achievements: Achievement[];
}

export function exportData(
  habits: Habit[],
  profile: UserProfile,
  reflections: Reflection[],
  achievements: Achievement[],
): void {
  const payload: ExportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    habits,
    profile,
    reflections,
    achievements,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hearth-export-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(json: string): ExportPayload | null {
  try {
    const data = JSON.parse(json) as Record<string, unknown>;
    if (data.version !== 1) return null;
    if (!Array.isArray(data.habits)) return null;
    if (typeof data.profile !== 'object' || !data.profile) return null;
    if (!Array.isArray(data.reflections)) return null;
    if (!Array.isArray(data.achievements)) return null;
    return data as unknown as ExportPayload;
  } catch {
    return null;
  }
}
