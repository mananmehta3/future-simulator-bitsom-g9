// Zero-cost, offline "simulation engine" used when AI_PROVIDER=mock. It never calls
// any paid API — instead it pattern-matches the decision text against a set of
// common life-decision categories (MBA, quitting a job, moving abroad, a
// startup, a career switch, UPSC/civil-service prep, a higher-paying job, a
// master's degree) and generates schema-shaped output from hand-tuned rules
// and the user's own profile numbers. Output shape matches exactly what
// simulation.schema.js expects from a real AI call, so nothing downstream
// (validation, styling, DB persistence, the whole client) needs to know or
// care which engine produced it.

const SKILL_POOL_DEFAULT = [
  "Adaptability",
  "Stakeholder communication",
  "Financial planning",
  "Time management",
  "Resilience under uncertainty",
  "Self-directed learning",
];

// Each category has 4 "slots" (A: pursue the change, B: status quo, C: middle
// ground, D: high-risk alternative) — matching the same A-D framing the real
// prompt asks Claude for. `curve` is a relative salary multiplier per
// checkpoint year (index-aligned to [1,3,5,10,15,20], sliced to the horizon).
const CATEGORIES = [
  {
    id: "mba",
    match: [/\bmba\b/i, /business school/i, /master.?s?\s+(in|of)\s+business/i],
    skillsPool: ["Strategic leadership", "Financial modeling", "Case-based problem solving", "Cross-functional negotiation", "Executive presence", "Applied case learning"],
    slots: {
      A: { title: "Take the MBA", archetype: "The MBA Path", action: "pursue the MBA full-time", theme: "credentialing and network access", risk: 55, prob: 62, curve: [1, 1.02, 1.15, 1.55, 2.0, 2.4] },
      B: { title: "Stay in current role", archetype: "Status Quo", action: "stay in your current role", theme: "market demand and steady tenure", risk: 22, prob: 74, curve: [1, 1.05, 1.14, 1.3, 1.5, 1.7] },
      C: { title: "Part-time or executive MBA", archetype: "Middle Ground", action: "pursue a part-time MBA while working", theme: "gradual credentialing without pausing income", risk: 38, prob: 68, curve: [1, 1.03, 1.2, 1.5, 1.8, 2.1] },
      D: { title: "Skip the degree, bet on a startup instead", archetype: "High-Risk Leap", action: "skip the degree and join or start a startup instead", theme: "equity upside against real market risk", risk: 80, prob: 40, curve: [1, 0.8, 1.1, 1.9, 2.8, 3.5] },
    },
  },
  {
    id: "quit_job",
    match: [/quit.*job/i, /leave.*job/i, /\bresign/i, /quit.{0,15}work/i],
    skillsPool: ["Financial runway planning", "Self-direction", "Negotiation", "Networking", "Personal branding", "Risk assessment"],
    slots: {
      A: { title: "Quit and take the leap", archetype: "The Clean Break", action: "quit your job to pursue this decision fully", theme: "a decisive break from your current role", risk: 60, prob: 58, curve: [1, 0.85, 1.1, 1.6, 2.0, 2.4] },
      B: { title: "Stay and transition gradually", archetype: "Status Quo", action: "stay employed while transitioning gradually", theme: "keeping income steady during the shift", risk: 25, prob: 76, curve: [1, 1.05, 1.15, 1.35, 1.55, 1.75] },
      C: { title: "Negotiate a sabbatical or reduced hours", archetype: "Middle Ground", action: "negotiate a sabbatical or reduced hours first", theme: "testing the change with a safety net", risk: 35, prob: 70, curve: [1, 0.95, 1.15, 1.45, 1.7, 1.95] },
      D: { title: "Quit with no fallback plan", archetype: "High-Risk Leap", action: "quit with no fallback plan and figure it out along the way", theme: "maximum flexibility but no financial cushion", risk: 82, prob: 38, curve: [1, 0.7, 1.0, 1.7, 2.3, 2.9] },
    },
  },
  {
    id: "move_abroad",
    match: [/move abroad/i, /relocat/i, /emigrat/i, /immigrat/i, /move to (a |another )?(different |)country/i],
    skillsPool: ["Cross-cultural adaptability", "Language acquisition", "Global networking", "Regulatory navigation", "Independence", "Logistics planning"],
    slots: {
      A: { title: "Relocate abroad", archetype: "The Relocation Path", action: "move abroad for this opportunity", theme: "a new labor market and cost of living", risk: 62, prob: 55, curve: [1, 1.1, 1.3, 1.7, 2.1, 2.5] },
      B: { title: "Stay in your home country", archetype: "Status Quo", action: "stay in your home country", theme: "familiar systems and existing networks", risk: 20, prob: 78, curve: [1, 1.05, 1.15, 1.35, 1.55, 1.75] },
      C: { title: "Try a short-term or remote arrangement first", archetype: "Middle Ground", action: "try a short-term international assignment or remote arrangement first", theme: "testing the move before committing fully", risk: 35, prob: 68, curve: [1, 1.05, 1.2, 1.5, 1.8, 2.1] },
      D: { title: "Move abroad with no job lined up", archetype: "High-Risk Leap", action: "move abroad without a job lined up first", theme: "full immersion with no income safety net", risk: 85, prob: 34, curve: [1, 0.75, 1.15, 1.6, 2.0, 2.4] },
    },
  },
  {
    id: "startup",
    match: [/startup/i, /start (a |my own |)(company|business)/i, /found a company/i, /entrepreneur/i],
    skillsPool: ["Resourcefulness", "Rapid execution", "Fundraising basics", "Product intuition", "Sales", "Team building"],
    slots: {
      A: { title: "Start the startup", archetype: "The Founder Path", action: "start the startup", theme: "equity upside against high failure rates", risk: 78, prob: 42, curve: [1, 0.6, 1.0, 2.2, 3.5, 5.0] },
      B: { title: "Stay employed", archetype: "Status Quo", action: "stay employed at your current job", theme: "predictable salary and benefits", risk: 20, prob: 78, curve: [1, 1.05, 1.15, 1.35, 1.55, 1.75] },
      C: { title: "Build it as a side project first", archetype: "Middle Ground", action: "build the idea as a side project before going full-time", theme: "validating demand before quitting", risk: 40, prob: 66, curve: [1, 1.0, 1.15, 1.5, 1.9, 2.3] },
      D: { title: "Raise funding and go all-in immediately", archetype: "High-Risk Leap", action: "raise venture funding and go all-in immediately", theme: "outside capital, faster growth, higher pressure", risk: 88, prob: 30, curve: [1, 0.5, 1.2, 2.8, 4.5, 6.5] },
    },
  },
  {
    id: "career_switch",
    match: [/switch career/i, /career change/i, /change career/i, /pivot (my |to a |)career/i, /new industry/i],
    skillsPool: ["Rapid upskilling", "Transferable-skill framing", "Networking into a new field", "Humility under a learning curve", "Portfolio building", "Interview storytelling"],
    slots: {
      A: { title: "Switch careers", archetype: "The Pivot", action: "switch into a new career field", theme: "retraining and rebuilding credibility in a new domain", risk: 58, prob: 60, curve: [1, 0.85, 1.1, 1.55, 1.95, 2.3] },
      B: { title: "Stay in your current field", archetype: "Status Quo", action: "stay in your current career field", theme: "existing expertise and seniority", risk: 20, prob: 78, curve: [1, 1.05, 1.15, 1.35, 1.55, 1.75] },
      C: { title: "Transition via an adjacent role first", archetype: "Middle Ground", action: "move into an adjacent role that bridges toward the new field", theme: "a gradual bridge into the new domain", risk: 38, prob: 68, curve: [1, 1.0, 1.2, 1.55, 1.85, 2.15] },
      D: { title: "Switch with no transferable experience", archetype: "High-Risk Leap", action: "switch fields with little directly transferable experience", theme: "starting closer to the bottom in a new domain", risk: 80, prob: 36, curve: [1, 0.7, 1.0, 1.5, 1.9, 2.3] },
    },
  },
  {
    id: "upsc",
    match: [/\bupsc\b/i, /civil services?\b/i, /\bias\b/i, /civil service exam/i],
    skillsPool: ["Disciplined self-study", "Current affairs mastery", "Long-horizon persistence", "Written analysis", "Interview composure", "Time-boxed preparation"],
    slots: {
      A: { title: "Prepare full-time for UPSC", archetype: "The Civil Services Path", action: "prepare full-time for the UPSC exams", theme: "a long, competitive preparation cycle for public service", risk: 70, prob: 35, curve: [1, 0.4, 0.4, 1.6, 2.0, 2.3] },
      B: { title: "Continue your current career", archetype: "Status Quo", action: "continue in your current career", theme: "steady private-sector progression", risk: 20, prob: 78, curve: [1, 1.05, 1.15, 1.35, 1.55, 1.75] },
      C: { title: "Prepare part-time while working", archetype: "Middle Ground", action: "prepare for UPSC part-time while continuing to work", theme: "balancing preparation with income stability", risk: 45, prob: 55, curve: [1, 0.95, 1.0, 1.4, 1.7, 2.0] },
      D: { title: "Attempt UPSC with no backup plan", archetype: "High-Risk Leap", action: "commit to UPSC attempts with no backup career plan", theme: "full commitment with limited fallback options", risk: 85, prob: 25, curve: [1, 0.3, 0.3, 1.3, 1.7, 2.0] },
    },
  },
  {
    id: "higher_paying_job",
    match: [/higher.?paying job/i, /new job.{0,20}(higher|more) (pay|salary)/i, /job offer/i, /switch (companies|jobs)/i, /change jobs/i],
    skillsPool: ["Negotiation", "Fast onboarding", "Adaptability to new culture", "Stakeholder mapping", "Relationship rebuilding", "Portfolio articulation"],
    slots: {
      A: { title: "Take the higher-paying job", archetype: "The Compensation Jump", action: "take the higher-paying job offer", theme: "an immediate compensation jump in a new environment", risk: 45, prob: 68, curve: [1, 1.25, 1.4, 1.7, 2.0, 2.3] },
      B: { title: "Stay in your current role", archetype: "Status Quo", action: "stay in your current role", theme: "familiar environment and steady progression", risk: 18, prob: 78, curve: [1, 1.05, 1.15, 1.35, 1.55, 1.75] },
      C: { title: "Use the offer to negotiate where you are", archetype: "Middle Ground", action: "use the offer to negotiate a raise or promotion at your current company", theme: "capturing some upside without changing environments", risk: 30, prob: 66, curve: [1, 1.15, 1.25, 1.45, 1.65, 1.85] },
      D: { title: "Take the job and relocate for an even bigger jump", archetype: "High-Risk Leap", action: "take the job and relocate for an even larger compensation jump", theme: "maximum short-term upside with the most disruption", risk: 68, prob: 48, curve: [1, 1.4, 1.6, 2.0, 2.4, 2.8] },
    },
  },
  {
    id: "masters_degree",
    match: [/master.?s degree/i, /grad(uate)? school/i, /pursue a master/i, /m\.?s\.?\s+(in|degree)/i],
    skillsPool: ["Research methods", "Technical depth", "Academic writing", "Specialized tooling", "Independent study", "Publication / thesis work"],
    slots: {
      A: { title: "Pursue the Master's degree", archetype: "The Graduate Path", action: "pursue the master's degree", theme: "specialized credentialing in your field", risk: 50, prob: 65, curve: [1, 0.85, 1.05, 1.5, 1.85, 2.15] },
      B: { title: "Stay in the workforce", archetype: "Status Quo", action: "stay in the workforce without further formal education", theme: "continued on-the-job experience", risk: 20, prob: 78, curve: [1, 1.05, 1.15, 1.35, 1.55, 1.75] },
      C: { title: "Pursue it part-time or online", archetype: "Middle Ground", action: "pursue the degree part-time or online while working", theme: "gradual credentialing without pausing income", risk: 32, prob: 70, curve: [1, 1.0, 1.15, 1.5, 1.8, 2.1] },
      D: { title: "Pursue a funded PhD instead", archetype: "High-Risk Leap", action: "pursue a fully-funded PhD track instead of a terminal master's", theme: "a longer, higher-risk academic and research path", risk: 75, prob: 32, curve: [1, 0.5, 0.5, 1.4, 2.2, 2.8] },
    },
  },
  {
    // Always matches — used when the decision text doesn't hit a more specific category.
    id: "generic",
    match: [/.*/],
    skillsPool: SKILL_POOL_DEFAULT,
    slots: {
      A: { title: "Pursue this decision", archetype: "The Direct Path", action: "go ahead with this decision", theme: "the direct outcome of the change you're weighing", risk: 55, prob: 60, curve: [1, 1.05, 1.2, 1.5, 1.8, 2.1] },
      B: { title: "Stay on your current path", archetype: "Status Quo", action: "stay on your current path without making this change", theme: "stability and the status quo", risk: 20, prob: 76, curve: [1, 1.05, 1.15, 1.35, 1.55, 1.75] },
      C: { title: "Take a phased, middle-ground approach", archetype: "Middle Ground", action: "take a phased or middle-ground approach", theme: "de-risking the decision with a gradual rollout", risk: 35, prob: 68, curve: [1, 1.0, 1.15, 1.45, 1.7, 2.0] },
      D: { title: "Go all-in on the boldest version", archetype: "High-Risk Leap", action: "go all-in on the boldest version of this decision", theme: "maximum upside with maximum uncertainty", risk: 80, prob: 38, curve: [1, 0.8, 1.2, 1.9, 2.5, 3.1] },
    },
  },
];

