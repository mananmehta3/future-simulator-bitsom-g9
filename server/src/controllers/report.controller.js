import { prisma } from "../services/db.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

// GET /api/report/:id — returns everything needed to render a report (the
// client composes the actual PDF client-side via jsPDF/html2canvas).
export const getReportData = asyncHandler(async (req, res) => {
  const row = await prisma.simulation.findUnique({ where: { id: req.params.id } });
  if (!row) throw new AppError("Simulation not found.", 404);

  const result = JSON.parse(row.result);

  res.json({
    id: row.id,
    generatedAt: new Date().toISOString(),
    createdAt: row.createdAt,
    decision: row.decision,
    horizonYears: row.horizonYears,
    profile: JSON.parse(row.profile),
    futures: result.futures,
    aiBoard: result.aiBoard,
    consensus: result.consensus,
    disagreements: result.disagreements,
    decisionTree: result.decisionTree,
    recommendation: buildRecommendationSummary(result),
  });
});

// Simple, transparent heuristic — not another AI call — that ranks futures by a
// blended score so the report can offer a starting point, framed as a suggestion.
function buildRecommendationSummary(result) {
  const scored = result.futures.map((f) => {
    const m = f.metrics;
    const score =
      m.happiness * 0.25 +
      m.financialStability * 0.2 +
      m.careerSatisfaction * 0.2 +
      m.learning * 0.15 +
      m.freedom * 0.1 +
      (100 - f.riskLevel) * 0.1;
    return { id: f.id, title: f.title, score: Math.round(score) };
  });
  scored.sort((a, b) => b.score - a.score);
  const top = scored[0];
  return {
    topFuture: top,
    ranking: scored,
    note:
      "This ranking is a simple weighted heuristic across the simulated metrics, " +
      "not a certainty — use it as one input alongside the qualitative reasoning above.",
  };
}
