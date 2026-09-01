export function PriceSparkline({
  data,
  width = 120,
  height = 32,
}: {
  data: { period: string; value: number }[];
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.value - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(" L ")}`;

  // Determine color based on trend
  const first = values[0];
  const last = values[values.length - 1];
  const trend = last - first;
  const color = trend > 0 ? "#dc2626" : trend < 0 ? "#16a34a" : "#6b7280";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="inline-block"
    >
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
