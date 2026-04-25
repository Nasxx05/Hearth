import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import BarChart from './BarChart';
import Sparkline from './Sparkline';
import HabitIcon from './HabitIcon';
import { GLYPH_COLORS } from '../types/habit';
import { getLast30Days, todayISO } from '../utils/dateHelpers';

type Range = 'week' | 'month' | 'year' | 'all';

export default function Stats() {
  const { habits } = useHabits();
  const [range, setRange] = useState<Range>('month');

  const today = todayISO();

  // KPIs
  const totalHabits = habits.length;
  const topStreak = totalHabits > 0 ? Math.max(...habits.map(h => h.currentStreak)) : 0;
  const totalDone = habits.reduce((s, h) => s + h.completionDates.length, 0);

  const last30 = getLast30Days();
  const completionPcts = last30.map(iso => {
    const done = habits.filter(h => h.completionDates.includes(iso)).length;
    return totalHabits > 0 ? done / totalHabits : 0;
  });
  const avg30 = completionPcts.length > 0
    ? Math.round(completionPcts.reduce((a, b) => a + b, 0) / completionPcts.length * 100)
    : 0;

  const perfectDays30 = last30.filter(iso => {
    if (iso > today) return false;
    return totalHabits > 0 && habits.every(h => h.completionDates.includes(iso));
  }).length;

  const prior30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - 30 - (29 - i));
    return d.toISOString().split('T')[0];
  });
  const priorAvg = prior30.length > 0
    ? Math.round(prior30.map(iso => {
      const done = habits.filter(h => h.completionDates.includes(iso)).length;
      return totalHabits > 0 ? done / totalHabits : 0;
    }).reduce((a, b) => a + b, 0) / prior30.length * 100)
    : 0;

  const completionDelta = avg30 - priorAvg;

  // Bar chart data
  const barData = last30.map(date => ({
    date,
    value: habits.filter(h => h.completionDates.includes(date)).length,
    max: totalHabits,
  }));

  // Habit leaderboard
  const leaderboard = [...habits]
    .map(h => {
      const rate = totalDone > 0
        ? Math.round((h.completionDates.filter(d => d >= last30[0]).length / 30) * 100)
        : 0;
      const spark = last30.map(d => h.completionDates.includes(d) ? 1 : 0);
      return { ...h, rate, spark };
    })
    .sort((a, b) => b.rate - a.rate);

  const RANGES: Range[] = ['week', 'month', 'year', 'all'];

  return (
    <div className="max-w-lg lg:max-w-2xl mx-auto px-4 pt-10 pb-6">
      <div className="mb-2">
        <div className="text-xs font-medium tracking-widest" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>STATS</div>
        <h1 className="font-display text-3xl font-medium" style={{ color: 'var(--color-ink)' }}>Your rhythm</h1>
      </div>

      {/* Range tabs */}
      <div className="flex gap-1.5 mb-6 p-1 rounded-2xl" style={{ background: 'var(--color-card)' }}>
        {RANGES.map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className="flex-1 py-1.5 rounded-xl text-sm font-medium capitalize transition-colors"
            style={{
              background: range === r ? 'var(--color-forest)' : 'transparent',
              color: range === r ? 'white' : 'var(--color-ink-muted)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-4 rounded-2xl" style={{ background: 'var(--color-card)' }}>
          <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>COMPLETION</div>
          <div className="font-mono font-medium text-3xl" style={{ color: 'var(--color-ink)' }}>{avg30}%</div>
          <div className="flex items-center gap-1 mt-1">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d={completionDelta >= 0 ? 'M1 7l2-3 2 2 3-4' : 'M1 3l2 3 2-2 3 4'} stroke={completionDelta >= 0 ? 'var(--color-moss)' : 'var(--color-clay)'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-medium" style={{ color: completionDelta >= 0 ? 'var(--color-moss)' : 'var(--color-clay)', fontFamily: 'var(--font-sans)' }}>
              {completionDelta >= 0 ? '+' : ''}{completionDelta}%
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl" style={{ background: 'var(--color-card)' }}>
          <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>PERFECT DAYS</div>
          <div className="font-mono font-medium text-3xl" style={{ color: 'var(--color-ink)' }}>{perfectDays30}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>last 30 days</div>
        </div>

        <div className="p-4 rounded-2xl" style={{ background: 'var(--color-card)' }}>
          <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>ACTIVE STREAK</div>
          <div className="font-mono font-medium text-3xl" style={{ color: 'var(--color-terracotta)' }}>{topStreak}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>days</div>
        </div>

        <div className="p-4 rounded-2xl" style={{ background: 'var(--color-card)' }}>
          <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>TOTAL DONE</div>
          <div className="font-mono font-medium text-3xl" style={{ color: 'var(--color-ink)' }}>{totalDone}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>all time</div>
        </div>
      </div>

      {/* 30-day bar chart */}
      <div className="p-4 rounded-2xl mb-4" style={{ background: 'var(--color-card)' }}>
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-semibold tracking-widest" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>DAILY COMPLETION</div>
          {completionDelta !== 0 && (
            <span className="text-xs font-medium" style={{ color: completionDelta >= 0 ? 'var(--color-moss)' : 'var(--color-clay)', fontFamily: 'var(--font-sans)' }}>
              {completionDelta >= 0 ? '↑' : '↓'} {Math.abs(completionDelta)}% vs prior
            </span>
          )}
        </div>
        <div className="font-display text-xl font-medium mb-3" style={{ color: 'var(--color-ink)' }}>30 days</div>
        <BarChart data={barData} color="var(--color-forest)" height={80} className="w-full" />
        <div className="flex justify-between mt-2">
          <span className="text-xs font-mono" style={{ color: 'var(--color-ink-faint)' }}>{last30[0]}</span>
          <span className="text-xs font-mono" style={{ color: 'var(--color-ink-faint)' }}>{last30[14]}</span>
          <span className="text-xs font-mono" style={{ color: 'var(--color-ink-faint)' }}>{last30[29]}</span>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="p-4 rounded-2xl" style={{ background: 'var(--color-card)' }}>
        <div className="text-xs font-semibold tracking-widest mb-3" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>RANKING</div>
        <h2 className="font-display text-xl font-medium mb-4" style={{ color: 'var(--color-ink)' }}>Strongest habits</h2>

        {leaderboard.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: 'var(--color-ink-faint)', fontFamily: 'var(--font-sans)' }}>No habits to rank yet.</p>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((h, i) => (
              <div key={h.id} className="flex items-center gap-3">
                <span className="text-sm font-mono w-4" style={{ color: 'var(--color-ink-faint)' }}>{i + 1}</span>
                <HabitIcon icon={h.icon} color={h.color} size={20} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
                    {h.name}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
                      {h.rate}%
                    </span>
                    {h.currentStreak > 0 && (
                      <>
                        <span className="text-xs" style={{ color: 'var(--color-ink-faint)' }}>·</span>
                        <span className="text-xs font-mono" style={{ color: 'var(--color-terracotta)' }}>🔥 {h.currentStreak}</span>
                      </>
                    )}
                  </div>
                </div>
                <Sparkline data={h.spark} width={64} height={24} color={GLYPH_COLORS[h.color]} filled />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
