import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export default function RippleEffects({ effects, color = "#6C8CFF" }) {
  return (
    <div className="flex flex-col items-stretch">
      {effects.map((effect, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.35, delay: i * 0.07 }}
        >
          <div
            className="rounded-xl px-4 py-3 text-sm border"
            style={{
              backgroundColor: `${color}0F`,
              borderColor: `${color}33`,
              marginLeft: Math.min(i * 10, 60),
            }}
          >
            {effect}
          </div>
          {i < effects.length - 1 && (
            <div className="flex justify-start py-1" style={{ marginLeft: Math.min(i * 10, 60) + 12 }}>
              <ArrowDown size={14} style={{ color }} className="opacity-50" />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
