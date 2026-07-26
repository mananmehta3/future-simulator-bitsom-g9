import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  GitBranch,
  LineChart,
  Users,
  Sparkles,
  Shuffle,
} from "lucide-react";

const FEATURES = [
  {
    icon: GitBranch,
    title: "Branching futures",
    desc: "Four plausible paths generated from your real profile — not one flat answer.",
  },
  {
    icon: LineChart,
    title: "Ripple effects",
    desc: "See how one decision cascades into salary, stress, relationships, and health over time.",
  },
  {
    icon: Users,
    title: "AI Board of experts",
    desc: "A career coach, finance expert, psychologist, entrepreneur, and recruiter weigh in.",
  },
  {
    icon: Shuffle,
    title: "What-if exploration",
    desc: "Tweak variables — a promotion, a recession, a scholarship — and re-simulate instantly.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <main className="relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[36rem] h-[36rem] bg-indigo-500/20 rounded-full blur-[120px] animate-floaty" />
        <div className="absolute top-40 right-1/4 w-[30rem] h-[30rem] bg-violet-500/15 rounded-full blur-[120px] animate-floaty" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-0 left-1/3 w-[26rem] h-[26rem] bg-sky-500/10 rounded-full blur-[120px] animate-floaty" style={{ animationDelay: "4s" }} />
      </div>

      <section className="relative max-w-5xl mx-auto px-6 pt-28 sm:pt-36 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-xs text-muted mb-8"
        >
          <Sparkles size={13} className="text-indigo-300" />
          Probabilistic life simulation, not a chatbot
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05]"
        >
          Every decision creates
          <br />
          <span className="gradient-text">multiple futures.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-6 text-lg text-muted max-w-2xl mx-auto"
        >
          See the life paths your decisions could create. Simulate an MBA, a career switch,
          a move abroad, or a startup leap — across 5, 10, or 20 years — before you commit.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-10 flex items-center justify-center gap-3"
        >
          <button
            onClick={() => navigate("/new")}
            className="group flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-black font-semibold hover:bg-slate-200 transition-all shadow-glow hover:scale-[1.02]"
          >
            Simulate My Future
            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => navigate("/history")}
            className="px-6 py-3.5 rounded-2xl glass text-sm font-medium text-muted hover:text-current transition-colors"
          >
            View past simulations
          </button>
        </motion.div>
      </section>

      <section className="relative max-w-6xl mx-auto px-6 pb-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass rounded-2xl p-6 hover:bg-white/[0.06] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-500/30 flex items-center justify-center mb-4">
                <f.icon size={18} className="text-indigo-300" />
              </div>
              <h3 className="font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative max-w-4xl mx-auto px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-strong rounded-3xl p-8 sm:p-12 text-center"
        >
          <p className="text-sm uppercase tracking-widest text-muted mb-3">Try asking</p>
          <p className="text-xl sm:text-2xl font-medium leading-relaxed">
            "I'm thinking about quitting my software job and pursuing an MBA."
          </p>
          <button
            onClick={() => navigate("/new")}
            className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 transition-colors text-sm font-semibold"
          >
            Start your simulation <ArrowRight size={15} />
          </button>
        </motion.div>
      </section>
    </main>
  );
}
