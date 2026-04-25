import type { HabitColor } from '../types/habit';
import { GLYPH_COLORS } from '../types/habit';

interface HeatmapDay {
  date: string;
  value: number;
}

interface Props {
  days: HeatmapDay[];
  color?: HabitColor;
  weeks?: number;
  cellSize?: number;
  gap?: number;
  className?: string;
}

const INTENSITY_OPACITIES = [0.08, 0.25, 0.5, 0.75, 1];

export default function Heatmap({ days, color = 'forest' as HabitColor, weeks = 17, cellSize = 11, gap = 2, className = '' }: Props) {
  const baseColor = color === ('forest' as HabitColor) ? '#24402E' : GLYPH_COLORS[color];

  const dayMap = new Map(days.map(d => [d.date, d.value]));

  const totalCells = weeks * 7;
  const today = new Date();
  const cells: { date: string; value: number }[] = [];

  for (let i = totalCells - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    cells.push({ date: iso, value: dayMap.get(iso) ?? 0 });
  }

  const cols: { date: string; value: number }[][] = [];
  for (let w = 0; w < weeks; w++) {
    cols.push(cells.slice(w * 7, w * 7 + 7));
  }

  const gridWidth = weeks * (cellSize + gap) - gap;
  const gridHeight = 7 * (cellSize + gap) - gap;

  return (
    <div className={className}>
      <svg width={gridWidth} height={gridHeight}>
        {cols.map((col, wi) =>
          col.map((cell, di) => {
            const intensity = Math.min(cell.value, 4);
            const opacity = cell.value === 0 ? INTENSITY_OPACITIES[0] : INTENSITY_OPACITIES[intensity];
            return (
              <rect
                key={`${wi}-${di}`}
                x={wi * (cellSize + gap)}
                y={di * (cellSize + gap)}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill={baseColor}
                opacity={opacity}
              />
            );
          })
        )}
      </svg>
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-xs" style={{ color: '#A8A49C', fontFamily: 'var(--font-sans)' }}>Less</span>
        {INTENSITY_OPACITIES.map((op, i) => (
          <div
            key={i}
            style={{ width: cellSize, height: cellSize, borderRadius: 2, backgroundColor: baseColor, opacity: op }}
          />
        ))}
        <span className="text-xs" style={{ color: '#A8A49C', fontFamily: 'var(--font-sans)' }}>More</span>
      </div>
    </div>
  );
}
