import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, LineChart, Users, Sparkles } from "lucide-react";

const STAGES = [
  { icon: Sparkles, text: "Reading your profile and decision..." },
  { icon: GitBranch, text: "Branching four plausible futures..." },
  { icon: LineChart, text: "Projecting salary, stress, and growth curves..." },
  { icon: Users, text: "Convening the AI board of experts..." },
];

export default function SimulatingOverlay({ label = "Simulating your future" }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStage((s) => (s + 1) % STAGES.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  const Current = STAGES[stage].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05060a]/80 backdrop-blur-md">
      <div className="glass-strong rounded-3xl p-10 sm:p-14 w-[90%] max-w-md text-center">
        <div className="relative w-20 h-20 mx-auto mb-8">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-indigo-400/30"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                initial={{ opacity: 0, scale: 0.7, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.7, rotate: 20 }}
                transition={{ duration: 0.35 }}
              >
                <Current size={26} className="text-indigo-200" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2 shimmer-text">{label}</h3>
        <AnimatePresence mode="wait">
          <motion.p
            key={stage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-muted"
          >
            {STAGES[stage].text}
          </motion.p>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-1.5 mt-8">
          {STAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === stage ? "w-6 bg-indigo-400" : "w-1.5 bg-white/15"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
