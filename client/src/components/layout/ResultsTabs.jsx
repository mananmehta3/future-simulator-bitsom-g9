import { NavLink } from "react-router-dom";
import { LayoutGrid, Table2, GitBranch, Users, Shuffle } from "lucide-react";

const TABS = [
  { to: "overview", label: "Futures", icon: LayoutGrid },
  { to: "comparison", label: "Comparison", icon: Table2 },
  { to: "tree", label: "Decision Tree", icon: GitBranch },
  { to: "board", label: "AI Board", icon: Users },
  { to: "whatif", label: "What-If", icon: Shuffle },
];

export default function ResultsTabs() {
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-1">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            `flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? "bg-white text-black"
                : "text-muted hover:text-current hover:bg-white/5"
            }`
          }
        >
          <t.icon size={14} />
          {t.label}
        </NavLink>
      ))}
    </div>
  );
}
