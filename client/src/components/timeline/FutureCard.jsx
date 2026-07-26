import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, TrendingUp, ShieldAlert } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

export default function FutureCard({ future, index = 0 }) {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      onClick={() => navigate(`/results/future/${future.id}`)}
      className="glass rounded-2xl p-6 text-left hover:bg-white/[0.06] transition-colors group relative overflow-hidden"
    >
      <div
        className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
        style={{ backgroundColor: future.color }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `${future.color}22`, color: future.color }}
          >
            Future {future.id} · {future.archetype}
          </span>
          <ArrowUpRight
            size={16}
            className="text-muted group-hover:text-current group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
          />
        </div>

        <h3 className="text-lg font-semibold mb-2 leading-snug">{future.title}</h3>
        <p className="text-sm text-muted leading-relaxed line-clamp-3 mb-4">{future.summary}</p>

        <div className="h-14 -mx-1 mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={future.salaryProjection}>
              <defs>
                <linearGradient id={`spark-${future.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={future.color} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={future.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="salary"
                stroke={future.color}
                strokeWidth={2}
                fill={`url(#spark-${future.id})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1">
            <TrendingUp size={13} /> ~{future.probabilityOfSuccess}% success
          </span>
          <span className="flex items-center gap-1">
            <ShieldAlert size={13} /> Risk {future.riskLevel}/100
          </span>
        </div>
      </div>
    </motion.button>
  );
}
