import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { HabitColor } from '../types/habit';
import { GLYPH_COLORS, GLYPH_COLORS_LIGHT } from '../types/habit';

interface Props {
  icon: string;
  color: HabitColor;
  size?: number;
  filled?: boolean;
}

export default function HabitIcon({ icon, color, size = 24, filled = false }: Props) {
  const bgColor = GLYPH_COLORS_LIGHT[color];
  const iconColor = GLYPH_COLORS[color];
  const containerSize = Math.round(size * 1.6);

  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>)[icon];

  return (
    <div
      style={{
        width: containerSize,
        height: containerSize,
        borderRadius: Math.round(containerSize * 0.28),
        background: filled ? iconColor : bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {IconComponent ? (
        <IconComponent
          size={Math.round(size * 0.65)}
          color={filled ? 'white' : iconColor}
          strokeWidth={2}
        />
      ) : (
        <svg width={Math.round(size * 0.65)} height={Math.round(size * 0.65)} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="5" fill={filled ? 'white' : iconColor} />
        </svg>
      )}
    </div>
  );
}
