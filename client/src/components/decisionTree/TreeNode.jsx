import { motion } from "framer-motion";

const DEPTH_COLORS = ["#6C8CFF", "#4ADE80", "#FBBF24", "#F472B6"];

export default function TreeNode({ node, depth = 0 }) {
  const color = DEPTH_COLORS[depth % DEPTH_COLORS.length];
  const hasChildren = node.children?.length > 0;

  return (
    <div className={depth > 0 ? "relative pl-8 mt-3" : ""}>
      {depth > 0 && (
        <>
          <span className="absolute left-0 top-0 bottom-0 w-px bg-white/10" />
          <span className="absolute left-0 top-5 w-6 h-px bg-white/10" />
        </>
      )}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.35 }}
        className="glass rounded-xl px-4 py-3 inline-block max-w-xl"
        style={{ borderColor: `${color}33` }}
      >
        <p className="text-sm font-medium" style={{ color: depth === 0 ? "#fff" : color }}>
          {node.label}
        </p>
        {node.detail && <p className="text-xs text-muted mt-1">{node.detail}</p>}
      </motion.div>

      {hasChildren && (
        <div className="mt-1">
          {node.children.map((child, i) => (
            <TreeNode key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
