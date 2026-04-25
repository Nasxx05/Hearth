import HabitIcon from './HabitIcon';
import Sparkline from './Sparkline';
import type { Habit } from '../types/habit';
import { GLYPH_COLORS } from '../types/habit';
import { useHabits } from '../context/HabitContext';
import { getLast14Days, todayISO } from '../utils/dateHelpers';

interface Props {
  habit: Habit;
  selectedDate?: string;
  onPress?: () => void;
}

export default function HabitCard({ habit, selectedDate, onPress }: Props) {
  const { toggleHabit, navigate, profile } = useHabits();
  const displayDate = selectedDate ?? todayISO();
  const isCompleted = habit.completionDates.includes(displayDate);

  const last14 = getLast14Days();
  const sparkData = last14.map(d => habit.completionDates.includes(d) ? 1 : 0);
  const glyphColor = GLYPH_COLORS[habit.color];

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleHabit(habit.id, displayDate);
  };

  const handlePress = () => {
    if (onPress) onPress();
    else navigate('habit-detail', habit.id);
  };

  const hasQuantityTarget = habit.targetValue > 1;
  const quantityLabel = hasQuantityTarget
    ? `${habit.quantityToday}/${habit.targetValue} today`
    : null;

  const showFreezeBadge = profile.isPremium && habit.streakFreezes > 0;

  return (
    <div
      className="rounded-2xl p-4 cursor-pointer transition-opacity active:opacity-80 animate-slide-up"
      style={{ background: 'var(--color-card)' }}
      onClick={handlePress}
    >
      <div className="flex items-center gap-3">
        <HabitIcon icon={habit.icon} color={habit.color} size={28} filled={isCompleted} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm truncate" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink)' }}>
              {habit.name}
            </span>
            {habit.currentStreak > 0 && (
              <div className="flex items-center gap-0.5 shrink-0">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="5" r="4" fill="var(--color-terracotta)" />
                </svg>
                <span className="text-xs font-mono font-medium" style={{ color: 'var(--color-terracotta)' }}>
                  {habit.currentStreak}
                </span>
              </div>
            )}
            {showFreezeBadge && (
              <div className="flex items-center gap-0.5 shrink-0">
                <span className="text-xs" style={{ color: 'var(--color-sky, #6BA3C4)' }}>❄</span>
                <span className="text-xs font-mono font-medium" style={{ color: 'var(--color-sky, #6BA3C4)' }}>
                  {habit.streakFreezes}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
              {habit.targetValue} {habit.targetUnit}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-ink-faint)' }}>·</span>
            <span className="text-xs" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
              {habit.category}
            </span>
            {habit.reminderTime && (
              <>
                <span className="text-xs" style={{ color: 'var(--color-ink-faint)' }}>·</span>
                <span className="text-xs" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
                  {habit.reminderTime}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Complete button */}
        <button
          onClick={handleComplete}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0"
          style={{
            border: `2px solid ${isCompleted ? glyphColor : 'var(--color-bg-soft)'}`,
            background: isCompleted ? glyphColor : 'transparent',
          }}
          aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {isCompleted && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7l3.5 3.5 5.5-6" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {!isCompleted && hasQuantityTarget && (
            <span className="text-xs font-mono font-medium" style={{ color: 'var(--color-ink-faint)' }}>
              +1
            </span>
          )}
        </button>
      </div>

      {/* Trend bar */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-0.5">
          {sparkData.map((v, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: 6,
                height: 6,
                background: v ? glyphColor : 'var(--color-bg-soft)',
              }}
            />
          ))}
        </div>
        {quantityLabel ? (
          <span className="text-xs font-mono" style={{ color: 'var(--color-ink-muted)' }}>
            {quantityLabel}
          </span>
        ) : (
          <span className="text-[10px]" style={{ color: 'var(--color-ink-faint)', fontFamily: 'var(--font-sans)' }}>
            LAST 14D
          </span>
        )}
      </div>

      {/* Sparkline */}
      <div className="mt-1.5">
        <Sparkline data={sparkData} width={260} height={20} color={glyphColor} filled />
      </div>
    </div>
  );
}
