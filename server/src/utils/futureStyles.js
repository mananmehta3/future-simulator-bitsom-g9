// Visual identity per future slot, assigned deterministically on our side so the
// UI stays consistent regardless of which engine (Claude or the offline rules
// engine) produced the content.
export const FUTURE_STYLES = [
  { id: "A", color: "#6C8CFF", gradient: "from-indigo-500 to-blue-500" },
  { id: "B", color: "#4ADE80", gradient: "from-emerald-500 to-teal-500" },
  { id: "C", color: "#FBBF24", gradient: "from-amber-400 to-orange-500" },
  { id: "D", color: "#F472B6", gradient: "from-fuchsia-500 to-pink-500" },
];

export function checkpointsFor(horizonYears) {
  if (horizonYears <= 5) return [1, 3, 5];
  if (horizonYears <= 10) return [1, 3, 5, 10];
  return [1, 3, 5, 10, 15, 20];
}
