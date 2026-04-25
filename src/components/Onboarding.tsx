import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { GLYPH_COLORS } from '../types/habit';

const STEPS = [
  {
    headline: 'Small things.\nStacked daily.',
    body: 'Hearth helps you show up for the habits that matter — with streaks that celebrate consistency, not perfection.',
  },
  {
    headline: 'Your habits,\nyour glyphs.',
    body: 'Choose a shape and colour to represent each habit. No emoji — just clean geometric symbols that are yours.',
  },
  {
    headline: 'See your\nrhythm clearly.',
    body: 'Heatmaps, sparklines, and streaks give you a true picture of how you\'re building momentum over time.',
  },
  {
    headline: 'Ready to\nbuild your hearth.',
    body: 'Four seed habits are waiting for you. Customise them, add your own, and start your first streak today.',
  },
];

// Glyph illustration for onboarding
function GlyphIllustration({ step }: { step: number }) {
  const configs = [
    // Step 0: central orbit
    { cx: 100, cy: 100, shapes: [
      { x: 100, y: 100, size: 28, shape: 'disc', color: '#24402E', filled: true },
      { x: 58, y: 68, size: 16, shape: 'square', color: GLYPH_COLORS.sage, filled: true },
      { x: 142, y: 72, size: 14, shape: 'ring', color: GLYPH_COLORS.sky, filled: false },
      { x: 54, y: 130, size: 13, shape: 'triangle', color: GLYPH_COLORS.rose, filled: true },
      { x: 144, y: 132, size: 15, shape: 'hex', color: GLYPH_COLORS.wheat, filled: true },
    ]},
    // Step 1: color grid
    { cx: 100, cy: 100, shapes: [
      { x: 56, y: 76, size: 18, shape: 'disc', color: GLYPH_COLORS.moss, filled: true },
      { x: 100, y: 76, size: 18, shape: 'disc', color: GLYPH_COLORS.ocean, filled: true },
      { x: 144, y: 76, size: 18, shape: 'disc', color: GLYPH_COLORS.plum, filled: true },
      { x: 56, y: 118, size: 18, shape: 'square', color: GLYPH_COLORS.clay, filled: true },
      { x: 100, y: 118, size: 18, shape: 'diamond', color: GLYPH_COLORS.rose, filled: true },
      { x: 144, y: 118, size: 18, shape: 'triangle', color: GLYPH_COLORS.wheat, filled: true },
    ]},
    // Step 2: sparkline preview
    { cx: 100, cy: 100, shapes: [
      { x: 60, y: 80, size: 16, shape: 'disc', color: GLYPH_COLORS.moss, filled: true },
      { x: 80, y: 95, size: 16, shape: 'disc', color: GLYPH_COLORS.moss, filled: true },
      { x: 100, y: 78, size: 16, shape: 'disc', color: GLYPH_COLORS.moss, filled: true },
      { x: 120, y: 88, size: 16, shape: 'disc', color: GLYPH_COLORS.moss, filled: true },
      { x: 140, y: 72, size: 16, shape: 'disc', color: GLYPH_COLORS.moss, filled: true },
    ]},
    // Step 3: hearth glyph
    { cx: 100, cy: 100, shapes: [
      { x: 100, y: 95, size: 36, shape: 'hex', color: '#24402E', filled: true },
    ]},
  ];

  const cfg = configs[step] ?? configs[0];

  return (
    <svg width={200} height={200} viewBox="0 0 200 200" className="mx-auto">
      {/* Orbit ring for step 0 */}
      {step === 0 && (
        <circle cx={100} cy={100} r={52} fill="none" stroke="#24402E" strokeWidth={1.5} strokeDasharray="4 4" opacity={0.3} />
      )}
      {cfg.shapes.map((s, i) => {
        const { x, y, size, color, filled } = s;
        const c = size / 2;
        const r = size * 0.36;

        const renderShape = () => {
          switch (s.shape) {
            case 'disc': return <circle cx={c} cy={c} r={r} fill={filled ? color : 'none'} stroke={color} strokeWidth={filled ? 0 : 2} />;
            case 'ring': return <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={size * 0.1} />;
            case 'square': { const sq = r * 1.55; return <rect x={c - sq/2} y={c - sq/2} width={sq} height={sq} rx={size * 0.08} fill={filled ? color : 'none'} stroke={color} strokeWidth={filled ? 0 : 2} />; }
            case 'diamond': { const d = r * 1.4; return <polygon points={`${c},${c-d} ${c+d},${c} ${c},${c+d} ${c-d},${c}`} fill={filled ? color : 'none'} stroke={color} strokeWidth={filled ? 0 : 2} />; }
            case 'triangle': { const h = r * 1.6; const w = h * 1.1547; return <polygon points={`${c},${c - h*0.67} ${c+w/2},${c+h*0.33} ${c-w/2},${c+h*0.33}`} fill={filled ? color : 'none'} stroke={color} strokeWidth={filled ? 0 : 2} />; }
            case 'hex': { const pts = Array.from({ length: 6 }, (_, k) => { const a = (Math.PI/3)*k - Math.PI/6; return `${c+r*Math.cos(a)},${c+r*Math.sin(a)}`; }).join(' '); return <polygon points={pts} fill={filled ? color : 'none'} stroke={color} strokeWidth={filled ? 0 : 2} />; }
            default: return null;
          }
        };

        return (
          <g key={i} transform={`translate(${x - size/2}, ${y - size/2})`}>
            <rect x={0} y={0} width={size + 6} height={size + 6} rx={size * 0.25}
              fill={color} fillOpacity={0.12} />
            <g transform="translate(3, 3)">
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {renderShape()}
              </svg>
            </g>
          </g>
        );
      })}

      {/* Sparkline for step 2 */}
      {step === 2 && (
        <polyline
          points="60,80 80,95 100,78 120,88 140,72"
          fill="none"
          stroke={GLYPH_COLORS.moss}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.6}
        />
      )}

      {/* Hearth flame for step 3 */}
      {step === 3 && (
        <text x={100} y={106} textAnchor="middle" fontSize={20} style={{ fontFamily: 'system-ui' }}>
          ✦
        </text>
      )}
    </svg>
  );
}

