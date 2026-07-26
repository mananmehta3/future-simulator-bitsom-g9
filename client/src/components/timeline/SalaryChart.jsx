import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function SalaryChart({ salaryProjection, color = "#6C8CFF", currency = "" }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={salaryProjection} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`salaryFill-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="year"
          tickFormatter={(y) => `Yr ${y}`}
          stroke="rgba(255,255,255,0.3)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="rgba(255,255,255,0.3)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
          width={40}
        />
        <Tooltip
          contentStyle={{
            background: "#12141c",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            fontSize: 12,
          }}
          formatter={(value) => [`${currency} ${Number(value).toLocaleString()}`, "Salary"]}
          labelFormatter={(y) => `Year ${y}`}
        />
        <Area
          type="monotone"
          dataKey="salary"
          stroke={color}
          strokeWidth={2}
          fill={`url(#salaryFill-${color.replace("#", "")})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