function classifyDecision(decisionText) {
  const text = decisionText || "";
  for (const category of CATEGORIES) {
    if (category.id === "generic") continue;
    if (category.match.some((re) => re.test(text))) return category;
  }
  return CATEGORIES[CATEGORIES.length - 1]; // generic fallback
}

// ---- What-if adjustments -----------------------------------------------
// Mutates a working copy of the 4 slots based on any flags the client sent,
// so "regenerate with changes" visibly moves the numbers even offline.
function applyWhatIf(slots, whatIf) {
  const notes = [];
  if (!whatIf) return notes;

  if (whatIf.salaryIncreasePercent) {
    const pct = Number(whatIf.salaryIncreasePercent) || 0;
    if (pct) {
      const factor = 1 + pct / 100;
      for (const key of Object.keys(slots)) {
        slots[key].curve = slots[key].curve.map((v) => v * factor);
      }
      notes.push(`A ${pct}% salary increase was factored into every path's projection.`);
    }
  }
  if (whatIf.scholarship) {
    slots.A.prob = Math.min(95, slots.A.prob + 12);
    slots.A.risk = Math.max(5, slots.A.risk - 15);
    notes.push("Securing a scholarship/funding meaningfully de-risks the main path.");
  }
  if (whatIf.recession) {
    for (const key of Object.keys(slots)) {
      slots[key].curve = slots[key].curve.map((v) => v * 0.85);
      slots[key].risk = Math.min(95, slots[key].risk + 10);
      slots[key].prob = Math.max(10, slots[key].prob - 8);
    }
    notes.push("An economic recession was modeled as dampening growth and raising risk across every path.");
  }
  if (whatIf.startupFunding) {
    slots.D.prob = Math.min(95, slots.D.prob + 20);
    slots.D.risk = Math.max(10, slots.D.risk - 20);
    slots.D.curve = slots.D.curve.map((v) => v * 1.3);
    notes.push("Secured startup funding substantially improves the high-risk path's odds.");
  }
  if (whatIf.promotion) {
    slots.B.prob = Math.min(95, slots.B.prob + 10);
    slots.B.curve = slots.B.curve.map((v) => v * 1.15);
    notes.push("A promotion in the status-quo path raises its trajectory and likelihood of success.");
  }
  if (whatIf.layoff) {
    slots.B.prob = Math.max(10, slots.B.prob - 25);
    slots.B.risk = Math.min(95, slots.B.risk + 30);
    slots.B.curve = slots.B.curve.map((v) => v * 0.6);
    notes.push("A layoff scenario was modeled as sharply undermining the status-quo path.");
  }
  if (whatIf.marriage) {
    notes.push("A marriage/partnership was factored into personal-life and stability considerations.");
  }
  if (whatIf.moveCountry) {
    notes.push(`Relocating to ${whatIf.moveCountry} was factored into the cost-of-living and network assumptions.`);
  }
  return notes;
}