export default function Onboarding() {
  const { navigate, updateProfile } = useHabits();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const isLast = step === STEPS.length - 1;

  const handleContinue = () => {
    if (isLast) {
      if (name.trim()) updateProfile({ name: name.trim() });
      navigate('home');
    } else {
      setStep(s => s + 1);
    }
  };

  const { headline, body } = STEPS[step];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-8 py-12 animate-fade-in"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Illustration area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        <GlyphIllustration step={step} />

        <div className="mt-8 text-center">
          <div className="text-xs font-medium tracking-widest mb-3" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
            STEP {step + 1} OF {STEPS.length}
          </div>
          <h1
            className="font-display text-4xl font-medium leading-tight mb-4"
            style={{ color: 'var(--color-ink)', whiteSpace: 'pre-line' }}
          >
            {headline}
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
            {body}
          </p>

          {isLast && (
            <div className="mt-6">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="What's your name?"
                className="w-full px-4 py-3 rounded-2xl text-sm text-center outline-none"
                style={{
                  background: 'var(--color-card)',
                  color: 'var(--color-ink)',
                  fontFamily: 'var(--font-sans)',
                  border: '1.5px solid var(--color-bg-soft)',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: i === step ? 20 : 6,
              height: 6,
              background: i === step ? 'var(--color-forest)' : 'var(--color-bg-soft)',
            }}
          />
        ))}
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm flex gap-3">
        {step > 0 ? (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex-1 py-4 rounded-2xl text-base font-medium"
            style={{ background: 'var(--color-card)', color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}
          >
            Back
          </button>
        ) : (
          <button
            onClick={() => navigate('home')}
            className="flex-1 py-4 rounded-2xl text-base font-medium"
            style={{ background: 'var(--color-card)', color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}
          >
            Skip
          </button>
        )}
        <button
          onClick={handleContinue}
          className="flex-2 flex-grow py-4 rounded-2xl text-base font-semibold flex items-center justify-center gap-2"
          style={{ background: 'var(--color-forest)', color: 'white', fontFamily: 'var(--font-sans)' }}
        >
          {isLast ? 'Start Hearth' : 'Continue'}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
