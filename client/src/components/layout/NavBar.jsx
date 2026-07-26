import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, Sun, Moon, History as HistoryIcon, Plus } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useSimulation } from "../../context/SimulationContext.jsx";

export default function NavBar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { simulation } = useSimulation();

  const isLanding = location.pathname === "/";

  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="glass rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-glass">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-semibold tracking-tight text-[15px]">
              Future Simulator
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            {simulation && (
              <Link
                to="/results/overview"
                className="px-3 py-1.5 rounded-lg text-muted hover:text-current hover:bg-white/5 transition-colors"
              >
                Current Simulation
              </Link>
            )}
            <Link
              to="/history"
              className="px-3 py-1.5 rounded-lg text-muted hover:text-current hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              <HistoryIcon size={14} /> History
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted hover:text-current hover:bg-white/5 transition-colors"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {!isLanding && (
              <button
                onClick={() => navigate("/new")}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-black text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                <Plus size={15} /> New
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
