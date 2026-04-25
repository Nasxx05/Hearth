interface BarData {
  date: string;
  value: number;
  max: number;
}

interface Props {
  data: BarData[];
  color?: string;
  height?: number;
  className?: string;
}

export default function BarChart({ data, color = '#24402E', height = 80, className = '' }: Props) {
  if (data.length === 0) return <div style={{ height }} className={className} />;

  const barW = 6;
  const gap = 2;
  const width = data.length * (barW + gap) - gap;

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {data.map((d, i) => {
        const ratio = d.max > 0 ? d.value / d.max : 0;
        const barH = Math.max(ratio * (height - 4), d.value > 0 ? 3 : 1);
        const x = i * (barW + gap);
        const y = height - barH;
        const opacity = 0.3 + ratio * 0.7;
        return (
          <rect
            key={d.date}
            x={x}
            y={y}
            width={barW}
            height={barH}
            rx={2}
            fill={color}
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
}
