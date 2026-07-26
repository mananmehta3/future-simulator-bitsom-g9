import { generateStructuredJSON as generateWithClaude } from "./claude.service.js";
import { generateStructuredJSON as generateWithGemini } from "./gemini.service.js";
import { buildMockSimulation } from "./mockRules.service.js";
import { simulationResultSchema } from "../models/simulation.schema.js";
import { AppError } from "../utils/AppError.js";
import { FUTURE_STYLES, checkpointsFor } from "../utils/futureStyles.js";

export { FUTURE_STYLES };

function buildSystemPrompt() {
  return `You are the reasoning engine behind "Future Simulator", an interactive tool that
helps people explore plausible life paths after a major decision. You are NOT a chatbot
and you never talk directly to the user — you only emit structured JSON that a UI renders
into timelines, charts, and cards.

CORE PRINCIPLES:
1. You never predict the future with certainty. You reason probabilistically, using
   phrases like "likely", "reasonably expected", "may", "could plausibly" instead of "will".
2. Ground every projection in general, well-established patterns: career progression norms,
   education ROI, industry growth trends, economic assumptions, and human behavioural
   tendencies. Do not fabricate specific companies, named people, or invented statistics.
3. Reason in CHAINS for ripple effects — each step should plausibly cause the next
   (decision -> immediate effect -> secondary effect -> long-term effect), not a list of
   unrelated facts.
4. Be specific to the user's actual profile (age, country, salary, risk appetite, values,
   dependents, etc.) rather than generic advice.
5. Numeric fields (0-100 scales) must be integers and internally consistent with the prose
   you write (e.g. a future you describe as "high stress" should have stress >= 65).
6. Output ONLY valid JSON matching the schema described by the user message. No markdown
   fences, no commentary outside the JSON object.`;
}

function buildUserPrompt({ decision, horizonYears, profile, whatIf, checkpoints }) {
  const valuesList = profile.values.join(", ");
  const whatIfBlock = whatIf && Object.keys(whatIf).length
    ? `\nWHAT-IF ADJUSTMENTS to apply on top of the base profile (the user is exploring a
hypothetical variation — regenerate all futures taking these into account):
${JSON.stringify(whatIf, null, 2)}`
    : "";

  return `USER PROFILE:
- Age: ${profile.age}
- Location: ${profile.city}, ${profile.country}
- Education: ${profile.education}
- Current profession: ${profile.profession}
- Current salary: ${profile.salary} ${profile.currency}/year
- Years of experience: ${profile.yearsExperience}
- Savings: ${profile.savings} ${profile.currency}
- Relationship status: ${profile.relationshipStatus}
- Dependents: ${profile.dependents}
- Risk appetite: ${profile.riskAppetite}
- Career goal: ${profile.careerGoal}
- Core values (in priority order): ${valuesList}
${whatIfBlock}

DECISION THE USER IS WEIGHING:
"${decision}"

SIMULATION HORIZON: ${horizonYears} years. Use exactly these checkpoint years for both
"timeline" and "salaryProjection" arrays in every future: ${checkpoints.join(", ")}.

TASK: Generate exactly 4 distinct futures:
  - Future A: pursue the main path implied by the decision (e.g. take the MBA / quit the job).
  - Future B: stay on the current path / status quo, no major change.
  - Future C: a plausible alternative path the user may not have considered (a middle ground
    or adjacent option).
  - Future D: a higher-risk, higher-variance alternative.

Return a single JSON object with this exact shape:
{
  "futures": [
    {
      "id": "A",
      "title": "short punchy title (e.g. 'The MBA Leap')",
      "archetype": "one short phrase categorizing this path",
      "summary": "2-3 sentence overview using probabilistic language",
      "probabilityOfSuccess": 0-100 integer,
      "riskLevel": 0-100 integer,
      "timeline": [
        { "year": <checkpoint year>, "phase": "short phase label", "description": "1-2 sentences",
          "milestones": ["short milestone", "..."] }
        // one entry per checkpoint year, in order
      ],
      "metrics": {
        "happiness": 0-100, "stress": 0-100, "financialStability": 0-100,
        "careerSatisfaction": 0-100, "learning": 0-100, "freedom": 0-100,
        "networkStrength": 0-100
      },
      "salaryProjection": [
        { "year": <checkpoint year>, "salary": <projected annual salary in ${profile.currency}> }
        // one entry per checkpoint year, in order, monotonically plausible
      ],
      "skillsAcquired": ["skill", "..."],
      "networkGrowth": "1-2 sentences on how their professional network likely evolves",
      "personalLifeImpact": "1-2 sentences",
      "healthImpact": "1-2 sentences",
      "financialOutlook": "1-2 sentences",
      "keyAssumptions": ["assumption", "..."],
      "possibleRegrets": ["regret", "..."],
      "unexpectedOpportunities": ["opportunity", "..."],
      "potentialSetbacks": ["setback", "..."],
      "biggestRisk": "1 sentence",
      "biggestReward": "1 sentence",
      "rippleEffects": [
        "decision-adjacent first-order effect",
        "second-order effect that plausibly follows from the first",
        "third-order effect that follows from the second",
        "... continue the causal chain for 5-8 total steps ending on a long-term outcome"
      ]
    }
    // exactly 4 futures total, ids "A","B","C","D"
  ],
  "aiBoard": [
    {
      "expert": "Career Coach", "role": "Optimistic, growth-oriented",
      "stance": "1 sentence overall take",
      "pros": ["point", "..."], "concerns": ["point", "..."],
      "advice": "1-2 sentences of direct advice"
    },
    { "expert": "Finance Expert", "role": "Risk and ROI focused", ... same shape ... },
    { "expert": "Psychologist", "role": "Personal wellbeing focused", ... same shape ... },
    { "expert": "Entrepreneur", "role": "Opportunity and upside focused", ... same shape ... },
    { "expert": "Recruiter", "role": "Market demand and hireability focused", ... same shape ... }
  ],
  "consensus": "2-3 sentences on where the experts broadly agree",
  "disagreements": ["1 sentence describing a specific point of disagreement", "..."],
  "decisionTree": {
    "label": "the core decision, phrased as the user's choice",
    "detail": "",
    "children": [
      {
        "label": "a possible immediate outcome",
        "detail": "1 short sentence",
        "children": [
          {
            "label": "a secondary outcome following from the immediate one",
            "detail": "1 short sentence",
            "children": [
              { "label": "a long-term outcome", "detail": "1 short sentence", "children": [] }
            ]
          }
        ]
      }
      // 3-4 top-level branches covering the range of futures above
    ]
  }
}

Remember: probabilistic language only, no false certainty, and keep the JSON strictly valid.`;
}

