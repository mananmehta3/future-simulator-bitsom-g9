import { prisma } from "../services/db.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

// GET /api/history — lightweight list for the "recent simulations" sidebar/page.
export const listHistory = asyncHandler(async (req, res) => {
  const rows = await prisma.simulation.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, decision: true, horizonYears: true, createdAt: true, parentId: true },
  });
  res.json(rows);
});

// GET /api/history/:id — full stored simulation, reconstructed for the client.
export const getHistoryItem = asyncHandler(async (req, res) => {
  const row = await prisma.simulation.findUnique({ where: { id: req.params.id } });
  if (!row) throw new AppError("Simulation not found.", 404);

  res.json({
    id: row.id,
    createdAt: row.createdAt,
    decision: row.decision,
    horizonYears: row.horizonYears,
    profile: JSON.parse(row.profile),
    whatIf: row.whatIf ? JSON.parse(row.whatIf) : null,
    parentId: row.parentId,
    ...JSON.parse(row.result),
  });
});
