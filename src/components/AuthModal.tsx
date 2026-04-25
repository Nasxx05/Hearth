import { useState } from 'react';
import { signInWithPassword, signUpWithPassword, resetPasswordForEmail } from '../lib/supabase';

type Mode = 'signin' | 'signup' | 'forgot';

interface Props {
  onClose: () => void;
}

export default function AuthModal({ onClose }: Props) {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  const reset = (m: Mode) => { setMode(m); setError(''); setDone(''); };

  const handle = async () => {
    setError('');
    if (!email.trim()) { setError('Email is required'); return; }
    if (mode !== 'forgot' && !password) { setError('Password is required'); return; }
    if (mode === 'signup' && password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error: err } = await signInWithPassword(email.trim(), password);
        if (err) { setError(err.message); return; }
        onClose();
      } else if (mode === 'signup') {
        const { error: err } = await signUpWithPassword(email.trim(), password);
        if (err) { setError(err.message); return; }
        setDone('Check your email to confirm your account.');
      } else {
        const { error: err } = await resetPasswordForEmail(email.trim());
        if (err) { setError(err.message); return; }
        setDone('Password reset link sent to your email.');
      }
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<Mode, string> = {
    signin: 'Sign in',
    signup: 'Create account',
    forgot: 'Reset password',
  };

  const ctaLabels: Record<Mode, string> = {
    signin: 'Sign in',
    signup: 'Create account',
    forgot: 'Send reset link',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm rounded-3xl p-6 animate-scale-in"
        style={{ background: 'var(--color-card)' }}
      >
        <div className="text-center mb-6">
          <div className="font-display text-2xl font-medium mb-1" style={{ color: 'var(--color-ink)' }}>
            {titles[mode]}
          </div>
          <p className="text-sm" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
            {mode === 'signin' ? 'Sign in to sync your habits across devices.' :
             mode === 'signup' ? 'Create a free account to back up your data.' :
             'Enter your email and we\'ll send a reset link.'}
          </p>
        </div>

        {done ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">📬</div>
            <p className="text-sm mb-6" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
              {done}
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl text-sm font-medium"
              style={{ background: 'var(--color-forest)', color: 'white', fontFamily: 'var(--font-sans)' }}
            >
              Got it
            </button>
          </div>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none mb-3"
              style={{ background: 'var(--color-bg-soft)', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', border: '1.5px solid transparent' }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-forest)')}
              onBlur={e => (e.target.style.borderColor = 'transparent')}
            />
            {mode !== 'forgot' && (
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none mb-3"
                style={{ background: 'var(--color-bg-soft)', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', border: '1.5px solid transparent' }}
                onFocus={e => (e.target.style.borderColor = 'var(--color-forest)')}
                onBlur={e => (e.target.style.borderColor = 'transparent')}
                onKeyDown={e => e.key === 'Enter' && mode === 'signin' && handle()}
              />
            )}
            {mode === 'signup' && (
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none mb-3"
                style={{ background: 'var(--color-bg-soft)', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', border: '1.5px solid transparent' }}
                onFocus={e => (e.target.style.borderColor = 'var(--color-forest)')}
                onBlur={e => (e.target.style.borderColor = 'transparent')}
                onKeyDown={e => e.key === 'Enter' && handle()}
              />
            )}
            {error && (
              <p className="text-xs mb-3 text-center" style={{ color: 'var(--color-terracotta)', fontFamily: 'var(--font-sans)' }}>
                {error}
              </p>
            )}
            <button
              onClick={handle}
              disabled={loading}
              className="w-full py-3 rounded-2xl text-sm font-semibold disabled:opacity-40 mb-3"
              style={{ background: 'var(--color-forest)', color: 'white', fontFamily: 'var(--font-sans)' }}
            >
              {loading ? 'Please wait…' : ctaLabels[mode]}
            </button>

            <div className="flex flex-col items-center gap-1">
              {mode === 'signin' && (
                <>
                  <button onClick={() => reset('signup')} className="text-xs" style={{ color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}>
                    No account? Sign up
                  </button>
                  <button onClick={() => reset('forgot')} className="text-xs" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
                    Forgot password?
                  </button>
                </>
              )}
              {mode === 'signup' && (
                <button onClick={() => reset('signin')} className="text-xs" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
                  Already have an account? Sign in
                </button>
              )}
              {mode === 'forgot' && (
                <button onClick={() => reset('signin')} className="text-xs" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
                  Back to sign in
                </button>
              )}
              <button onClick={onClose} className="text-xs mt-1" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
