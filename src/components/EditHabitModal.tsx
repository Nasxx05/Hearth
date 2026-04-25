import { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import type { Habit, HabitColor } from '../types/habit';
import { HABIT_ICONS } from '../types/habit';
import HabitIcon from './HabitIcon';

const COLORS: HabitColor[] = ['moss', 'sage', 'ocean', 'sky', 'plum', 'rose', 'clay', 'wheat'];
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const CATEGORIES = ['Mindfulness', 'Health', 'Fitness', 'Learning', 'Movement', 'Creativity', 'Social', 'Finance', 'General'];

interface Props {
  habit: Habit;
  onClose: () => void;
}

export default function EditHabitModal({ habit, onClose }: Props) {
  const { updateHabit, deleteHabit, navigate } = useHabits();
  const [name, setName] = useState(habit.name);
  const [icon, setIcon] = useState(habit.icon);
  const [color, setColor] = useState<HabitColor>(habit.color);
  const [targetValue, setTargetValue] = useState(habit.targetValue);
  const [targetUnit, setTargetUnit] = useState(habit.targetUnit);
  const [schedule, setSchedule] = useState<number[]>(habit.schedule);
  const [reminderTime, setReminderTime] = useState(habit.reminderTime ?? '');
  const [category, setCategory] = useState(habit.category);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [iconSearch, setIconSearch] = useState('');

  const filteredIcons = iconSearch.trim()
    ? HABIT_ICONS.filter(i =>
        i.name.toLowerCase().includes(iconSearch.toLowerCase()) ||
        i.label.toLowerCase().includes(iconSearch.toLowerCase()) ||
        i.category.toLowerCase().includes(iconSearch.toLowerCase())
      )
    : HABIT_ICONS;

  const toggleDay = (d: number) => {
    setSchedule(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;
    updateHabit(habit.id, { name: name.trim(), icon, color, category, targetValue, targetUnit, schedule, reminderTime: reminderTime || null });
    onClose();
  };

  const handleDelete = () => {
    deleteHabit(habit.id);
    navigate('home');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-t-3xl lg:rounded-3xl p-6 max-h-[90dvh] overflow-y-auto animate-slide-up"
        style={{ background: 'var(--color-card)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <button onClick={onClose} className="text-sm" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>Cancel</button>
          <span className="text-sm font-semibold tracking-widest" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>EDIT HABIT</span>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="text-sm font-semibold px-4 py-1.5 rounded-xl disabled:opacity-40"
            style={{ background: 'var(--color-forest)', color: 'white', fontFamily: 'var(--font-sans)' }}
          >
            Save
          </button>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl mb-5" style={{ background: 'var(--color-bg-soft)' }}>
          <HabitIcon icon={icon} color={color} size={32} filled />
          <div>
            <div className="font-display text-xl font-medium" style={{ color: 'var(--color-ink)' }}>
              {name || 'Habit'}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
              {targetValue} {targetUnit} · {category}
            </div>
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold tracking-widest block mb-2" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>NAME</label>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
            style={{ background: 'var(--color-bg-soft)', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', border: '1.5px solid transparent' }}
            onFocus={e => (e.target.style.borderColor = 'var(--color-forest)')}
            onBlur={e => (e.target.style.borderColor = 'transparent')}
          />
        </div>

        {/* Icon picker */}
        <div className="mb-5">
          <label className="text-xs font-semibold tracking-widest block mb-2" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>ICON</label>
          <input
            value={iconSearch}
            onChange={e => setIconSearch(e.target.value)}
            placeholder="Search icons…"
            className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-3"
            style={{
              background: 'var(--color-bg-soft)',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-sans)',
              border: '1.5px solid transparent',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--color-forest)')}
            onBlur={e => (e.target.style.borderColor = 'transparent')}
          />
          <div className="grid grid-cols-8 gap-1.5 max-h-36 overflow-y-auto">
            {filteredIcons.map(i => (
              <button
                key={i.name}
                onClick={() => setIcon(i.name)}
                title={i.label}
                className="flex items-center justify-center rounded-xl transition-all"
                style={{
                  width: 36,
                  height: 36,
                  background: icon === i.name ? 'var(--color-forest)' : 'var(--color-bg-soft)',
                }}
              >
                <HabitIcon icon={i.name} color={color} size={18} filled={icon === i.name} />
              </button>
            ))}
            {filteredIcons.length === 0 && (
              <div className="col-span-8 py-3 text-center text-xs" style={{ color: 'var(--color-ink-faint)', fontFamily: 'var(--font-sans)' }}>
                No icons found
              </div>
            )}
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold tracking-widest block mb-3" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>COLOR</label>
          <div className="flex gap-2.5 flex-wrap">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-9 h-9 rounded-full transition-all"
                style={{ background: `var(--color-${c})`, outline: color === c ? `3px solid var(--color-${c})` : 'none', outlineOffset: 2 }}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold tracking-widest block mb-2" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>TARGET</label>
          <div className="flex items-center gap-2 p-4 rounded-2xl" style={{ background: 'var(--color-bg-soft)' }}>
            <input type="number" min={1} value={targetValue} onChange={e => setTargetValue(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 text-center font-mono font-medium text-xl bg-transparent outline-none" style={{ color: 'var(--color-ink)' }} />
            <input value={targetUnit} onChange={e => setTargetUnit(e.target.value)} placeholder="times" className="flex-1 bg-transparent outline-none text-sm" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }} />
            <span className="text-sm" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>, daily</span>
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold tracking-widest block mb-3" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>SCHEDULE</label>
          <div className="flex gap-2">
            {DAYS.map((d, i) => (
              <button key={i} onClick={() => toggleDay(i)} className="flex-1 h-10 rounded-xl text-sm font-medium transition-colors"
                style={{ background: schedule.includes(i) ? 'var(--color-forest)' : 'var(--color-bg-soft)', color: schedule.includes(i) ? 'white' : 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold tracking-widest block mb-2" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>REMINDER</label>
          <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'var(--color-bg-soft)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 5v3.5l2.5 1.5" stroke="var(--color-ink-muted)" strokeWidth={1.5} strokeLinecap="round" /></svg>
            <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }} />
          </div>
        </div>

        <div className="mb-6">
          <label className="text-xs font-semibold tracking-widest block mb-2" style={{ color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>CATEGORY</label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} className="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
                style={{ background: category === cat ? 'var(--color-forest)' : 'var(--color-bg-soft)', color: category === cat ? 'white' : 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={!name.trim()} className="w-full py-4 rounded-2xl text-base font-semibold disabled:opacity-40 mb-3"
          style={{ background: 'var(--color-forest)', color: 'white', fontFamily: 'var(--font-sans)' }}>
          Save changes
        </button>

        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="w-full py-3 rounded-2xl text-sm font-medium transition-colors"
            style={{ color: 'var(--color-terracotta)', background: 'var(--color-bg-soft)', fontFamily: 'var(--font-sans)' }}>
            Delete habit
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(false)} className="flex-1 py-3 rounded-2xl text-sm font-medium"
              style={{ background: 'var(--color-bg-soft)', color: 'var(--color-ink-muted)', fontFamily: 'var(--font-sans)' }}>
              Cancel
            </button>
            <button onClick={handleDelete} className="flex-1 py-3 rounded-2xl text-sm font-semibold"
              style={{ background: 'var(--color-terracotta)', color: 'white', fontFamily: 'var(--font-sans)' }}>
              Confirm delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
