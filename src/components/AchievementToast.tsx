import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { Achievement } from '../types/habit';
import type { HabitColor } from '../types/habit';
import { GLYPH_COLORS } from '../types/habit';

interface StreakMilestoneInfo {
  habitName: string;
  streak: number;
  habitColor: HabitColor;
}

interface Props {
  achievement?: Achievement;
  streakMilestone?: StreakMilestoneInfo;
  onDismiss: () => void;
}

export default function AchievementToast({ achievement, streakMilestone, onDismiss }: Props) {
  useEffect(() => {
    const shouldConfetti = achievement != null || (streakMilestone != null && streakMilestone.streak >= 30);
    if (shouldConfetti) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#4A7C59', '#F5C842', '#C47A8A', '#7B5C8C'],
      });
    }
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [achievement, streakMilestone, onDismiss]);

  const title = achievement
    ? `🏆 ${achievement.name}`
    : streakMilestone
      ? `🔥 ${streakMilestone.streak}-day streak!`
      : '';

  const subtitle = achievement
    ? achievement.description
    : streakMilestone
      ? `${streakMilestone.streak} days on "${streakMilestone.habitName}"`
      : '';

  const accentColor = streakMilestone
    ? GLYPH_COLORS[streakMilestone.habitColor]
    : 'var(--color-forest)';

  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-4 rounded-2xl shadow-lg animate-slide-up max-w-xs w-full"
      style={{ background: accentColor, color: 'white' }}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl shrink-0">
          {achievement ? achievement.icon : '🔥'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm" style={{ fontFamily: 'var(--font-sans)' }}>
            {title}
          </div>
          <div className="text-xs mt-0.5 opacity-80" style={{ fontFamily: 'var(--font-sans)' }}>
            {subtitle}
          </div>
        </div>
        <button onClick={onDismiss} className="shrink-0 opacity-70 hover:opacity-100">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="white" strokeWidth={1.75} strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
