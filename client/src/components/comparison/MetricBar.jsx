export default function MetricBar({ value, color, invert = false }) {
  const display = invert ? 100 - value : value;
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(2, display)}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-muted w-8 text-right">{Math.round(display)}</span>
    </div>
  );
}
