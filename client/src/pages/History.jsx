import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowRight, Inbox, Loader2 } from "lucide-react";
import { simulationApi } from "../services/api.js";
import { useSimulation } from "../context/SimulationContext.jsx";

export default function History() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const { loadSimulation } = useSimulation();
  const navigate = useNavigate();

  useEffect(() => {
    simulationApi
      .listHistory()
      .then(setItems)
      .catch((err) => setError(err.message));
  }, []);

  const open = async (id) => {
    setLoadingId(id);
    try {
      await loadSimulation(id);
      navigate("/results/overview");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-6 pt-12 pb-32">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Recent simulations</h1>
      <p className="text-sm text-muted mb-8">Revisit a past decision and its simulated futures.</p>

      {error && <p className="text-sm text-rose-400 mb-4">{error}</p>}

      {!items && !error && (
        <div className="flex items-center gap-2 text-muted text-sm">
          <Loader2 size={15} className="animate-spin" /> Loading history...
        </div>
      )}

      {items && items.length === 0 && (
        <div className="glass rounded-2xl p-10 text-center text-muted">
          <Inbox size={28} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">No simulations yet. Start your first one.</p>
          <button
            onClick={() => navigate("/new")}
            className="mt-4 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-slate-200 transition-colors"
          >
            Simulate My Future
          </button>
        </div>
      )}

      <div className="space-y-3">
        {items?.map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            onClick={() => open(item.id)}
            disabled={loadingId === item.id}
            className="w-full glass rounded-2xl p-5 flex items-center justify-between gap-4 text-left hover:bg-white/[0.06] transition-colors"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{item.decision}</p>
              <p className="text-xs text-muted mt-1.5 flex items-center gap-1.5">
                <Clock size={12} />
                {new Date(item.createdAt).toLocaleString()} · {item.horizonYears}-year horizon
                {item.parentId ? " · what-if branch" : ""}
              </p>
            </div>
            {loadingId === item.id ? (
              <Loader2 size={16} className="animate-spin text-muted shrink-0" />
            ) : (
              <ArrowRight size={16} className="text-muted shrink-0" />
            )}
          </motion.button>
        ))}
      </div>
    </main>
  );
}
