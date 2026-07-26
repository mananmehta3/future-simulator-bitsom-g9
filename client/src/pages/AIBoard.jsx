import { Handshake, Split } from "lucide-react";
import { useSimulation } from "../context/SimulationContext.jsx";
import ExpertCard from "../components/board/ExpertCard.jsx";

export default function AIBoard() {
  const { simulation } = useSimulation();
  if (!simulation) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {simulation.aiBoard.map((entry, i) => (
          <ExpertCard key={entry.expert} entry={entry} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-6">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Handshake size={15} className="text-emerald-300" /> Consensus
          </h4>
          <p className="text-sm text-muted leading-relaxed">{simulation.consensus}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Split size={15} className="text-amber-300" /> Where they disagree
          </h4>
          <ul className="space-y-2">
            {simulation.disagreements.map((d, i) => (
              <li key={i} className="text-sm text-muted leading-relaxed">
                • {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
