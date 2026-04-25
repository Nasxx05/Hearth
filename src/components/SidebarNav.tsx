import { useHabits } from '../context/HabitContext';
import type { View } from '../types/habit';

const NAV_ITEMS: { view: View; label: string; icon: React.ReactNode }[] = [
  {
    view: 'home',
    label: 'Today',
    icon: (
      <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
        <path d="M3 9.5L11 3l8 6.5V19a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth={1.75} fill="none" />
      </svg>
    ),
  },
  {
    view: 'calendar',
    label: 'Calendar',
    icon: (
      <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth={1.75} />
        <path d="M3 9h16M8 3v4M14 3v4" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    view: 'stats',
    label: 'Statistics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
        <path d="M4 16l4-5 4 3 4-7 3 3" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    view: 'profile',
    label: 'Profile',
    icon: (
      <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth={1.75} />
        <path d="M4 19c0-3.866 3.134-7 7-7h2c3.866 0 7 3.134 7 7" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function SidebarNav() {
  const { currentView, navigate, habits } = useHabits();

  const topStreak = habits.length > 0
    ? Math.max(...habits.map(h => h.currentStreak))
    : 0;

  return (
    <aside
      className="hidden lg:flex flex-col w-56 shrink-0 h-screen sticky top-0"
      style={{ background: 'var(--color-card)', borderRight: '1px solid var(--color-bg-soft)' }}
    >
      {/* Logo */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-forest)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5C7 1.5 2 5 2 8.5a5 5 0 0010 0C12 5 7 1.5 7 1.5z" fill="oklch(0.88 0.09 92)" />
            </svg>
          </div>
          <span className="font-display text-lg font-semibold" style={{ color: 'var(--color-forest)' }}>
            Hearth
          </span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const active = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => navigate(item.view)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
              style={{
                color: active ? 'var(--color-forest)' : 'var(--color-ink-muted)',
                background: active ? 'var(--color-bg-soft)' : 'transparent',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Streak widget */}
      {topStreak > 0 && (
        <div className="mx-3 mb-6 p-4 rounded-2xl" style={{ background: 'var(--color-bg-soft)' }}>
          <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
            STREAK
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-mono font-medium" style={{ color: 'var(--color-terracotta)' }}>
              {topStreak}
            </span>
            <span className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>days</span>
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--color-ink-faint)', fontFamily: 'var(--font-sans)' }}>
            Longest run
          </div>
        </div>
      )}
    </aside>
  );
}
