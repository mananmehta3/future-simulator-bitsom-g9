import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { Wand2 } from "lucide-react";
import { useSimulation } from "../context/SimulationContext.jsx";
import { WHAT_IF_LEVERS } from "../utils/constants.js";
import { TextInput } from "../components/ui/FormField.jsx";

export default function WhatIf() {
  const { simulation, runSimulation, status } = useSimulation();
  const navigate = useNavigate();
  const [values, setValues] = useState({});
  const [error, setError] = useState("");

  if (!simulation) return null;

  const setLever = (key, value) => setValues((v) => ({ ...v, [key]: value }));
  const clearLever = (key) =>
    setValues((v) => {
      const next = { ...v };
      delete next[key];
      return next;
    });

  const activeCount = Object.keys(values).filter((k) => values[k] !== "" && values[k] != null).length;

  const handleRegenerate = async () => {
    setError("");
    const whatIf = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v !== "" && v != null && v !== false)
    );
    try {
      await runSimulation({ whatIf, parentId: simulation.id });
      navigate("/results/overview");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-5 text-sm text-muted">
        Adjust one or more variables below, then regenerate. This creates a fresh simulation
        branch on top of your original profile — your original results stay in History.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {WHAT_IF_LEVERS.map((lever) => {
          const Icon = Icons[lever.icon] || Icons.Sparkles;
          const active = values[lever.key] !== undefined && values[lever.key] !== "" && values[lever.key] !== false;
          return (
            <div
              key={lever.key}
              className={`glass rounded-2xl p-5 border transition-colors ${
                active ? "border-indigo-400/50" : "border-white/10"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon size={15} className="text-indigo-300" />
                <p className="text-sm font-medium">{lever.label}</p>
              </div>

              {lever.type === "toggle" && (
                <button
                  onClick={() => (active ? clearLever(lever.key) : setLever(lever.key, true))}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                    active ? "bg-indigo-500 text-white" : "bg-white/[0.04] text-muted hover:text-current"
                  }`}
                >
                  {active ? "Enabled" : "Enable"}
                </button>
              )}

              {lever.type === "percent" && (
                <div className="flex items-center gap-2">
                  <TextInput
                    type="number"
                    placeholder="e.g. 20"
                    value={values[lever.key] ?? ""}
                    onChange={(e) => setLever(lever.key, e.target.value)}
                    className="py-2"
                  />
                  <span className="text-sm text-muted">%</span>
                </div>
              )}

              {lever.type === "text" && (
                <TextInput
                  placeholder="e.g. Germany"
                  value={values[lever.key] ?? ""}
                  onChange={(e) => setLever(lever.key, e.target.value)}
                  className="py-2"
                />
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <button
        onClick={handleRegenerate}
        disabled={activeCount === 0 || status === "loading"}
        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-colors shadow-glow"
      >
        <Wand2 size={16} />
        Regenerate futures {activeCount > 0 ? `with ${activeCount} change${activeCount > 1 ? "s" : ""}` : ""}
      </button>
    </div>
  );
}
