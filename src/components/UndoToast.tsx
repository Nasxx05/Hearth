import { useHabits } from '../context/HabitContext';

export default function UndoToast() {
  const { undoAction, dismissUndo, executeUndo } = useHabits();

  if (!undoAction) return null;

  const label = undoAction.type === 'delete' ? 'Habit deleted' : 'Habit updated';

  return (
    <div className="fixed bottom-24 lg:bottom-6 left-1/2 z-50 -translate-x-1/2 animate-toast-in">
      <div
        className="flex items-center gap-4 px-5 py-3 rounded-2xl shadow-xl"
        style={{ background: 'var(--color-forest)', color: 'white', minWidth: 240 }}
      >
        <span className="text-sm flex-1" style={{ fontFamily: 'var(--font-sans)' }}>{label}</span>
        <button
          onClick={executeUndo}
          className="text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ color: 'oklch(0.88 0.09 92)', fontFamily: 'var(--font-sans)' }}
        >
          Undo
        </button>
        <button
          onClick={dismissUndo}
          className="opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
