import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { EXPERT_META } from "../../utils/constants.js";

export default function ExpertCard({ entry, index = 0 }) {
  const meta = EXPERT_META[entry.expert] || { icon: "User", color: "#6C8CFF" };
  const Icon = Icons[meta.icon] || Icons.User;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${meta.color}22` }}
        >
          <Icon size={18} style={{ color: meta.color }} />
        </div>
        <div>
          <h4 className="text-sm font-semibold">{entry.expert}</h4>
          <p className="text-xs text-muted">{entry.role}</p>
        </div>
      </div>

      <p className="text-sm mb-4 leading-relaxed">{entry.stance}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs font-medium text-emerald-300 flex items-center gap-1.5 mb-2">
            <ThumbsUp size={12} /> Pros
          </p>
          <ul className="space-y-1.5">
            {entry.pros.map((p, i) => (
              <li key={i} className="text-xs text-muted leading-relaxed">
                • {p}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-rose-300 flex items-center gap-1.5 mb-2">
            <ThumbsDown size={12} /> Concerns
          </p>
          <ul className="space-y-1.5">
            {entry.concerns.map((c, i) => (
              <li key={i} className="text-xs text-muted leading-relaxed">
                • {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-4 border-t border-white/[0.06]">
        <p className="text-xs text-muted mb-1">Advice</p>
        <p className="text-sm">{entry.advice}</p>
      </div>
    </motion.div>
  );
}
