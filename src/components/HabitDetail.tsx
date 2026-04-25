import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import HabitIcon from './HabitIcon';
import Heatmap from './Heatmap';
import Sparkline from './Sparkline';
import EditHabitModal from './EditHabitModal';
import { GLYPH_COLORS } from '../types/habit';
import { get17WeekGrid, toISO, addDays, todayISO } from '../utils/dateHelpers';

export default function HabitDetail() {
  const { selectedHabitId, getHabit, navigate, reflections, addReflection, updateHabit } = useHabits();
  const [showEdit, setShowEdit] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [showReflectionInput, setShowReflectionInput] = useState(false);
  const [pauseStart, setPauseStart] = useState('');
  const [pauseEnd, setPauseEnd] = useState('');

  const habit = selectedHabitId ? getHabit(selectedHabitId) : undefined;
  if (!habit) {
    return (
      <div className="max-w-lg lg:max-w-2xl mx-auto px-4 pt-12">
        <button onClick={() => navigate('home')} className="mb-4" style={{ color: 'var(--color-ink-muted)' }}>← Back</button>
        <p style={{ color: 'var(--color-ink-muted)' }}>Habit not found.</p>
      </div>
    );
  }

  const glyphColor = GLYPH_COLORS[habit.color];
  const completedSet = new Set(habit.completionDates);

  // Heatmap data: 17 weeks
  const grid = get17WeekGrid();
  const heatmapDays = grid.map(date => ({ date, value: completedSet.has(date) ? 1 : 0 }));
  const totalCompletions = habit.completionDates.length;
  const completionRate = grid.length > 0 ? Math.round((totalCompletions / grid.length) * 100) : 0;

  // 8-week sparkline
  const eightWeeks = Array.from({ length: 8 }, (_, wi) => {
    const weekDays = Array.from({ length: 7 }, (_, di) => {
      const d = addDays(new Date(), -(7 * (7 - wi) + (6 - di)));
      return toISO(d);
    });
    return weekDays.filter(d => completedSet.has(d)).length;
  });

  const avgPerWeek = (eightWeeks.reduce((a, b) => a + b, 0) / 8).toFixed(1);
  const improving = eightWeeks[7] >= eightWeeks[0];

  // Reflections for this habit
  const habitReflections = reflections.filter(r => r.habitId === habit.id).slice(-3).reverse();

  const handleAddReflection = () => {
    if (!reflectionText.trim()) return;
    addReflection({ habitId: habit.id, date: new Date().toISOString().split('T')[0], text: reflectionText.trim() });
    setReflectionText('');
    setShowReflectionInput(false);
  };

  return (
    <div className="max-w-lg lg:max-w-2xl mx-auto px-4 pt-10 pb-6 animate-fade-in">
      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('home')}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--color-card)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-ink)' }} />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-card)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="var(--color-ink-muted)" strokeWidth={1.5} strokeLinecap="round" />
            </svg>
          </button>
          <button
            onClick={() => setShowEdit(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--color-card)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="4" cy="8" r="1.2" fill="var(--color-ink-muted)" />
              <circle cx="8" cy="8" r="1.2" fill="var(--color-ink-muted)" />
              <circle cx="12" cy="8" r="1.2" fill="var(--color-ink-muted)" />
            </svg>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <HabitIcon icon={habit.icon} color={habit.color} size={36} />
        <div>
          <div className="text-xs font-medium tracking-widest mb-0.5" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
            {habit.category.toUpperCase()} · {habit.targetValue} {habit.targetUnit.toUpperCase()}
          </div>
          <h1 className="font-display text-3xl font-medium" style={{ color: 'var(--color-ink)' }}>
            {habit.name}
          </h1>
        </div>
      </div>

      {/* Stat trio */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'CURRENT', value: habit.currentStreak, sub: 'days', accent: true },
          { label: 'LONGEST', value: habit.longestStreak, sub: 'days', accent: false },
          { label: 'TOTAL', value: totalCompletions, sub: 'done', accent: false },
        ].map(stat => (
          <div key={stat.label} className="p-4 rounded-2xl" style={{ background: 'var(--color-card)' }}>
            <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
              {stat.label}
            </div>
            <div
              className="font-mono font-medium text-3xl leading-none"
              style={{ color: stat.accent ? 'var(--color-terracotta)' : 'var(--color-ink)' }}
            >
              {stat.value}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* 17-week heatmap */}
      <div className="p-4 rounded-2xl mb-4" style={{ background: 'var(--color-card)' }}>
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-xs font-semibold tracking-widest" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
            LAST 17 WEEKS
          </div>
        </div>
        <div className="font-display text-lg font-medium mb-3" style={{ color: 'var(--color-ink)' }}>
          {totalCompletions} completions · {completionRate}% rate
        </div>
        <Heatmap days={heatmapDays} color={habit.color} weeks={17} />
      </div>

      {/* 8-week sparkline */}
      <div className="p-4 rounded-2xl mb-4" style={{ background: 'var(--color-card)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold tracking-widest" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
            8-WEEK TREND
          </div>
          <div
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: improving ? 'var(--color-moss)' : 'var(--color-clay)', fontFamily: 'var(--font-sans)' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d={improving ? 'M1 9l3-3 3 2 4-5' : 'M1 3l3 3 3-2 4 5'} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {improving ? 'Improving' : 'Needs focus'}
          </div>
        </div>
        <div className="font-display text-xl font-medium mb-3" style={{ color: 'var(--color-ink)' }}>
          Avg {avgPerWeek} days/week
        </div>
        <Sparkline data={eightWeeks} width="100%" height={64} color={glyphColor} filled />
      </div>

      {/* Reflection */}
      <div className="rounded-2xl overflow-hidden mb-4">
        <div className="p-4" style={{ background: 'var(--color-forest)' }}>
          <div className="text-xs font-semibold tracking-widest mb-1" style={{ color: 'oklch(0.88 0.09 92)', fontFamily: 'var(--font-sans)' }}>
            REFLECTION
          </div>
          {habitReflections.length > 0 ? (
            <p className="font-display text-lg leading-snug" style={{ color: 'white' }}>
              "{habitReflections[0].text}"
            </p>
          ) : (
            <p className="font-display text-lg leading-snug italic" style={{ color: 'white', opacity: 0.6 }}>
              No reflections yet. Add one below.
            </p>
          )}
          {habitReflections.length > 0 && (
            <p className="text-xs mt-2" style={{ color: 'oklch(0.88 0.09 92)', opacity: 0.7, fontFamily: 'var(--font-sans)' }}>
              {habitReflections[0].date}
            </p>
          )}
        </div>

        {!showReflectionInput ? (
          <button
            onClick={() => setShowReflectionInput(true)}
            className="w-full p-3 text-sm font-medium text-left transition-colors"
            style={{ background: 'var(--color-card)', color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}
          >
            + Add a reflection
          </button>
        ) : (
          <div className="p-4" style={{ background: 'var(--color-card)' }}>
            <textarea
              autoFocus
              value={reflectionText}
              onChange={e => setReflectionText(e.target.value)}
              placeholder="How is this habit going?"
              rows={3}
              className="w-full bg-transparent outline-none text-sm resize-none"
              style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}
            />
            <div className="flex gap-2 mt-2">
              <button onClick={() => setShowReflectionInput(false)} className="flex-1 py-2 rounded-xl text-sm" style={{ background: 'var(--color-bg-soft)', color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>Cancel</button>
              <button onClick={handleAddReflection} className="flex-1 py-2 rounded-xl text-sm font-semibold" style={{ background: 'var(--color-forest)', color: 'white', fontFamily: 'var(--font-sans)' }}>Save</button>
            </div>
          </div>
        )}
      </div>

      {/* Pause ranges */}
      <div className="rounded-2xl overflow-hidden mb-4" style={{ background: 'var(--color-card)' }}>
        <div className="px-4 py-4">
          <div className="text-xs font-semibold tracking-widest mb-1" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
            PAUSE HABIT
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
            Set a date range to pause — won't break your streak.
          </p>
          {habit.pauseRanges.length > 0 && (
            <div className="mb-3 space-y-1">
              {habit.pauseRanges.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
                  <span>{r.start} → {r.end}</span>
                  <button
                    onClick={() => updateHabit(habit.id, { pauseRanges: habit.pauseRanges.filter((_, j) => j !== i) })}
                    className="text-xs"
                    style={{ color: 'var(--color-terracotta)' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          {(() => {
            const today = todayISO();
            const isPaused = habit.pauseRanges.some(r => today >= r.start && today <= r.end);
            if (isPaused) {
              return (
                <div className="flex items-center gap-2 text-xs py-1" style={{ color: 'var(--color-sky)', fontFamily: 'var(--font-sans)' }}>
                  <span>⏸ Habit is currently paused</span>
                </div>
              );
            }
            return null;
          })()}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="date"
              value={pauseStart}
              onChange={e => setPauseStart(e.target.value)}
              className="flex-1 px-2 py-1.5 rounded-xl text-xs outline-none"
              style={{ background: 'var(--color-bg-soft)', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}
            />
            <span className="text-xs" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>to</span>
            <input
              type="date"
              value={pauseEnd}
              onChange={e => setPauseEnd(e.target.value)}
              className="flex-1 px-2 py-1.5 rounded-xl text-xs outline-none"
              style={{ background: 'var(--color-bg-soft)', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}
            />
            <button
              onClick={() => {
                if (!pauseStart || !pauseEnd) return;
                updateHabit(habit.id, { pauseRanges: [...habit.pauseRanges, { start: pauseStart, end: pauseEnd }] });
                setPauseStart(''); setPauseEnd('');
              }}
              disabled={!pauseStart || !pauseEnd}
              className="px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-40"
              style={{ background: 'var(--color-forest)', color: 'white', fontFamily: 'var(--font-sans)' }}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {showEdit && <EditHabitModal habit={habit} onClose={() => setShowEdit(false)} />}
    </div>
  );
}
