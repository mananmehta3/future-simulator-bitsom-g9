import { useSimulation } from "../context/SimulationContext.jsx";
import MetricBar from "../components/comparison/MetricBar.jsx";

function Row({ label, children }) {
  return (
    <tr className="border-t border-white/[0.06]">
      <td className="py-4 pr-6 text-sm text-muted whitespace-nowrap align-top w-48">{label}</td>
      {children}
    </tr>
  );
}

export default function Comparison() {
  const { simulation } = useSimulation();
  if (!simulation) return null;
  const { futures } = simulation;
  const currency = simulation.profile?.currency || "";

  const finalSalary = (f) => f.salaryProjection[f.salaryProjection.length - 1]?.salary ?? 0;

  return (
    <div className="glass rounded-3xl p-4 sm:p-8 overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[820px] border-collapse">
        <thead>
          <tr>
            <th className="text-left pb-4 w-48" />
            {futures.map((f) => (
              <th key={f.id} className="text-left pb-4 pr-6">
                <span
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-block mb-1.5"
                  style={{ backgroundColor: `${f.color}22`, color: f.color }}
                >
                  Future {f.id}
                </span>
                <p className="text-sm font-semibold">{f.title}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <Row label="Probability of success">
            {futures.map((f) => (
              <td key={f.id} className="py-4 pr-6 text-sm font-medium" style={{ color: f.color }}>
                ~{f.probabilityOfSuccess}%
              </td>
            ))}
          </Row>
          <Row label="Risk">
            {futures.map((f) => (
              <td key={f.id} className="py-4 pr-6">
                <MetricBar value={f.riskLevel} color="#F87171" />
              </td>
            ))}
          </Row>
          <Row label="Money / financial stability">
            {futures.map((f) => (
              <td key={f.id} className="py-4 pr-6">
                <MetricBar value={f.metrics.financialStability} color="#FBBF24" />
              </td>
            ))}
          </Row>
          <Row label={`Projected salary (final year)`}>
            {futures.map((f) => (
              <td key={f.id} className="py-4 pr-6 text-sm">
                {currency} {finalSalary(f).toLocaleString()}
              </td>
            ))}
          </Row>
          <Row label="Career growth">
            {futures.map((f) => (
              <td key={f.id} className="py-4 pr-6">
                <MetricBar value={f.metrics.careerSatisfaction} color="#6C8CFF" />
              </td>
            ))}
          </Row>
          <Row label="Freedom">
            {futures.map((f) => (
              <td key={f.id} className="py-4 pr-6">
                <MetricBar value={f.metrics.freedom} color="#C084FC" />
              </td>
            ))}
          </Row>
          <Row label="Mental health">
            {futures.map((f) => (
              <td key={f.id} className="py-4 pr-6">
                <MetricBar value={f.metrics.stress} color="#4ADE80" invert />
              </td>
            ))}
          </Row>
          <Row label="Learning">
            {futures.map((f) => (
              <td key={f.id} className="py-4 pr-6">
                <MetricBar value={f.metrics.learning} color="#22D3EE" />
              </td>
            ))}
          </Row>
          <Row label="Network / relationships">
            {futures.map((f) => (
              <td key={f.id} className="py-4 pr-6">
                <MetricBar value={f.metrics.networkStrength} color="#F472B6" />
              </td>
            ))}
          </Row>
          <Row label="Skills acquired">
            {futures.map((f) => (
              <td key={f.id} className="py-4 pr-6 text-xs text-muted max-w-[220px]">
                {f.skillsAcquired.slice(0, 4).join(", ")}
                {f.skillsAcquired.length > 4 ? "…" : ""}
              </td>
            ))}
          </Row>
          <Row label="Biggest risk">
            {futures.map((f) => (
              <td key={f.id} className="py-4 pr-6 text-xs text-muted max-w-[220px]">
                {f.biggestRisk}
              </td>
            ))}
          </Row>
          <Row label="Biggest reward">
            {futures.map((f) => (
              <td key={f.id} className="py-4 pr-6 text-xs text-muted max-w-[220px]">
                {f.biggestReward}
              </td>
            ))}
          </Row>
        </tbody>
      </table>
    </div>
  );
}
