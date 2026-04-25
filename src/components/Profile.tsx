import { useState, useRef } from 'react';
import { useHabits } from '../context/HabitContext';
import type { ThemeMode } from '../types/habit';
import { useSupabaseSync } from '../hooks/useSupabaseSync';
import { signOut, supabase } from '../lib/supabase';
import AuthModal from './AuthModal';
import { exportData, importData } from '../utils/exportImport';

const THEME_LABELS: Record<ThemeMode, string> = {
  light: 'Warm / light',
  dark: 'Dark',
  system: 'System',
};

export default function Profile() {
  const { profile, habits, achievements, reflections, themeMode, setThemeMode, updateProfile, navigate, setShowPremiumGate, importAll } = useHabits();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [tagline, setTagline] = useState(profile.tagline);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const { userEmail, lastSynced, syncing, syncUp } = useSupabaseSync();

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const base64 = ev.target?.result as string;
      if (base64) updateProfile({ avatar: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const payload = importData(text);
      if (!payload) {
        setImportMsg('Invalid file. Please use a Hearth export.');
        return;
      }
      importAll(payload);
      setImportMsg('Data imported successfully!');
      setTimeout(() => setImportMsg(''), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const totalCompletions = habits.reduce((s, h) => s + h.completionDates.length, 0);
  const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.longestStreak)) : 0;
  const perfectDays = (() => {
    const allDates = new Set(habits.flatMap(h => h.completionDates));
    let count = 0;
    allDates.forEach(date => {
      if (habits.length > 0 && habits.every(h => h.completionDates.includes(date))) count++;
    });
    return count;
  })();

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const handleSave = () => {
    updateProfile({ name: name.trim() || 'You', tagline: tagline.trim() });
    setEditing(false);
  };

  const cycleTheme = () => {
    const order: ThemeMode[] = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(themeMode) + 1) % order.length];
    setThemeMode(next);
  };

  const joinDate = new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-lg mx-auto px-4 pt-10 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-xs font-medium tracking-widest" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>PROFILE</div>
        <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-card)' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="var(--color-ink-muted)" strokeWidth={1.5} />
            <path d="M5.5 6.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5c0 1-.6 1.88-1.5 2.28V10h-2v-1.22C6.1 8.38 5.5 7.5 5.5 6.5z" fill="var(--color-ink-muted)" />
            <circle cx="8" cy="12" r="1" fill="var(--color-ink-muted)" />
          </svg>
        </button>
      </div>

      {/* Avatar + bio */}
      <div className="flex flex-col items-center text-center mb-6">
        <button onClick={handleAvatarClick} className="relative mb-3 group">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold"
              style={{ background: 'var(--color-forest)', color: 'oklch(0.88 0.09 92)' }}
            >
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2v14M2 9h14" stroke="white" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        {editing ? (
          <div className="w-full max-w-xs space-y-2">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-center font-display text-2xl bg-transparent outline-none border-b-2 pb-1"
              style={{ borderColor: 'var(--color-forest)', color: 'var(--color-ink)' }}
            />
            <input
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              className="w-full text-center text-sm bg-transparent outline-none"
              style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}
            />
            <button
              onClick={handleSave}
              className="w-full py-2 rounded-xl text-sm font-semibold mt-2"
              style={{ background: 'var(--color-forest)', color: 'white', fontFamily: 'var(--font-sans)' }}
            >
              Save
            </button>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-medium mb-1" style={{ color: 'var(--color-ink)' }}>{profile.name}</h1>
            <p className="text-sm mb-1" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>{profile.tagline}</p>
            <p className="text-xs mb-3" style={{ color: 'var(--color-ink-faint)', fontFamily: 'var(--font-sans)' }}>Member since {joinDate}</p>
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-medium px-3 py-1 rounded-full"
              style={{ background: 'var(--color-bg-soft)', color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}
            >
              Edit profile
            </button>
          </>
        )}
      </div>

      {/* Lifetime stats */}
      <div className="p-4 rounded-2xl mb-4" style={{ background: 'var(--color-forest)' }}>
        <div className="text-xs font-semibold tracking-widest mb-3" style={{ color: 'oklch(0.88 0.09 92)', fontFamily: 'var(--font-sans)' }}>
          LIFETIME
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: totalCompletions, label: 'Completions' },
            { value: longestStreak, label: 'Longest streak' },
            { value: perfectDays, label: 'Perfect days' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-mono font-medium text-2xl mb-0.5" style={{ color: i === 1 ? 'oklch(0.88 0.09 92)' : 'white' }}>{s.value}</div>
              <div className="text-[10px]" style={{ color: 'white', opacity: 0.6, fontFamily: 'var(--font-sans)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="p-4 rounded-2xl mb-4" style={{ background: 'var(--color-card)' }}>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-xl font-medium" style={{ color: 'var(--color-ink)' }}>Achievements</h2>
          <span className="text-xs" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>{unlockedCount} unlocked</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {achievements.map(a => (
            <div key={a.id} className="flex flex-col items-center gap-1.5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl"
                style={{
                  background: 'var(--color-bg-soft)',
                  opacity: a.unlocked ? 1 : 0.35,
                }}
              >
                {a.icon}
              </div>
              <span className="text-[10px] text-center leading-tight" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
                {a.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-card)' }}>
        <button
          onClick={cycleTheme}
          className="w-full flex items-center gap-3 px-4 py-4 transition-colors text-left"
          style={{ borderBottom: '1px solid var(--color-bg-soft)' }}
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-bg-soft)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="2.5" stroke="var(--color-ink-muted)" strokeWidth={1.5} />
              <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.64 2.64l1.06 1.06M10.3 10.3l1.06 1.06M11.36 2.64l-1.06 1.06M3.7 10.3L2.64 11.36" stroke="var(--color-ink-muted)" strokeWidth={1.25} strokeLinecap="round" />
            </svg>
          </div>
          <span className="flex-1 text-sm font-medium" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>Appearance</span>
          <span className="text-sm" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>{THEME_LABELS[themeMode]}</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l4 4-4 4" stroke="var(--color-ink-faint)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          onClick={() => navigate('weekly-review')}
          className="w-full flex items-center gap-3 px-4 py-4 transition-colors text-left"
          style={{ borderBottom: '1px solid var(--color-bg-soft)' }}
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-bg-soft)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="3" width="12" height="9" rx="1.5" stroke="var(--color-ink-muted)" strokeWidth={1.5} />
              <path d="M5 1v3M9 1v3M1 6h12" stroke="var(--color-ink-muted)" strokeWidth={1.25} strokeLinecap="round" />
            </svg>
          </div>
          <span className="flex-1 text-sm font-medium" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>Weekly review</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l4 4-4 4" stroke="var(--color-ink-faint)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          className="w-full flex items-center gap-3 px-4 py-4 transition-colors text-left"
          onClick={async () => {
            if ('Notification' in window && Notification.permission === 'default') {
              await Notification.requestPermission();
            }
          }}
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-bg-soft)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1C3.69 1 1 3.69 1 7s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" stroke="var(--color-ink-muted)" strokeWidth={1.5} />
              <path d="M5 5h.01M7 7h.01M9 9h.01" stroke="var(--color-ink-muted)" strokeWidth={1.75} strokeLinecap="round" />
            </svg>
          </div>
          <span className="flex-1 text-sm font-medium" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>Reminders</span>
          <span className="text-sm" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
            {'Notification' in window ? (Notification.permission === 'granted' ? 'On' : 'Tap to enable') : 'Not supported'}
          </span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l4 4-4 4" stroke="var(--color-ink-faint)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Cloud sync */}
      {supabase && (
        <div className="rounded-2xl overflow-hidden mt-4" style={{ background: 'var(--color-card)' }}>
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>Cloud sync</span>
              {userEmail ? (
                <button
                  onClick={() => signOut()}
                  className="text-xs font-medium px-3 py-1 rounded-full"
                  style={{ background: 'var(--color-bg-soft)', color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}
                >
                  Sign out
                </button>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-xs font-medium px-3 py-1 rounded-full"
                  style={{ background: 'var(--color-forest)', color: 'white', fontFamily: 'var(--font-sans)' }}
                >
                  Sign in
                </button>
              )}
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
              {userEmail ? `Signed in as ${userEmail}` : 'Not signed in — data stays local only'}
            </p>
            {userEmail && (
              <button
                onClick={() => syncUp(habits, profile, reflections)}
                disabled={syncing}
                className="w-full py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                style={{ background: 'var(--color-bg-soft)', color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
              >
                {syncing ? 'Syncing…' : 'Sync now'}
              </button>
            )}
            {lastSynced && (
              <p className="text-xs mt-2 text-center" style={{ color: 'var(--color-ink-faint)', fontFamily: 'var(--font-sans)' }}>
                Last synced {lastSynced.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Premium section */}
      <div className="rounded-2xl overflow-hidden mt-4" style={{ background: 'var(--color-card)' }}>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>Plan</span>
            {profile.isPremium ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'var(--color-forest)', color: 'white', fontFamily: 'var(--font-sans)' }}>
                Premium active
              </span>
            ) : null}
          </div>
          {profile.isPremium ? (
            <ul className="text-xs space-y-1 mt-2" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
              <li>✓ Unlimited habits</li>
              <li>✓ 2 streak freezes / week</li>
              <li>✓ Auto cloud sync</li>
              <li>✓ Data export</li>
            </ul>
          ) : (
            <>
              <p className="text-xs mb-3" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
                Free plan — 3 habit limit
              </p>
              <button
                onClick={() => setShowPremiumGate(true)}
                className="w-full py-2 rounded-xl text-sm font-medium"
                style={{ background: 'var(--color-forest)', color: 'white', fontFamily: 'var(--font-sans)' }}
              >
                Upgrade to Premium
              </button>
            </>
          )}
        </div>
      </div>

      {/* Data export/import */}
      <div className="rounded-2xl overflow-hidden mt-4" style={{ background: 'var(--color-card)' }}>
        <div className="px-4 py-4">
          <span className="text-sm font-medium block mb-3" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>Data</span>
          <div className="flex gap-2">
            <button
              onClick={() => exportData(habits, profile, reflections, achievements)}
              className="flex-1 py-2 rounded-xl text-sm font-medium"
              style={{ background: 'var(--color-bg-soft)', color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
            >
              Export
            </button>
            <button
              onClick={() => importInputRef.current?.click()}
              className="flex-1 py-2 rounded-xl text-sm font-medium"
              style={{ background: 'var(--color-bg-soft)', color: 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}
            >
              Import
            </button>
          </div>
          {importMsg && (
            <p className="text-xs mt-2 text-center" style={{ color: importMsg.startsWith('Invalid') ? 'var(--color-terracotta)' : 'var(--color-forest)', fontFamily: 'var(--font-sans)' }}>
              {importMsg}
            </p>
          )}
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
      </div>

      {/* Vacation mode */}
      <div className="rounded-2xl overflow-hidden mt-4" style={{ background: 'var(--color-card)' }}>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>Vacation mode</span>
            {profile.vacationMode ? (
              <button
                onClick={() => updateProfile({ vacationMode: null })}
                className="text-xs font-medium px-3 py-1 rounded-full"
                style={{ background: 'var(--color-terracotta)', color: 'white', fontFamily: 'var(--font-sans)' }}
              >
                Clear
              </button>
            ) : null}
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
            Dates in this range won't break your streaks.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={profile.vacationMode?.start ?? ''}
              onChange={e => updateProfile({ vacationMode: { start: e.target.value, end: profile.vacationMode?.end ?? e.target.value } })}
              className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'var(--color-bg-soft)', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}
            />
            <span className="text-xs" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>to</span>
            <input
              type="date"
              value={profile.vacationMode?.end ?? ''}
              onChange={e => updateProfile({ vacationMode: { start: profile.vacationMode?.start ?? e.target.value, end: e.target.value } })}
              className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'var(--color-bg-soft)', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}
            />
          </div>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
