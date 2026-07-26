import { createContext, useContext, useMemo, useState, useCallback } from "react";
import { simulationApi } from "../services/api.js";
import { DEFAULT_PROFILE, HORIZON_OPTIONS } from "../utils/constants.js";

const SimulationContext = createContext(null);

export function SimulationProvider({ children }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [decision, setDecision] = useState("");
  const [horizonYears, setHorizonYears] = useState(HORIZON_OPTIONS[1]);

  const [simulation, setSimulation] = useState(null); // full result from server
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState(null);
  const [selectedFutureId, setSelectedFutureId] = useState(null);

  const runSimulation = useCallback(
    async ({ whatIf, parentId } = {}) => {
      setStatus("loading");
      setError(null);
      try {
        const data = await simulationApi.simulate({
          decision,
          horizonYears,
          profile,
          whatIf,
          parentId,
        });
        setSimulation(data);
        setSelectedFutureId(data.futures?.[0]?.id ?? null);
        setStatus("success");
        return data;
      } catch (err) {
        setError(err.message);
        setStatus("error");
        throw err;
      }
    },
    [decision, horizonYears, profile]
  );

  const loadSimulation = useCallback(async (id) => {
    setStatus("loading");
    setError(null);
    try {
      const data = await simulationApi.getHistoryItem(id);
      setSimulation(data);
      setDecision(data.decision);
      setHorizonYears(data.horizonYears);
      setProfile(data.profile);
      setSelectedFutureId(data.futures?.[0]?.id ?? null);
      setStatus("success");
      return data;
    } catch (err) {
      setError(err.message);
      setStatus("error");
      throw err;
    }
  }, []);

  const value = useMemo(
    () => ({
      profile,
      setProfile,
      decision,
      setDecision,
      horizonYears,
      setHorizonYears,
      simulation,
      status,
      error,
      selectedFutureId,
      setSelectedFutureId,
      runSimulation,
      loadSimulation,
    }),
    [profile, decision, horizonYears, simulation, status, error, selectedFutureId, runSimulation, loadSimulation]
  );

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error("useSimulation must be used within SimulationProvider");
  return ctx;
}