// ---- Sentence templating -------------------------------------------------

function summaryFor(slot) {
  const riskPhrase = slot.risk >= 65 ? "carries meaningfully elevated risk" : slot.risk <= 30 ? "is comparatively low-risk" : "sits at a moderate risk level";
  return `A plausible path where you ${slot.action}. Outcomes here are likely shaped by ${slot.theme}, and this route ${riskPhrase} relative to the alternatives.`;
}

function rippleEffectsFor(slot) {
  const stress = slot.risk >= 60 ? "raises short-term stress and uncertainty" : "keeps short-term stress relatively contained";
  const direction = slot.curve[slot.curve.length - 1] >= 1.8 ? "meaningfully upward" : "modestly upward";
  const outlook = slot.prob >= 60 ? "favorable" : "mixed";
  return [
    `Choosing to ${slot.action} triggers an initial shift in ${slot.theme.split(" and ")[0]} and daily routine.`,
    `That shift likely ${stress} in the near term.`,
    `Over the following year or two, this reasonably reshapes your financial trajectory ${direction}.`,
    `Changes in income and routine plausibly ripple into personal relationships and available free time.`,
    `As the path matures, it likely reshapes your professional network and the opportunities that reach you.`,
    `By the end of the horizon, these compounding effects reasonably settle into a ${outlook} long-term trajectory.`,
  ];
}