const VALID_PROVIDERS = ["mock", "gemini", "claude"];

// Which engine generates simulations: "mock" (free, offline, template-based —
// see mockRules.service.js), "gemini" (free real AI via Google's free tier —
// see gemini.service.js), or "claude" (paid, highest quality — see claude.service.js).
function resolveProvider() {
  const provider = String(process.env.AI_PROVIDER || "mock").toLowerCase();
  if (!VALID_PROVIDERS.includes(provider)) {
    throw new AppError(
      `Unknown AI_PROVIDER "${provider}" in server/.env — expected "mock", "gemini", or "claude".`,
      500
    );
  }
  return provider;
}

export async function generateFutures({ decision, horizonYears, profile, whatIf }) {
  const checkpoints = checkpointsFor(horizonYears);
  const provider = resolveProvider();

  let raw;
  if (provider === "mock") {
    raw = buildMockSimulation({ decision, horizonYears, profile, whatIf, checkpoints });
  } else {
    const system = buildSystemPrompt();
    const user = buildUserPrompt({ decision, horizonYears, profile, whatIf, checkpoints });
    raw = provider === "gemini"
      ? await generateWithGemini({ system, user })
      : await generateWithClaude({ system, user });
  }

  const parsed = simulationResultSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(
      "The generated simulation didn't match the expected format.",
      502,
      parsed.error.flatten()
    );
  }

  // Attach deterministic visual styling and guarantee stable A-D ids/order.
  const futures = parsed.data.futures.map((future, index) => {
    const style = FUTURE_STYLES[index] || FUTURE_STYLES[FUTURE_STYLES.length - 1];
    return { ...future, id: style.id, color: style.color, gradient: style.gradient };
  });

  return { ...parsed.data, futures, horizonYears, decision, checkpoints };
}
