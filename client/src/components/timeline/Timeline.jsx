import { motion } from "framer-motion";

export default function Timeline({ points, color = "#6C8CFF" }) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />
      <div className="space-y-6">
        {points.map((p, i) => (
          <motion.div
            key={p.year}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="relative"
          >
            <span
              className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full ring-4"
              style={{ backgroundColor: color, boxShadow: `0 0 0 4px ${color}22` }}
            />
            <p className="text-xs font-semibold" style={{ color }}>
              Year {p.year} · {p.phase}
            </p>
            <p className="text-sm text-muted mt-1 leading-relaxed">{p.description}</p>
            {p.milestones?.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {p.milestones.map((m) => (
                  <li
                    key={m}
                    className="text-[11px] px-2 py-1 rounded-md bg-white/[0.05] border border-white/10 text-muted"
                  >
                    {m}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
