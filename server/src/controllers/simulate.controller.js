import { prisma } from "../services/db.service.js";
import { generateFutures } from "../services/simulation.service.js";
import { simulateRequestSchema } from "../models/simulation.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

// POST /api/simulate
// Runs a fresh simulation (or a what-if regeneration, when whatIf/parentId are present)
// and persists it so it shows up in history.
export const runSimulation = asyncHandler(async (req, res) => {
  const parsed = simulateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError("Invalid simulation request.", 400, parsed.error.flatten());
  }
  const { decision, horizonYears, profile, whatIf, parentId } = parsed.data;

  const result = await generateFutures({ decision, horizonYears, profile, whatIf });

  const saved = await prisma.simulation.create({
    data: {
      decision,
      horizonYears,
      profile: JSON.stringify(profile),
      whatIf: whatIf ? JSON.stringify(whatIf) : null,
      parentId: parentId || null,
      result: JSON.stringify(result),
    },
  });

  res.status(201).json({
    id: saved.id,
    createdAt: saved.createdAt,
    decision,
    horizonYears,
    profile,
    whatIf: whatIf || null,
    parentId: parentId || null,
    ...result,
  });
});
