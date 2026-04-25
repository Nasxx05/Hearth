import { Component, type ErrorInfo, type ReactNode, lazy, Suspense, useState } from 'react';
import { HabitProvider, useHabits } from './context/HabitContext';
import BottomNav from './components/BottomNav';
import SidebarNav from './components/SidebarNav';
import UndoToast from './components/UndoToast';
import CelebrationToast from './components/CelebrationToast';

const Dashboard = lazy(() => import('./components/Dashboard'));
const Calendar = lazy(() => import('./components/Calendar'));
const HabitDetail = lazy(() => import('./components/HabitDetail'));
const Stats = lazy(() => import('./components/Stats'));
const WeeklyReview = lazy(() => import('./components/WeeklyReview'));
const Profile = lazy(() => import('./components/Profile'));
const Onboarding = lazy(() => import('./components/Onboarding'));
const AchievementToast = lazy(() => import('./components/AchievementToast'));
const PremiumGate = lazy(() => import('./components/PremiumGate'));
const TutorialOverlay = lazy(() => import('./components/TutorialOverlay'));

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error(error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center" style={{ background: 'var(--color-bg)' }}>
          <p className="font-display text-2xl mb-2" style={{ color: 'var(--color-forest)' }}>Something went wrong.</p>
          <p className="text-sm mb-6" style={{ color: 'var(--color-ink-muted)' }}>{(this.state.error as Error).message}</p>
          <button
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ background: 'var(--color-forest)' }}
            onClick={() => { localStorage.clear(); window.location.reload(); }}
          >
            Reset app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-forest)', borderTopColor: 'transparent' }} />
    </div>
  );
}

function DesktopBanner() {
  const [dismissed, setDismissed] = useState(
    () => !!localStorage.getItem('hearth_desktop_dismissed')
  );
  if (dismissed || window.innerWidth < 1024) return null;
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 text-sm"
      style={{ background: 'var(--color-forest)', color: 'white', fontFamily: 'var(--font-sans)' }}
    >
      <span>Hearth is optimised for mobile — best experienced on your phone.</span>
      <button
        onClick={() => { localStorage.setItem('hearth_desktop_dismissed', '1'); setDismissed(true); }}
        className="ml-4 opacity-80 hover:opacity-100"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

function AppContent() {
  const {
    currentView,
    celebration, dismissCelebration,
    showPremiumGate, setShowPremiumGate,
    newlyUnlockedAchievement, dismissAchievementToast,
    streakMilestone, dismissStreakMilestone,
  } = useHabits();

  const screen = (
    <Suspense fallback={<LoadingScreen />}>
      {currentView === 'onboarding' && <Onboarding />}
      {currentView === 'home' && <Dashboard />}
      {currentView === 'calendar' && <Calendar />}
      {currentView === 'habit-detail' && <HabitDetail />}
      {currentView === 'stats' && <Stats />}
      {currentView === 'weekly-review' && <WeeklyReview />}
      {currentView === 'profile' && <Profile />}
    </Suspense>
  );

  if (currentView === 'onboarding') return screen;

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <SidebarNav />
      <main className="flex-1 min-w-0 pb-20 lg:pb-0">
        {screen}
      </main>
      <BottomNav />
      <UndoToast />
      {celebration && (
        <CelebrationToast
          habitName={celebration.habitName}
          habitIcon={celebration.habitIcon}
          habitColor={celebration.habitColor}
          streak={celebration.streak}
          isPerfectDay={celebration.isPerfectDay}
          onDismiss={dismissCelebration}
        />
      )}
      <Suspense>
        {(newlyUnlockedAchievement || streakMilestone) && (
          <AchievementToast
            achievement={newlyUnlockedAchievement ?? undefined}
            streakMilestone={streakMilestone ?? undefined}
            onDismiss={() => { dismissAchievementToast(); dismissStreakMilestone(); }}
          />
        )}
        {showPremiumGate && <PremiumGate onClose={() => setShowPremiumGate(false)} />}
        <TutorialOverlay />
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <HabitProvider>
        <DesktopBanner />
        <AppContent />
      </HabitProvider>
    </ErrorBoundary>
  );
}
