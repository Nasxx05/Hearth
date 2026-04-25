import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import HabitIcon from './HabitIcon';
import type { HabitColor } from '../types/habit';

interface Props {
  habitName: string;
  habitIcon: string;
  habitColor: HabitColor;
  streak: number;
  isPerfectDay: boolean;
  onDismiss: () => void;
}

export default function CelebrationToast({ habitName, habitIcon, habitColor, streak, isPerfectDay, onDismiss }: Props) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    if (isPerfectDay) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#24402E', '#4A7C59', '#B8963E', '#C47A8A', '#6BA3C4'],
      });
    } else {
      confetti({
        particleCount: 50,
        spread: 55,
        origin: { y: 0.75 },
        colors: ['#24402E', '#4A7C59', '#7EA58C'],
      });
    }

    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [isPerfectDay, onDismiss]);

  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-toast-in"
      style={{ width: 'calc(100% - 2rem)', maxWidth: 360 }}
      onClick={onDismiss}
    >
      <div
        className="rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg"
        style={{ background: 'var(--color-forest)' }}
      >
        <HabitIcon icon={habitIcon} color={habitColor} size={24} filled />
        <div className="flex-1 min-w-0">
          {isPerfectDay ? (
            <>
              <div className="font-display text-base font-medium" style={{ color: 'white' }}>
                Perfect day! 🎉
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'oklch(0.88 0.09 92)', fontFamily: 'var(--font-sans)' }}>
                All habits done today
              </div>
            </>
          ) : (
            <>
              <div className="font-display text-base font-medium" style={{ color: 'white' }}>
                Great work!
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'oklch(0.88 0.09 92)', fontFamily: 'var(--font-sans)' }}>
                {habitName}{streak > 0 ? ` · 🔥 ${streak} day streak` : ''}
              </div>
            </>
          )}
        </div>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <path d="M2 2l10 10M12 2L2 12" stroke="white" strokeWidth={1.75} strokeLinecap="round" strokeOpacity={0.6} />
        </svg>
      </div>
    </div>
  );
}
