import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import CompletionRing from './CompletionRing';
import HabitCard from './HabitCard';
import AddHabitModal from './AddHabitModal';
import ShareCard from './ShareCard';
import { addDays, toISO, getGreeting, todayISO } from '../utils/dateHelpers';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function isScheduledOn(schedule: number[], iso: string): boolean {
  const d = new Date(iso + 'T12:00:00');
  return schedule.includes(d.getDay());
}

function isInPauseRange(pauseRanges: { start: string; end: string }[], iso: string): boolean {
  return pauseRanges.some(r => iso >= r.start && iso <= r.end);
}

export default function Dashboard() {
  const { habits, profile, todayCompletionRate, todayCompleted, navigate } = useHabits();
  const [showAdd, setShowAdd] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [selectedCategory, setSelectedCategory] = useState('All');

  const today = todayISO();
  const rate = todayCompletionRate();
  const completed = todayCompleted();
  const total = habits.length;

  const days5 = Array.from({ length: 5 }, (_, i) => toISO(addDays(new Date(), i - 4)));

  const incompleteHabits = habits.filter(h => !h.completionDates.includes(today));
  const nudge = incompleteHabits.length > 0
    ? `${incompleteHabits.slice(0, 2).map(h => h.name).join(' · ')}${incompleteHabits.length > 2 ? ` · +${incompleteHabits.length - 2}` : ''}`
    : null;

  const topStreak = habits.length > 0 ? Math.max(...habits.map(h => h.currentStreak)) : 0;

  const habitsForDate = habits.filter(h =>
    isScheduledOn(h.schedule, selectedDate) &&
    !h.skipDates.includes(selectedDate) &&
    !isInPauseRange(h.pauseRanges, selectedDate)
  );

  const categories = ['All', ...Array.from(new Set(habits.map(h => h.category)))];

  const filteredHabits = habitsForDate.filter(h =>
    selectedCategory === 'All' || h.category === selectedCategory
  );

  return (
    <div className="max-w-lg lg:max-w-2xl mx-auto px-4 pt-12 pb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-medium tracking-widest mb-1" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}
          </p>
          <h1 className="font-display text-3xl font-medium leading-tight" style={{ color: 'var(--color-ink)' }}>
            {getGreeting()}, {profile.name}.
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShare(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-card)' }}
            aria-label="Share progress"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="12" cy="3" r="1.5" stroke="var(--color-ink-muted)" strokeWidth={1.4} />
              <circle cx="3" cy="7.5" r="1.5" stroke="var(--color-ink-muted)" strokeWidth={1.4} />
              <circle cx="12" cy="12" r="1.5" stroke="var(--color-ink-muted)" strokeWidth={1.4} />
              <path d="M4.5 8.3L10.5 11.2M10.5 3.8L4.5 6.7" stroke="var(--color-ink-muted)" strokeWidth={1.4} strokeLinecap="round" />
            </svg>
          </button>
          <button
            onClick={() => navigate('profile')}
            className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-sm font-semibold"
            style={profile.avatar ? {} : { background: 'var(--color-forest)', color: 'oklch(0.88 0.09 92)', fontFamily: 'var(--font-sans)' }}
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              profile.name.charAt(0).toUpperCase()
            )}
          </button>
        </div>
      </div>

      {/* Hero card */}
      <div className="rounded-3xl p-5 mb-4 animate-slide-up" style={{ background: 'var(--color-card)' }}>
        <div className="flex items-center gap-5">
          <CompletionRing
            percent={rate}
            size={100}
            strokeWidth={8}
            trackColor="var(--color-forest)"
            fillColor="var(--color-forest)"
          >
            <div className="text-center">
              <div className="font-mono font-medium text-lg leading-none" style={{ color: 'var(--color-forest)' }}>
                {rate}<span className="text-xs">%</span>
              </div>
              <div className="text-[9px] mt-0.5" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
                OF TODAY
              </div>
            </div>
          </CompletionRing>

          <div>
            <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
              TODAY
            </div>
            <div className="font-display text-4xl font-medium leading-none" style={{ color: 'var(--color-ink)' }}>
              {completed}<span className="text-xl text-opacity-50" style={{ color: 'var(--color-ink-muted)' }}>/{total}</span>
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
              habits complete
            </div>
            {topStreak > 0 && (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mt-2"
                style={{ background: 'var(--color-terracotta)', color: 'white' }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="5" r="4" fill="white" fillOpacity={0.4} />
                  <circle cx="5" cy="5" r="2" fill="white" />
                </svg>
                <span className="text-xs font-mono font-medium">{topStreak} day streak</span>
              </div>
            )}
          </div>
        </div>

        {/* 5-day selectable date strip */}
        <div
          data-tutorial="week-strip"
          className="flex items-center justify-between mt-5 pt-4"
          style={{ borderTop: '1px solid var(--color-bg-soft)' }}
        >
          {days5.map((iso) => {
            const d = new Date(iso + 'T00:00:00');
            const dayIdx = d.getDay();
            const isToday = iso === today;
            const isSelected = iso === selectedDate;
            const dayRate = habits.length > 0
              ? habits.filter(h => h.completionDates.includes(iso)).length / habits.length
              : 0;

            return (
              <button
                key={iso}
                onClick={() => setSelectedDate(iso)}
                className="flex flex-col items-center gap-1.5"
              >
                <span className="text-xs" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
                  {DAY_LABELS[dayIdx]}
                </span>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-all"
                  style={{
                    background: isToday ? 'var(--color-forest)' : dayRate > 0.5 ? 'var(--color-forest)' : 'var(--color-bg-soft)',
                    opacity: isToday ? 1 : dayRate > 0 ? 0.6 + dayRate * 0.4 : 0.4,
                    border: isSelected && !isToday ? '2px solid var(--color-forest)' : '2px solid transparent',
                  }}
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: (isToday || dayRate > 0.5) ? 'white' : 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}
                  >
                    {d.getDate()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Retroactive date banner */}
      {selectedDate !== today && (
        <button
          onClick={() => setSelectedDate(today)}
          className="w-full rounded-2xl px-4 py-3 mb-4 flex items-center justify-between animate-slide-down"
          style={{ background: 'var(--color-butter-soft)' }}
        >
          <span className="text-sm font-medium" style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}>
            Viewing {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} — tap to return
          </span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M12 7H2M6 3l-4 4 4 4" stroke="var(--color-forest)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Nudge banner (only on today) */}
      {selectedDate === today && nudge && (
        <div
          className="rounded-2xl p-4 mb-4 flex items-center gap-3 animate-slide-down"
          style={{ background: 'var(--color-butter-soft)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'oklch(0.88 0.09 92)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="var(--color-forest)" strokeWidth={1.5} />
              <path d="M7 4.5v3M7 9.5v.5" stroke="var(--color-forest)" strokeWidth={1.5} strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}>
              {incompleteHabits.length === 1 ? 'One habit left today' : `${incompleteHabits.length} habits to close the day`}
            </p>
            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-forest)', opacity: 0.7, fontFamily: 'var(--font-sans)' }}>
              {nudge}
            </p>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="var(--color-forest)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* Habit list header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-xl font-medium" style={{ color: 'var(--color-ink)' }}>Habits</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono" style={{ color: 'var(--color-ink-muted)' }}>{completed}/{total}</span>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl transition-colors"
            style={{ color: 'var(--color-forest)', background: 'var(--color-bg-soft)', fontFamily: 'var(--font-sans)' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
            </svg>
            New
          </button>
        </div>
      </div>

      {/* Category filter chips */}
      {categories.length > 2 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                background: selectedCategory === cat ? 'var(--color-forest)' : 'var(--color-bg-soft)',
                color: selectedCategory === cat ? 'white' : 'var(--color-ink-muted)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {filteredHabits.map((habit, idx) => (
          <div key={habit.id} data-tutorial={idx === 0 ? 'habit-card' : undefined}>
            <HabitCard habit={habit} selectedDate={selectedDate} />
          </div>
        ))}
        {habits.length === 0 && (
          <div className="text-center py-16">
            <p className="font-display text-xl mb-2" style={{ color: 'var(--color-ink-muted)' }}>No habits yet.</p>
            <p className="text-sm mb-6" style={{ color: 'var(--color-ink-faint)', fontFamily: 'var(--font-sans)' }}>
              Add your first habit to get started.
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="px-6 py-3 rounded-2xl text-sm font-medium text-white"
              style={{ background: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
            >
              Add habit
            </button>
          </div>
        )}
        {habits.length > 0 && filteredHabits.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
              No habits scheduled for this day.
            </p>
          </div>
        )}
      </div>

      {showAdd && <AddHabitModal onClose={() => setShowAdd(false)} />}
      {showShare && <ShareCard onClose={() => setShowShare(false)} />}
    </div>
  );
}
