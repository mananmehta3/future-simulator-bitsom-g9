import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

export default function Gauge({ value, label, color = "#6C8CFF", size = 96 }) {
  const data = [{ value: Math.max(0, Math.min(100, value)) }];

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: size, height: size }} className="relative">
        <RadialBarChart
          width={size}
          height={size}
          cx="50%"
          cy="50%"
          innerRadius="72%"
          outerRadius="100%"
          barSize={8}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: "rgba(255,255,255,0.08)" }}
            dataKey="value"
            cornerRadius={20}
            fill={color}
            angleAxisId={0}
          />
        </RadialBarChart>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold">{Math.round(value)}</span>
        </div>
      </div>
      <span className="text-xs text-muted mt-2 text-center">{label}</span>
    </div>
  );
}
