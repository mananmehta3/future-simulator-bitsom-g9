import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import ResultsTabs from "../components/layout/ResultsTabs.jsx";
import SimulatingOverlay from "../components/ui/SimulatingOverlay.jsx";
import { useSimulation } from "../context/SimulationContext.jsx";
import { simulationApi } from "../services/api.js";
import { exportSimulationReport } from "../utils/pdfExport.js";

export default function ResultsLayout() {
  const { simulation, status } = useSimulation();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!simulation?.id) return;
    setExporting(true);
    try {
      const report = await simulationApi.getReport(simulation.id);
      exportSimulationReport(report);
    } catch (err) {
      console.error(err);
      alert("Couldn't generate the report: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  if (!simulation) return null;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32">
      {status === "loading" && <SimulatingOverlay label="Re-simulating your future" />}

      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-widest text-muted mb-2">
              {simulation.horizonYears}-year simulation
            </p>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight leading-snug">
              "{simulation.decision}"
            </h1>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-sm font-medium hover:bg-white/[0.08] transition-colors disabled:opacity-60"
          >
            {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            Export PDF Report
          </button>
        </div>
      </div>

      <div className="sticky top-[76px] z-30 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 py-2 bg-[#05060a]/70 backdrop-blur-md rounded-2xl">
        <ResultsTabs />
      </div>

      <Outlet />
    </main>
  );
}
