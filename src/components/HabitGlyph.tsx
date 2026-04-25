import type { HabitColor } from '../types/habit';
type HabitShape = 'disc' | 'ring' | 'square' | 'diamond' | 'triangle' | 'hex';
import { GLYPH_COLORS, GLYPH_COLORS_LIGHT } from '../types/habit';

interface Props {
  shape: HabitShape;
  color: HabitColor;
  size?: number;
  filled?: boolean;
  className?: string;
}

export default function HabitGlyph({ shape, color, size = 32, filled = true, className = '' }: Props) {
  const fill = filled ? GLYPH_COLORS[color] : 'none';
  const stroke = GLYPH_COLORS[color];
  const bg = GLYPH_COLORS_LIGHT[color];
  const strokeW = filled ? 0 : 2;
  const c = size / 2;
  const r = size * 0.36;

  const shapeEl = () => {
    switch (shape) {
      case 'disc':
        return <circle cx={c} cy={c} r={r} fill={fill} stroke={stroke} strokeWidth={strokeW} />;
      case 'ring':
        return <circle cx={c} cy={c} r={r} fill="none" stroke={stroke} strokeWidth={size * 0.09} />;
      case 'square': {
        const s = r * 1.55;
        return (
          <rect
            x={c - s / 2} y={c - s / 2}
            width={s} height={s}
            rx={size * 0.08}
            fill={fill} stroke={stroke} strokeWidth={strokeW}
          />
        );
      }
      case 'diamond': {
        const d = r * 1.4;
        return (
          <polygon
            points={`${c},${c - d} ${c + d},${c} ${c},${c + d} ${c - d},${c}`}
            fill={fill} stroke={stroke} strokeWidth={strokeW}
          />
        );
      }
      case 'triangle': {
        const h = r * 1.6;
        const w = h * 1.1547;
        return (
          <polygon
            points={`${c},${c - h * 0.67} ${c + w / 2},${c + h * 0.33} ${c - w / 2},${c + h * 0.33}`}
            fill={fill} stroke={stroke} strokeWidth={strokeW}
          />
        );
      }
      case 'hex': {
        const pts = Array.from({ length: 6 }, (_, i) => {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          return `${c + r * Math.cos(angle)},${c + r * Math.sin(angle)}`;
        }).join(' ');
        return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={strokeW} />;
      }
    }
  };

  return (
    <div
      className={`rounded-xl flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size + 8, height: size + 8, backgroundColor: bg }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {shapeEl()}
      </svg>
    </div>
  );
}