function metricsFor(slot) {
  const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
  return {
    happiness: clamp(70 - slot.risk * 0.15 + slot.prob * 0.1),
    stress: clamp(30 + slot.risk * 0.5),
    financialStability: clamp(85 - slot.risk * 0.6),
    careerSatisfaction: clamp(45 + slot.prob * 0.4),
    learning: clamp(40 + slot.risk * 0.35),
    freedom: clamp(75 - slot.risk * 0.35),
    networkStrength: clamp(45 + slot.prob * 0.3 + slot.risk * 0.1),
  };
}

const PHASE_LABELS = ["Getting started", "Building momentum", "Establishing footing", "Compounding gains", "Reaching maturity", "Long-term trajectory"];

function timelineFor(slot, checkpoints, currency, baseSalary) {
  return checkpoints.map((year, i) => {
    const salary = Math.round((baseSalary * slot.curve[Math.min(i, slot.curve.length - 1)]) / 100) * 100;
    return {
      year,
      phase: PHASE_LABELS[Math.min(i, PHASE_LABELS.length - 1)],
      description: `By year ${year}, having chosen to ${slot.action}, you are reasonably expected to be earning around ${currency} ${salary.toLocaleString()} with outcomes shaped by ${slot.theme}.`,
      milestones: i === 0
        ? ["Initial adjustment period", "First measurable outcomes"]
        : ["Continued progress", "Reassessment checkpoint"],
    };
  });
}

