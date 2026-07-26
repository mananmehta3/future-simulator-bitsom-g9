export default function Chip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
        selected
          ? "bg-indigo-500 border-indigo-400 text-white shadow-glow"
          : "bg-white/[0.03] border-white/10 text-muted hover:text-current hover:border-white/20"
      }`}
    >
      {label}
    </button>
  );
}
