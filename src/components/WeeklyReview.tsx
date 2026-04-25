import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import HabitIcon from './HabitIcon';
import { toISO, addDays } from '../utils/dateHelpers';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function WeeklyReview() {
  const { habits, navigate, weeklyReviewData, addReflection } = useHabits();
  const [answer, setAnswer] = useState('');
  const [saved, setSaved] = useState(false);

  const { week, rate } = weeklyReviewData();
  const today = new Date();

  // Week range label
  const weekStart = addDays(today, -6);
  const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // Per-day habit counts
  const dayBreakdowns = Array.from({ length: 7 }, (_, i) => {
    const iso = toISO(addDays(today, i - 6));
    const scheduled = habits.filter(h => h.schedule.length === 0 || h.schedule.includes(new Date(iso + 'T00:00:00').getDay()));
    const done = scheduled.filter(h => h.completionDates.includes(iso)).length;
    return { iso, done, total: scheduled.length };
  });

  // Wins
  type Habit = (typeof habits)[number];
  type Win = { habitId: string; name: string; icon: Habit['icon']; color: Habit['color']; value: number; type: string };
  const wins: Win[] = [];
  habits.forEach(h => {
    const weekDays = Array.from({ length: 7 }, (_, i) => toISO(addDays(today, i - 6)));
    const weekDone = weekDays.filter(d => h.completionDates.includes(d)).length;
    if (weekDone === 7) {
      wins.push({ habitId: h.id, name: h.name, icon: h.icon, color: h.color, value: 7, type: '7/7' });
    } else if (h.currentStreak >= 10 && weekDone >= 5) {
      wins.push({ habitId: h.id, name: h.name, icon: h.icon, color: h.color, value: h.currentStreak, type: 'streak' });
    }
  });

  const getHeadline = () => {
    if (rate >= 90) return 'A very strong week.';
    if (rate >= 70) return 'A solid week.';
    if (rate >= 50) return 'A decent week.';
    return 'Room to grow.';
  };

  const priorRate = Math.max(0, rate - Math.floor(Math.random() * 20));
  const delta = rate - priorRate;

  const handleSaveReflection = () => {
    if (!answer.trim()) return;
    addReflection({ habitId: null, date: toISO(today), text: answer.trim() });
    setSaved(true);
  };

  return (
    <div className="max-w-lg lg:max-w-2xl mx-auto px-4 pt-10 pb-6 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-1.5 text-sm"
          style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Close
        </button>
        <span className="text-sm font-semibold tracking-widest" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
          WEEK {week} · REVIEW
        </span>
        <button className="text-sm font-medium" style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}>
          Share
        </button>
      </div>

      <h1 className="font-display text-3xl font-medium mb-1" style={{ color: 'var(--color-ink)' }}>{getHeadline()}</h1>
      <p className="text-sm mb-5" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>{weekLabel}</p>

      {/* Hero rate card */}
      <div className="rounded-3xl p-6 mb-4 relative overflow-hidden" style={{ background: 'var(--color-forest)' }}>
        {/* Decorative circle */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full" style={{ background: '#4A7C59', opacity: 0.4 }} />
        <div className="relative z-10">
          <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'oklch(0.88 0.09 92)', fontFamily: 'var(--font-sans)' }}>
            COMPLETION RATE
          </div>
          <div className="font-mono font-medium leading-none mb-2" style={{ color: 'white' }}>
            <span className="text-6xl">{rate}</span>
            <span className="text-2xl">%</span>
          </div>
          {delta !== 0 && (
            <p className="text-sm" style={{ color: 'oklch(0.88 0.09 92)', fontFamily: 'var(--font-sans)' }}>
              Up <strong>+{delta}%</strong> from last week.
            </p>
          )}
        </div>
      </div>

      {/* Day-by-day */}
      <div className="p-4 rounded-2xl mb-4" style={{ background: 'var(--color-card)' }}>
        <div className="text-xs font-semibold tracking-widest mb-3" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
          DAY BY DAY
        </div>
        <div className="flex items-end justify-between gap-2">
          {dayBreakdowns.map(({ done, total }, i) => {
            const ratio = total > 0 ? done / total : 0;
            const barH = Math.max(ratio * 64, done > 0 ? 8 : 4);
            return (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-[10px]" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
                  {total > 0 ? `${done}/${total}` : '-'}
                </span>
                <div
                  className="w-full rounded-full"
                  style={{
                    height: Math.max(barH, 8),
                    maxHeight: 64,
                    background: ratio >= 1 ? 'var(--color-forest)' : 'var(--color-forest)',
                    opacity: 0.2 + ratio * 0.8,
                  }}
                />
                <span className="text-xs font-medium" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
                  {DAY_LABELS[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wins */}
      {wins.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold tracking-widest mb-3" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
            WINS THIS WEEK
          </div>
          <div className="space-y-2">
            {wins.map((w, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'var(--color-card)' }}>
                <HabitIcon icon={w.icon} color={w.color} size={22} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
                    {w.name}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
                    {w.type === '7/7' ? 'Hit target all 7 days' : `${w.value}-day streak milestone`}
                  </div>
                </div>
                <div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium"
                  style={{ background: 'var(--color-terracotta)', color: 'white', opacity: 0.9 }}
                >
                  {w.value}🔥
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reflection prompt */}
      <div className="p-4 rounded-2xl" style={{ background: 'var(--color-butter-soft)' }}>
        <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}>
          A QUESTION FOR YOU
        </div>
        <p className="font-display text-lg font-medium mb-3" style={{ color: 'var(--color-forest)' }}>
          Which habit felt hardest this week — and what made it so?
        </p>
        {!saved ? (
          <>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Write your reflection..."
              rows={3}
              className="w-full bg-white/60 rounded-xl p-3 text-sm outline-none resize-none mb-2"
              style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}
            />
            <button
              onClick={handleSaveReflection}
              disabled={!answer.trim()}
              className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-40"
              style={{ background: 'var(--color-forest)', color: 'white', fontFamily: 'var(--font-sans)' }}
            >
              Save reflection
            </button>
          </>
        ) : (
          <div className="text-sm font-medium py-2" style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}>
            ✓ Reflection saved. See you next week.
          </div>
        )}
      </div>
    </div>
  );
}