function salaryProjectionFor(slot, checkpoints, baseSalary) {
  return checkpoints.map((year, i) => ({
    year,
    salary: Math.round((baseSalary * slot.curve[Math.min(i, slot.curve.length - 1)]) / 100) * 100,
  }));
}

function buildFuture(slotKey, slot, category, checkpoints, profile) {
  const currency = profile.currency || "INR";
  const baseSalary = profile.salary || 500000;
  const skills = category.skillsPool.slice(0, 4);

  return {
    id: slotKey,
    title: slot.title,
    archetype: slot.archetype,
    summary: summaryFor(slot),
    probabilityOfSuccess: slot.prob,
    riskLevel: slot.risk,
    timeline: timelineFor(slot, checkpoints, currency, baseSalary),
    metrics: metricsFor(slot),
    salaryProjection: salaryProjectionFor(slot, checkpoints, baseSalary),
    skillsAcquired: skills,
    networkGrowth: `Your network is reasonably expected to grow through channels tied to ${slot.theme}, at a pace proportional to how much this path pushes you outside your current circle.`,
    personalLifeImpact: slot.risk >= 55
      ? "Personal relationships may need conscious investment given the disruption and time demands of this path."
      : "Personal relationships are reasonably likely to stay stable, with only modest adjustment needed.",
    healthImpact: slot.risk >= 55
      ? "Stress is likely elevated, particularly in the early phase, with recovery expected as the new routine stabilizes."
      : "Health and stress levels are reasonably likely to stay close to your current baseline.",
    financialOutlook: slot.curve[slot.curve.length - 1] >= 1.8
      ? "Reasonably expected to compound into a materially stronger financial position by the end of the horizon."
      : "Reasonably expected to track close to your current financial trajectory, with modest steady gains.",
    keyAssumptions: [
      "No major unforeseen health or family event",
      `Economic conditions remain broadly stable over the ${checkpoints[checkpoints.length - 1]}-year horizon`,
      "Consistent personal effort applied toward this path",
    ],
    possibleRegrets: [
      slot.risk >= 55
        ? "Could regret the short-term disruption if the expected upside takes longer than planned to materialize."
        : "Could regret not taking a bigger swing if a bolder alternative would have paid off.",
    ],
    unexpectedOpportunities: [
      `An unplanned connection or opportunity tied to ${slot.theme} could plausibly accelerate this path faster than expected.`,
    ],
    potentialSetbacks: [
      slot.risk >= 55
        ? "A slower market or a setback specific to this path could delay expected gains by a year or more."
        : "Slower-than-expected progress could mean gains arrive later than the projection suggests.",
    ],
    biggestRisk: slot.risk >= 55
      ? `Overcommitting to ${slot.action} without a fallback plan if it doesn't pan out as expected.`
      : `Under-investing in growth and missing the upside a bolder path could have offered.`,
    biggestReward: slot.prob >= 60
      ? `A reasonably strong chance of compounding gains from choosing to ${slot.action}.`
      : `If it works out, choosing to ${slot.action} could plausibly deliver outsized long-term upside.`,
    rippleEffects: rippleEffectsFor(slot),
  };
}

