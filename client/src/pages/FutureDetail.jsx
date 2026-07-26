import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  AlertTriangle,
  Gift,
  Compass,
  HeartPulse,
  Wallet,
  Users2,
  ThumbsDown,
} from "lucide-react";
import { useSimulation } from "../context/SimulationContext.jsx";
import MetricsGrid from "../components/gauges/MetricsGrid.jsx";
import SalaryChart from "../components/timeline/SalaryChart.jsx";
import Timeline from "../components/timeline/Timeline.jsx";
import RippleEffects from "../components/timeline/RippleEffects.jsx";

function InfoBlock({ icon: Icon, title, children, color }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} style={{ color }} />
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <div className="text-sm text-muted leading-relaxed">{children}</div>
    </div>
  );
}

function TagList({ items, tone = "neutral" }) {
  const toneClass =
    tone === "warn"
      ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
      : tone === "good"
      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
      : "bg-white/[0.05] text-muted border-white/10";
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className={`text-sm px-3 py-2 rounded-lg border ${toneClass}`}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function FutureDetail() {
  const { futureId } = useParams();
  const navigate = useNavigate();
  const { simulation } = useSimulation();

  if (!simulation) return null;
  const future = simulation.futures.find((f) => f.id === futureId) || simulation.futures[0];
  const currency = simulation.profile?.currency || "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {simulation.futures.map((f) => (
          <button
            key={f.id}
            onClick={() => navigate(`/results/future/${f.id}`)}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
              f.id === future.id
                ? "text-white border-transparent"
                : "bg-white/[0.03] border-white/10 text-muted hover:text-current"
            }`}
            style={f.id === future.id ? { backgroundColor: f.color } : {}}
          >
            Future {f.id}
          </button>
        ))}
      </div>

      <motion.div
        key={future.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass-strong rounded-3xl p-6 sm:p-8"
      >
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-block mb-3"
          style={{ backgroundColor: `${future.color}22`, color: future.color }}
        >
          Future {future.id} · {future.archetype}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">{future.title}</h1>
        <div className="prose-sm text-muted max-w-2xl leading-relaxed">
          <ReactMarkdown>{future.summary}</ReactMarkdown>
        </div>

        <div className="flex flex-wrap gap-6 mt-6 text-sm">
          <div>
            <p className="text-muted text-xs mb-1">Probability of success</p>
            <p className="text-xl font-semibold" style={{ color: future.color }}>
              ~{future.probabilityOfSuccess}%
            </p>
          </div>
          <div>
            <p className="text-muted text-xs mb-1">Risk level</p>
            <p className="text-xl font-semibold">{future.riskLevel}/100</p>
          </div>
        </div>
      </motion.div>

      <div className="glass rounded-3xl p-6 sm:p-8">
        <h3 className="text-sm font-semibold mb-5 flex items-center gap-2">
          <Sparkles size={15} className="text-indigo-300" /> Life metrics
        </h3>
        <MetricsGrid metrics={future.metrics} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-3xl p-6 sm:p-8">
          <h3 className="text-sm font-semibold mb-4">Projected salary — {currency}</h3>
          <SalaryChart salaryProjection={future.salaryProjection} color={future.color} currency={currency} />
        </div>
        <div className="glass rounded-3xl p-6 sm:p-8">
          <h3 className="text-sm font-semibold mb-4">Timeline</h3>
          <Timeline points={future.timeline} color={future.color} />
        </div>
      </div>

      <div className="glass rounded-3xl p-6 sm:p-8">
        <h3 className="text-sm font-semibold mb-5 flex items-center gap-2">
          <Compass size={15} style={{ color: future.color }} /> Ripple effects
        </h3>
        <RippleEffects effects={future.rippleEffects} color={future.color} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InfoBlock icon={Wallet} title="Financial outlook" color={future.color}>
          {future.financialOutlook}
        </InfoBlock>
        <InfoBlock icon={HeartPulse} title="Health impact" color={future.color}>
          {future.healthImpact}
        </InfoBlock>
        <InfoBlock icon={Users2} title="Personal life impact" color={future.color}>
          {future.personalLifeImpact}
        </InfoBlock>
        <InfoBlock icon={Users2} title="Network growth" color={future.color}>
          {future.networkGrowth}
        </InfoBlock>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-5">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-300" /> Skills acquired
          </h4>
          <div className="flex flex-wrap gap-2">
            {future.skillsAcquired.map((s) => (
              <span
                key={s}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <h4 className="text-sm font-semibold mb-3">Key assumptions</h4>
          <TagList items={future.keyAssumptions} />
        </div>
        <div className="glass rounded-2xl p-5">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Gift size={14} className="text-sky-300" /> Unexpected opportunities
          </h4>
          <TagList items={future.unexpectedOpportunities} tone="good" />
        </div>
        <div className="glass rounded-2xl p-5">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-300" /> Potential setbacks
          </h4>
          <TagList items={future.potentialSetbacks} tone="warn" />
        </div>
        <div className="glass rounded-2xl p-5">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <ThumbsDown size={14} className="text-rose-300" /> Possible regrets
          </h4>
          <TagList items={future.possibleRegrets} tone="warn" />
        </div>
        <div className="glass rounded-2xl p-5 space-y-4">
          <div>
            <p className="text-xs text-muted mb-1">Biggest risk</p>
            <p className="text-sm">{future.biggestRisk}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Biggest reward</p>
            <p className="text-sm">{future.biggestReward}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
