import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import HabitIcon from './HabitIcon';
import CompletionRing from './CompletionRing';
import { getMonthDays, todayISO, formatMonthYear } from '../utils/dateHelpers';

const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function Calendar() {
  const { habits, toggleHabit } = useHabits();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  const today = todayISO();
  const monthDays = getMonthDays(year, month);
  const firstDayOfWeek = monthDays[0].date.getDay();

  // Stats for this month
  const daysSoFar = monthDays.filter(d => d.iso <= today).length;

  const perfectDays = monthDays.filter(d => {
    if (d.iso > today) return false;
    return habits.length > 0 && habits.every(h => h.completionDates.includes(d.iso));
  }).length;

  const missedDays = monthDays.filter(d => {
    if (d.iso >= today) return false;
    return habits.length > 0 && habits.every(h => !h.completionDates.includes(d.iso));
  }).length;

  const monthRate = daysSoFar > 0 ? Math.round((perfectDays / daysSoFar) * 100) : 0;

  const getCellStyle = (iso: string) => {
    if (iso > today) return { bg: 'transparent', textColor: 'var(--color-ink-faint)', opacity: 1 };
    const completed = habits.filter(h => h.completionDates.includes(iso)).length;
    const rate = habits.length > 0 ? completed / habits.length : 0;
    const isPerfect = rate === 1 && habits.length > 0;
    const isMissed = rate === 0 && habits.length > 0;
    const isToday = iso === today;

    if (isToday) return { bg: 'var(--color-forest)', textColor: 'white', opacity: 1 };
    if (isPerfect) return { bg: 'var(--color-forest)', textColor: 'white', opacity: 0.85 };
    if (isMissed) return { bg: 'var(--color-bg-soft)', textColor: 'var(--color-ink-faint)', opacity: 1 };
    return { bg: 'var(--color-forest)', textColor: 'white', opacity: 0.2 + rate * 0.6 };
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const selectedHabits = habits.filter(h => {
    const iso = selectedDate;
    return h.schedule.length === 0 || h.schedule.includes(new Date(iso + 'T00:00:00').getDay());
  });

  return (
    <div className="max-w-lg lg:max-w-2xl mx-auto px-4 pt-10 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-medium tracking-widest" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>CALENDAR</div>
          <h1 className="font-display text-3xl font-medium" style={{ color: 'var(--color-ink)' }}>
            {formatMonthYear(new Date(year, month))}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-card)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="var(--color-ink-muted)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button onClick={nextMonth} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-card)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2l5 5-5 5" stroke="var(--color-ink-muted)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Month summary card */}
      <div className="p-4 rounded-2xl mb-4 flex items-center gap-4" style={{ background: 'var(--color-card)' }}>
        <CompletionRing percent={monthRate} size={72} strokeWidth={6} fillColor="var(--color-forest)" trackColor="var(--color-forest)">
          <span className="font-mono text-sm font-medium" style={{ color: 'var(--color-forest)' }}>{monthRate}%</span>
        </CompletionRing>
        <div>
          <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>THIS MONTH</div>
          <div className="font-display text-2xl font-medium" style={{ color: 'var(--color-ink)' }}>
            {perfectDays} perfect days
          </div>
          <div className="text-sm" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
            out of {daysSoFar} so far · {missedDays} missed
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="p-4 rounded-2xl mb-4" style={{ background: 'var(--color-card)' }}>
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_HEADERS.map((d, i) => (
            <div key={i} className="flex items-center justify-center">
              <span className="text-xs font-medium" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>{d}</span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Padding cells */}
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {monthDays.map(({ date, iso }) => {
            const style = getCellStyle(iso);
            const isSelected = iso === selectedDate;
            return (
              <button
                key={iso}
                onClick={() => setSelectedDate(iso)}
                className="aspect-square rounded-xl flex items-center justify-center relative transition-transform active:scale-95"
                style={{
                  background: style.bg,
                  opacity: style.opacity,
                  outline: isSelected && iso !== today ? `2px solid var(--color-forest)` : 'none',
                  outlineOffset: 1,
                }}
              >
                <span className="text-sm font-medium" style={{ color: style.textColor, fontFamily: 'var(--font-sans)' }}>
                  {date.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid var(--color-bg-soft)' }}>
          {[
            { label: 'Perfect day', color: 'var(--color-forest)', opacity: 0.85 },
            { label: 'Most done', color: 'var(--color-forest)', opacity: 0.6 },
            { label: 'Partial', color: 'var(--color-forest)', opacity: 0.3 },
            { label: 'Missed', color: 'var(--color-bg-soft)', opacity: 1 },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ background: l.color, opacity: l.opacity }} />
              <span className="text-[10px]" style={{ color: 'var(--color-ink-faint)', fontFamily: 'var(--font-sans)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day detail */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-medium" style={{ color: 'var(--color-ink)' }}>
            {selectedDate === today ? 'Today' : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            <span className="text-base ml-2" style={{ color: 'var(--color-ink-muted)' }}>
              {habits.filter(h => h.completionDates.includes(selectedDate)).length}/{selectedHabits.length} done
            </span>
          </h2>
        </div>

        <div className="space-y-2">
          {selectedHabits.map(habit => {
            const done = habit.completionDates.includes(selectedDate);
            const isEditable = selectedDate <= today;
            return (
              <div
                key={habit.id}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'var(--color-card)' }}
              >
                <HabitIcon icon={habit.icon} color={habit.color} size={22} filled={done} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
                    {habit.name}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
                    {habit.targetValue} {habit.targetUnit}
                  </div>
                </div>
                {isEditable && (
                  <button
                    onClick={() => {
                      if (selectedDate === today) toggleHabit(habit.id);
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      border: `2px solid ${done ? 'var(--color-forest)' : 'var(--color-bg-soft)'}`,
                      background: done ? 'var(--color-forest)' : 'transparent',
                    }}
                  >
                    {done && (
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M1.5 5.5l3 3 5-5" stroke="white" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            );
          })}
          {selectedHabits.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm" style={{ color: 'var(--color-ink-faint)', fontFamily: 'var(--font-sans)' }}>No habits scheduled for this day.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