function buildAiBoard(category, slots, decision) {
  const a = slots.A;
  const b = slots.B;
  return [
    {
      expert: "Career Coach",
      role: "Optimistic, growth-oriented",
      stance: `This is likely a meaningful growth opportunity — choosing to ${a.action} reasonably expands your options over time.`,
      pros: [`Signals ambition and initiative`, `Likely broadens your long-term options`],
      concerns: [`Timing relative to the current market for ${category.id.replace(/_/g, " ")}`],
      advice: `Move forward if your financial runway comfortably covers the adjustment period.`,
    },
    {
      expert: "Finance Expert",
      role: "Risk and ROI focused",
      stance: a.risk >= 55
        ? `The financial risk here is real — model your runway carefully before committing.`
        : `The financial profile of this path is reasonably favorable if approached deliberately.`,
      pros: [`Potential for stronger long-term earning trajectory`],
      concerns: [`Opportunity cost relative to staying on the status-quo path`],
      advice: `Build a 12-24 month financial buffer before committing fully.`,
    },
    {
      expert: "Psychologist",
      role: "Personal wellbeing focused",
      stance: a.risk >= 55
        ? `Stress will likely spike during the transition but is manageable with deliberate support.`
        : `This path is unlikely to significantly disrupt your day-to-day wellbeing.`,
      pros: [`Builds resilience and adaptability over time`],
      concerns: [`Risk of burnout if boundaries aren't set during the adjustment period`],
      advice: `Set explicit recovery time each week, especially in the first year.`,
    },
    {
      expert: "Entrepreneur",
      role: "Opportunity and upside focused",
      stance: `The upside of choosing to ${a.action} is likely underrated if you can tolerate the variance involved.`,
      pros: [`Optionality and compounding network effects`],
      concerns: [`Survivorship bias — visible success stories aren't the full distribution of outcomes`],
      advice: `Where possible, keep a small, reversible first step before going all-in.`,
    },
    {
      expert: "Recruiter",
      role: "Market demand and hireability focused",
      stance: `Market demand for this kind of move is currently moderate to strong, though it varies by industry and location.`,
      pros: [`Signals initiative to future employers`],
      concerns: [`Some employers may discount the change without directly relevant prior experience`],
      advice: `Target roles or programs that explicitly value the transferable skills this path builds.`,
    },
  ];
}

function buildDecisionTree(decision, slots) {
  return {
    label: decision,
    detail: "",
    children: Object.entries(slots).map(([key, slot]) => ({
      label: slot.title,
      detail: `${slot.archetype} — ~${slot.prob}% likely success, risk ${slot.risk}/100`,
      children: [
        {
          label: `Short-term: ${slot.risk >= 55 ? "an adjustment period with real disruption" : "a relatively smooth transition"}`,
          detail: "",
          children: [
            {
              label: `Long-term: ${slot.curve[slot.curve.length - 1] >= 1.8 ? "meaningfully compounded financial and career growth" : "steady, moderate growth"}`,
              detail: "",
              children: [],
            },
          ],
        },
      ],
    })),
  };
}

export function buildMockSimulation({ decision, horizonYears, profile, whatIf, checkpoints }) {
  const category = classifyDecision(decision);

  // Deep-clone the slot config so what-if mutations never leak into the shared templates.
  const slots = JSON.parse(JSON.stringify(category.slots));
  const whatIfNotes = applyWhatIf(slots, whatIf);

  const futures = Object.entries(slots).map(([key, slot]) => buildFuture(key, slot, category, checkpoints, profile));
  const aiBoard = buildAiBoard(category, slots, decision);
  const decisionTree = buildDecisionTree(decision, slots);

  const consensusBase = `The experts broadly agree this is a ${slots.A.risk >= 55 ? "moderately risky" : "reasonably manageable"} decision, and that maintaining a financial buffer and protecting personal wellbeing matter regardless of which path you take.`;
  const consensus = whatIfNotes.length ? `${consensusBase} ${whatIfNotes.join(" ")}` : consensusBase;

  return {
    futures,
    aiBoard,
    consensus,
    disagreements: [
      "The Finance Expert is more cautious about timing and runway than the Entrepreneur.",
      "The Psychologist weighs short-term wellbeing more heavily than the Career Coach weighs long-term growth.",
    ],
    decisionTree,
  };
}
