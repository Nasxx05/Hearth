import { useState } from 'react';

interface Props {
  onClose: () => void;
}

const features = [
  { label: 'Habits', free: '3 max', premium: 'Unlimited' },
  { label: 'Streak freezes', free: '—', premium: '2 / week' },
  { label: 'Auto-sync', free: '—', premium: '✓' },
  { label: 'Export data', free: '—', premium: '✓' },
];

export default function PremiumGate({ onClose }: Props) {
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleUpgrade = () => {
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm rounded-3xl p-6 animate-scale-in"
        style={{ background: 'var(--color-card)' }}
      >
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">✦</div>
          <div className="font-display text-2xl font-medium mb-1" style={{ color: 'var(--color-ink)' }}>
            Free plan limit reached
          </div>
          <p className="text-sm" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
            You've used all 3 habits on the free plan. Upgrade to track more.
          </p>
        </div>

        {/* Feature comparison table */}
        <div className="rounded-2xl overflow-hidden mb-5" style={{ border: '1px solid var(--color-bg-soft)' }}>
          <div className="grid grid-cols-3 text-xs font-medium px-4 py-2.5" style={{ background: 'var(--color-bg-soft)', color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
            <span>Feature</span>
            <span className="text-center">Free</span>
            <span className="text-center" style={{ color: 'var(--color-forest)' }}>Premium</span>
          </div>
          {features.map((f, i) => (
            <div
              key={f.label}
              className="grid grid-cols-3 px-4 py-3 text-sm"
              style={{
                borderTop: i > 0 ? '1px solid var(--color-bg-soft)' : undefined,
                fontFamily: 'var(--font-sans)',
              }}
            >
              <span style={{ color: 'var(--color-ink)' }}>{f.label}</span>
              <span className="text-center" style={{ color: 'var(--color-ink-muted)' }}>{f.free}</span>
              <span className="text-center font-medium" style={{ color: 'var(--color-forest)' }}>{f.premium}</span>
            </div>
          ))}
        </div>

        {showComingSoon ? (
          <div className="w-full py-3 rounded-2xl text-sm font-semibold text-center mb-2" style={{ background: 'var(--color-bg-soft)', color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
            Coming soon!
          </div>
        ) : (
          <button
            onClick={handleUpgrade}
            className="w-full py-3 rounded-2xl text-sm font-semibold mb-2"
            style={{ background: 'var(--color-forest)', color: 'white', fontFamily: 'var(--font-sans)' }}
          >
            Upgrade to Premium
          </button>
        )}
        <button
          onClick={onClose}
          className="w-full py-2 rounded-2xl text-sm"
          style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
