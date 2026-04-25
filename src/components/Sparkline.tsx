interface Props {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  filled?: boolean;
  className?: string;
}

export default function Sparkline({ data, width = 80, height = 24, color = '#24402E', filled = true, className = '' }: Props) {
  if (data.length < 2) return <div style={{ width, height }} className={className} />;

  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * w;
    const y = pad + h - ((v - min) / range) * h;
    return `${x},${y}`;
  });

  const polyline = pts.join(' ');
  const areaPath = `M${pts[0]} L${pts.join(' L')} L${pad + w},${pad + h} L${pad},${pad + h} Z`;

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`}>
      {filled && (
        <path
          d={areaPath}
          fill={color}
          opacity={0.12}
        />
      )}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
