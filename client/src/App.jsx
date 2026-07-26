import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/layout/NavBar.jsx";
import Landing from "./pages/Landing.jsx";
import InputWizard from "./pages/InputWizard.jsx";
import ResultsLayout from "./pages/ResultsLayout.jsx";
import Overview from "./pages/Overview.jsx";
import FutureDetail from "./pages/FutureDetail.jsx";
import Comparison from "./pages/Comparison.jsx";
import DecisionTreePage from "./pages/DecisionTreePage.jsx";
import AIBoard from "./pages/AIBoard.jsx";
import WhatIf from "./pages/WhatIf.jsx";
import History from "./pages/History.jsx";
import { useSimulation } from "./context/SimulationContext.jsx";

function RequireSimulation({ children }) {
  const { simulation, status } = useSimulation();
  if (!simulation && status !== "loading") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen bg-grid">
      <NavBar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/new" element={<InputWizard />} />
        <Route path="/history" element={<History />} />
        <Route
          path="/results"
          element={
            <RequireSimulation>
              <ResultsLayout />
            </RequireSimulation>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="future/:futureId" element={<FutureDetail />} />
          <Route path="comparison" element={<Comparison />} />
          <Route path="tree" element={<DecisionTreePage />} />
          <Route path="board" element={<AIBoard />} />
          <Route path="whatif" element={<WhatIf />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
