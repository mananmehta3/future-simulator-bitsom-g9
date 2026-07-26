export const VALUE_OPTIONS = [
  "Money",
  "Freedom",
  "Learning",
  "Impact",
  "Family",
  "Prestige",
  "Adventure",
  "Work-life balance",
  "Health",
];

export const RISK_APPETITES = [
  { value: "low", label: "Low — I prefer stability" },
  { value: "moderate", label: "Moderate — balanced" },
  { value: "high", label: "High — I chase upside" },
];

export const HORIZON_OPTIONS = [5, 10, 20];

export const RELATIONSHIP_OPTIONS = [
  "Single",
  "In a relationship",
  "Married",
  "Divorced",
  "Widowed",
];

export const DEFAULT_PROFILE = {
  age: "",
  country: "India",
  city: "",
  education: "",
  profession: "",
  salary: "",
  currency: "INR",
  yearsExperience: "",
  savings: "",
  relationshipStatus: "Single",
  dependents: 0,
  riskAppetite: "moderate",
  careerGoal: "",
  values: [],
};

export const WHAT_IF_LEVERS = [
  { key: "salaryIncreasePercent", label: "Increase salary", type: "percent", icon: "TrendingUp" },
  { key: "moveCountry", label: "Move country", type: "text", icon: "Globe" },
  { key: "scholarship", label: "Scholarship / funding secured", type: "toggle", icon: "GraduationCap" },
  { key: "marriage", label: "Get married", type: "toggle", icon: "Heart" },
  { key: "recession", label: "Economic recession hits", type: "toggle", icon: "TrendingDown" },
  { key: "startupFunding", label: "Startup gets funded", type: "toggle", icon: "Rocket" },
  { key: "promotion", label: "Get promoted", type: "toggle", icon: "ArrowUpCircle" },
  { key: "layoff", label: "Laid off", type: "toggle", icon: "AlertTriangle" },
];

export const EXPERT_META = {
  "Career Coach": { icon: "Compass", color: "#6C8CFF" },
  "Finance Expert": { icon: "PiggyBank", color: "#4ADE80" },
  "Psychologist": { icon: "Brain", color: "#F472B6" },
  "Entrepreneur": { icon: "Rocket", color: "#FBBF24" },
  "Recruiter": { icon: "Briefcase", color: "#22D3EE" },
};
