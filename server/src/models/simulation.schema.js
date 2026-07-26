import { z } from "zod";

// ---- Request-side validation (what the client sends us) -------------------

export const profileSchema = z.object({
  age: z.coerce.number().int().min(14).max(90),
  country: z.string().min(1),
  city: z.string().min(1),
  education: z.string().min(1),
  profession: z.string().min(1),
  salary: z.coerce.number().min(0),
  currency: z.string().min(1).default("INR"),
  yearsExperience: z.coerce.number().min(0).max(70),
  savings: z.coerce.number().min(0),
  relationshipStatus: z.string().min(1),
  dependents: z.coerce.number().int().min(0).max(20),
  riskAppetite: z.enum(["low", "moderate", "high"]),
  careerGoal: z.string().min(1),
  values: z.array(z.string()).min(1).max(9),
});

export const simulateRequestSchema = z.object({
  decision: z.string().min(5).max(1000),
  horizonYears: z.coerce.number().refine((v) => [5, 10, 20].includes(v), {
    message: "horizonYears must be 5, 10, or 20",
  }),
  profile: profileSchema,
  whatIf: z.record(z.string(), z.any()).optional(),
  parentId: z.string().optional(),
});

// ---- Response-side validation (what we require back from the model) -------

const metricsSchema = z.object({
  happiness: z.coerce.number().min(0).max(100),
  stress: z.coerce.number().min(0).max(100),
  financialStability: z.coerce.number().min(0).max(100),
  careerSatisfaction: z.coerce.number().min(0).max(100),
  learning: z.coerce.number().min(0).max(100),
  freedom: z.coerce.number().min(0).max(100),
  networkStrength: z.coerce.number().min(0).max(100),
});

const timelinePointSchema = z.object({
  year: z.coerce.number(),
  phase: z.string(),
  description: z.string(),
  milestones: z.array(z.string()).default([]),
});

const salaryPointSchema = z.object({
  year: z.coerce.number(),
  salary: z.coerce.number(),
});

export const futureSchema = z.object({
  id: z.string(),
  title: z.string(),
  archetype: z.string(),
  summary: z.string(),
  probabilityOfSuccess: z.coerce.number().min(0).max(100),
  riskLevel: z.coerce.number().min(0).max(100),
  timeline: z.array(timelinePointSchema).min(1),
  metrics: metricsSchema,
  salaryProjection: z.array(salaryPointSchema).min(1),
  skillsAcquired: z.array(z.string()).default([]),
  networkGrowth: z.string(),
  personalLifeImpact: z.string(),
  healthImpact: z.string(),
  financialOutlook: z.string(),
  keyAssumptions: z.array(z.string()).default([]),
  possibleRegrets: z.array(z.string()).default([]),
  unexpectedOpportunities: z.array(z.string()).default([]),
  potentialSetbacks: z.array(z.string()).default([]),
  biggestRisk: z.string(),
  biggestReward: z.string(),
  rippleEffects: z.array(z.string()).min(2),
});

export const aiBoardEntrySchema = z.object({
  expert: z.string(),
  role: z.string(),
  stance: z.string(),
  pros: z.array(z.string()).default([]),
  concerns: z.array(z.string()).default([]),
  advice: z.string(),
});

// Decision tree nodes recurse, so use z.lazy for the children array.
const decisionTreeNodeSchema = z.lazy(() =>
  z.object({
    label: z.string(),
    detail: z.string().optional().default(""),
    children: z.array(decisionTreeNodeSchema).default([]),
  })
);

export const simulationResultSchema = z.object({
  futures: z.array(futureSchema).min(2).max(6),
  aiBoard: z.array(aiBoardEntrySchema).min(1),
  consensus: z.string(),
  disagreements: z.array(z.string()).default([]),
  decisionTree: decisionTreeNodeSchema,
});
