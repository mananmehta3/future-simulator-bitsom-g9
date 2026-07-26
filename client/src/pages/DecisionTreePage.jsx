import { useSimulation } from "../context/SimulationContext.jsx";
import TreeNode from "../components/decisionTree/TreeNode.jsx";

export default function DecisionTreePage() {
  const { simulation } = useSimulation();
  if (!simulation) return null;

  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <p className="text-sm text-muted mb-6 max-w-2xl">
        A branching view of how this decision could plausibly unfold — from immediate outcomes
        to secondary effects to long-term consequences.
      </p>
      <div className="overflow-x-auto scrollbar-thin">
        <TreeNode node={simulation.decisionTree} />
      </div>
    </div>
  );
}
