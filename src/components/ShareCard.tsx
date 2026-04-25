import { useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { useHabits } from '../context/HabitContext';
import CompletionRing from './CompletionRing';
import HabitIcon from './HabitIcon';

interface Props {
  onClose: () => void;
}

export default function ShareCard({ onClose }: Props) {
  const { habits, profile, todayCompletionRate } = useHabits();
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const rate = todayCompletionRate();
  const topHabits = [...habits].sort((a, b) => b.currentStreak - a.currentStreak).slice(0, 3);
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, { pixelRatio: 2 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'hearth-progress.png';
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm animate-scale-in">
        {/* The card that gets exported */}
        <div
          ref={cardRef}
          style={{
            background: '#24402E',
            borderRadius: 24,
            padding: 28,
            fontFamily: "'Inter Tight', system-ui, sans-serif",
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.12em', color: 'oklch(0.88 0.09 92)', opacity: 0.7, fontWeight: 600 }}>
                HEARTH
              </div>
              <div style={{ fontSize: 16, color: 'white', fontWeight: 600, marginTop: 2 }}>
                {profile.name}'s progress
              </div>
            </div>
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#4A7C59', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'oklch(0.88 0.09 92)', fontSize: 16, fontWeight: 600 }}>
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Completion ring */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '16px', background: 'rgba(255,255,255,0.08)', borderRadius: 16 }}>
            <CompletionRing percent={rate} size={72} strokeWidth={6} fillColor="oklch(0.88 0.09 92)" trackColor="oklch(0.88 0.09 92)">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 600, color: 'oklch(0.88 0.09 92)' }}>{rate}%</div>
              </div>
            </CompletionRing>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.1em', color: 'oklch(0.88 0.09 92)', opacity: 0.7, fontWeight: 600 }}>TODAY</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: 'white', fontFamily: "'Fraunces', Georgia, serif" }}>
                {habits.filter(h => h.isCompletedToday).length}/{habits.length}
              </div>
              <div style={{ fontSize: 12, color: 'white', opacity: 0.6 }}>habits done</div>
            </div>
          </div>

          {/* Top habits */}
          {topHabits.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.1em', color: 'oklch(0.88 0.09 92)', opacity: 0.7, fontWeight: 600, marginBottom: 10 }}>
                TOP STREAKS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {topHabits.map(h => (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <HabitIcon icon={h.icon} color={h.color} size={20} filled />
                    <span style={{ flex: 1, fontSize: 13, color: 'white', fontWeight: 500 }}>{h.name}</span>
                    <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: 'oklch(0.88 0.09 92)', fontWeight: 600 }}>
                      🔥 {h.currentStreak}d
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ fontSize: 10, color: 'white', opacity: 0.4, textAlign: 'center', marginTop: 4 }}>
            {today} · hearth
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm font-medium"
            style={{ background: 'var(--color-card)', color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold disabled:opacity-50"
            style={{ background: 'var(--color-forest)', color: 'white', fontFamily: 'var(--font-sans)' }}
          >
            {downloading ? 'Saving…' : 'Download PNG'}
          </button>
        </div>
      </div>
    </div>
  );
}
