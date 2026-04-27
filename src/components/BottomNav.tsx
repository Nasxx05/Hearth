import { useHabits } from '../context/HabitContext';
import type { View } from '../types/habit';

const TABS: { view: View; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  {
    view: 'home',
    label: 'Today',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
        <path d="M3 9.5L11 3l8 6.5V19a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
          stroke="currentColor" strokeWidth={active ? 2 : 1.5} fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0} />
      </svg>
    ),
  },
  {
    view: 'calendar',
    label: 'Calendar',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth={active ? 2 : 1.5} fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0} />
        <path d="M3 9h16M8 3v4M14 3v4" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    view: 'stats',
    label: 'Stats',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
        <path d="M4 16l4-5 4 3 4-7 3 3" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    view: 'profile',
    label: 'Profile',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth={active ? 2 : 1.5} fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0} />
        <path d="M4 19c0-3.866 3.134-7 7-7h2c3.866 0 7 3.134 7 7" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const { currentView, navigate } = useHabits();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div
        className="flex items-center justify-around px-2"
        style={{
          background: 'var(--color-card)',
          borderTop: '1px solid var(--color-bg-soft)',
          paddingTop: '12px',
          paddingBottom: 'max(env(safe-area-inset-bottom), 16px)',
        }}
      >
        {TABS.map(tab => {
          const active = currentView === tab.view;
          return (
            <button
              key={tab.view}
              onClick={() => navigate(tab.view)}
              className="flex flex-col items-center gap-1 px-5 py-1.5 rounded-xl transition-colors"
              style={{ color: active ? 'var(--color-forest)' : 'var(--color-ink-faint)' }}
            >
              {tab.icon(active)}
              <span
                className="text-[10px] font-medium leading-none"
                style={{ fontFamily: 'var(--font-sans)', fontWeight: active ? 600 : 400 }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
