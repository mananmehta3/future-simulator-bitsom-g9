import Gauge from "./Gauge.jsx";

const METRIC_META = [
  { key: "happiness", label: "Happiness", color: "#4ADE80" },
  { key: "stress", label: "Stress", color: "#F87171" },
  { key: "financialStability", label: "Financial stability", color: "#FBBF24" },
  { key: "careerSatisfaction", label: "Career satisfaction", color: "#6C8CFF" },
  { key: "learning", label: "Learning", color: "#22D3EE" },
  { key: "freedom", label: "Freedom", color: "#C084FC" },
  { key: "networkStrength", label: "Network", color: "#F472B6" },
];

export default function MetricsGrid({ metrics }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4">
      {METRIC_META.map((m) => (
        <Gauge key={m.key} value={metrics[m.key] ?? 0} label={m.label} color={m.color} size={84} />
      ))}
    </div>
  );
}
