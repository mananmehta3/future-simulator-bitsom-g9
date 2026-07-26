import { useSimulation } from "../context/SimulationContext.jsx";
import FutureCard from "../components/timeline/FutureCard.jsx";

export default function Overview() {
  const { simulation } = useSimulation();
  if (!simulation) return null;

  return (
    <div>
      <p className="text-sm text-muted mb-5 max-w-3xl">
        Four plausible paths — grounded in your profile, reasoned probabilistically. Tap a
        future to explore its full timeline, ripple effects, and second-order outcomes.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {simulation.futures.map((f, i) => (
          <FutureCard key={f.id} future={f} index={i} />
        ))}
      </div>
    </div>
  );
}
