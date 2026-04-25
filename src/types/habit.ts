export type HabitColor = 'moss' | 'sage' | 'ocean' | 'sky' | 'plum' | 'rose' | 'clay' | 'wheat';

export interface PauseRange {
  start: string;
  end: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: HabitColor;
  category: string;
  targetValue: number;
  targetUnit: string;
  createdAt: string;
  currentStreak: number;
  longestStreak: number;
  completionDates: string[];
  isCompletedToday: boolean;
  schedule: number[];
  reminderTime: string | null;
  skipDates: string[];
  quantityToday: number;
  pauseRanges: PauseRange[];
  streakFreezes: number;
  lastFreezeRefill: string;
}

export interface UserProfile {
  name: string;
  tagline: string;
  joinDate: string;
  avatar: string;
  vacationMode: { start: string; end: string } | null;
  isPremium: boolean;
}

export interface Reflection {
  id: string;
  habitId: string | null;
  date: string;
  text: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface UndoAction {
  type: 'toggle' | 'delete' | 'quantity';
  habitId: string;
  habitData?: Habit;
  previousQuantity?: number;
  timestamp: number;
}

export type View =
  | 'onboarding'
  | 'home'
  | 'calendar'
  | 'habit-detail'
  | 'profile'
  | 'stats'
  | 'weekly-review';

export type ThemeMode = 'light' | 'dark' | 'system';

export const GLYPH_COLORS: Record<HabitColor, string> = {
  moss:  '#4A7C59',
  sage:  '#7EA58C',
  ocean: '#3B7A8F',
  sky:   '#6BA3C4',
  plum:  '#7B5C8C',
  rose:  '#C47A8A',
  clay:  '#B5614A',
  wheat: '#B8963E',
};

export const GLYPH_COLORS_LIGHT: Record<HabitColor, string> = {
  moss:  '#D1E8DA',
  sage:  '#D9EDE5',
  ocean: '#C8DDE8',
  sky:   '#C9DFF0',
  plum:  '#DDD0E8',
  rose:  '#F0D9DF',
  clay:  '#EDD5CC',
  wheat: '#EDE0C4',
};

export const HABIT_ICONS: { name: string; label: string; category: string }[] = [
  { name: 'Flame',       label: 'Streak',     category: 'General' },
  { name: 'Droplets',    label: 'Hydrate',    category: 'Health' },
  { name: 'BookOpen',    label: 'Read',       category: 'Learning' },
  { name: 'Brain',       label: 'Meditate',   category: 'Mindfulness' },
  { name: 'Moon',        label: 'Sleep',      category: 'Health' },
  { name: 'Apple',       label: 'Eat well',   category: 'Health' },
  { name: 'Dumbbell',    label: 'Workout',    category: 'Fitness' },
  { name: 'Palette',     label: 'Create',     category: 'Creativity' },
  { name: 'PenLine',     label: 'Journal',    category: 'Mindfulness' },
  { name: 'Music',       label: 'Music',      category: 'Creativity' },
  { name: 'Bike',        label: 'Cycle',      category: 'Fitness' },
  { name: 'Heart',       label: 'Self-care',  category: 'Health' },
  { name: 'Coffee',      label: 'Morning',    category: 'General' },
  { name: 'Leaf',        label: 'Nature',     category: 'Wellness' },
  { name: 'Sun',         label: 'Sunlight',   category: 'Wellness' },
  { name: 'Star',        label: 'Goal',       category: 'General' },
  { name: 'Zap',         label: 'Energy',     category: 'Fitness' },
  { name: 'Wind',        label: 'Breathe',    category: 'Mindfulness' },
  { name: 'Camera',      label: 'Photo',      category: 'Creativity' },
  { name: 'Code',        label: 'Code',       category: 'Learning' },
  { name: 'Globe',       label: 'Language',   category: 'Learning' },
  { name: 'Headphones',  label: 'Podcast',    category: 'Learning' },
  { name: 'Smile',       label: 'Gratitude',  category: 'Mindfulness' },
  { name: 'Trophy',      label: 'Challenge',  category: 'General' },
  { name: 'Target',      label: 'Focus',      category: 'General' },
  { name: 'Watch',       label: 'Time',       category: 'General' },
  { name: 'Wallet',      label: 'Finance',    category: 'Finance' },
  { name: 'Bed',         label: 'Rest',       category: 'Health' },
  { name: 'Trees',       label: 'Walk',       category: 'Fitness' },
  { name: 'Dog',         label: 'Pet',        category: 'General' },
  { name: 'Pill',        label: 'Medicine',   category: 'Health' },
  { name: 'Utensils',    label: 'Cook',       category: 'Health' },
  { name: 'Glasses',     label: 'Study',      category: 'Learning' },
  { name: 'Stretching',  label: 'Stretch',    category: 'Fitness' },
  { name: 'PersonStanding', label: 'Posture', category: 'Fitness' },
  { name: 'HandHeart',   label: 'Kindness',   category: 'Mindfulness' },
  { name: 'Sprout',      label: 'Grow',       category: 'Wellness' },
  { name: 'Bath',        label: 'Hygiene',    category: 'Health' },
  { name: 'ClipboardList', label: 'Plan',     category: 'General' },
  { name: 'Phone',       label: 'Digital',    category: 'General' },
];
