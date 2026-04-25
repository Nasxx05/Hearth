import { useEffect, useState, useCallback } from 'react';
import { useHabits } from '../context/HabitContext';

const STEPS = [
  { target: 'habit-card', title: 'Tap to see details', body: 'Open a habit to view history, edit settings, or pause it.' },
  { target: 'week-strip', title: 'Log past days', body: 'Tap any day in the strip to log habits retroactively.' },
  { target: 'stats-tab', title: 'Track your progress', body: 'View streaks, heatmaps, and weekly reviews in the Stats tab.' },
];

const STORAGE_KEY = 'hearth_tutorial_seen';

interface TooltipPos {
  top: number;
  left: number;
  arrowTop: boolean;
}

function getPos(el: Element): TooltipPos {
  const rect = el.getBoundingClientRect();
  const tooltipH = 120;
  const tooltipW = 260;
  const below = rect.bottom + 16;
  const above = rect.top - tooltipH - 16;
  const top = below + tooltipH < window.innerHeight ? below : above;
  const left = Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipW / 2, window.innerWidth - tooltipW - 16));
  return { top, left, arrowTop: top === below };
}

export default function TutorialOverlay() {
  const { habits } = useHabits();
  const [step, setStep] = useState(0);
  const [pos, setPos] = useState<TooltipPos | null>(null);
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }, []);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (habits.length > 0) setVisible(true);
  }, [habits.length]);

  useEffect(() => {
    if (!visible) return;
    const target = STEPS[step]?.target;
    if (!target) return;
    const el = document.querySelector(`[data-tutorial="${target}"]`);
    if (el) {
      setPos(getPos(el));
    } else {
      setPos(null);
    }
  }, [visible, step]);

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <>
      {/* Dim overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={dismiss}
      />

      {/* Tooltip */}
      {pos && (
        <div
          className="fixed z-50 rounded-2xl p-4 shadow-lg"
          style={{
            top: pos.top,
            left: pos.left,
            width: 260,
            background: 'var(--color-card)',
          }}
        >
          {pos.arrowTop && (
            <div
              className="absolute -top-2 left-6 w-0 h-0"
              style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '8px solid var(--color-card)' }}
            />
          )}
          {!pos.arrowTop && (
            <div
              className="absolute -bottom-2 left-6 w-0 h-0"
              style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid var(--color-card)' }}
            />
          )}
          <div className="font-semibold text-sm mb-1" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
            {current.title}
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
            {current.body}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all"
                  style={{
                    width: i === step ? 16 : 6,
                    height: 6,
                    background: i === step ? 'var(--color-forest)' : 'var(--color-bg-soft)',
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={dismiss}
                className="text-xs px-3 py-1.5 rounded-xl"
                style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}
              >
                Skip
              </button>
              <button
                onClick={() => isLast ? dismiss() : setStep(s => s + 1)}
                className="text-xs px-3 py-1.5 rounded-xl font-medium"
                style={{ background: 'var(--color-forest)', color: 'white', fontFamily: 'var(--font-sans)' }}
              >
                {isLast ? 'Done' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
