export function Label({ children }) {
  return <label className="block text-sm font-medium text-muted mb-2">{children}</label>;
}

export function TextInput({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-indigo-400/60 focus:bg-white/[0.06] outline-none transition-colors placeholder:text-slate-500 ${className}`}
    />
  );
}

export function TextArea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-indigo-400/60 focus:bg-white/[0.06] outline-none transition-colors placeholder:text-slate-500 resize-none ${className}`}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-indigo-400/60 outline-none transition-colors ${className}`}
    >
      {children}
    </select>
  );
}

export function Field({ label, children }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
