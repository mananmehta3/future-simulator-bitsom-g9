import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Field, TextInput, Select, TextArea } from "../components/ui/FormField.jsx";
import Chip from "../components/ui/Chip.jsx";
import SimulatingOverlay from "../components/ui/SimulatingOverlay.jsx";
import { useSimulation } from "../context/SimulationContext.jsx";
import {
  VALUE_OPTIONS,
  RISK_APPETITES,
  HORIZON_OPTIONS,
  RELATIONSHIP_OPTIONS,
} from "../utils/constants.js";

const STEPS = ["Your profile", "Goals & values", "The decision"];

export default function InputWizard() {
  const navigate = useNavigate();
  const {
    profile,
    setProfile,
    decision,
    setDecision,
    horizonYears,
    setHorizonYears,
    runSimulation,
    status,
  } = useSimulation();

  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState("");

  const update = (key, value) => setProfile((p) => ({ ...p, [key]: value }));
  const toggleValue = (v) =>
    setProfile((p) => ({
      ...p,
      values: p.values.includes(v) ? p.values.filter((x) => x !== v) : [...p.values, v],
    }));

  const validateStep = () => {
    if (step === 0) {
      if (!profile.age || !profile.country || !profile.city || !profile.education || !profile.profession) {
        setFormError("Please fill in every field before continuing.");
        return false;
      }
      if (profile.salary === "" || profile.yearsExperience === "" || profile.savings === "") {
        setFormError("Please fill in every field before continuing.");
        return false;
      }
    }
    if (step === 1) {
      if (!profile.careerGoal || profile.values.length === 0) {
        setFormError("Please describe a goal and select at least one value.");
        return false;
      }
    }
    setFormError("");
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (decision.trim().length < 5) {
      setFormError("Tell us a bit more about the decision you're weighing.");
      return;
    }
    setFormError("");
    try {
      await runSimulation();
      navigate("/results/overview");
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-6 pt-12 pb-32">
      {status === "loading" && <SimulatingOverlay />}

      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border transition-colors ${
                  i < step
                    ? "bg-indigo-500 border-indigo-400"
                    : i === step
                    ? "border-indigo-400 text-indigo-300"
                    : "border-white/15 text-muted"
                }`}
              >
                {i < step ? <Check size={13} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 ${i < step ? "bg-indigo-400" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{STEPS[step]}</h1>
        <p className="text-sm text-muted mt-1">Step {step + 1} of {STEPS.length}</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
          className="glass rounded-3xl p-6 sm:p-8"
        >
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Current age">
                <TextInput type="number" min={14} max={90} value={profile.age}
                  onChange={(e) => update("age", e.target.value)} placeholder="26" />
              </Field>
              <Field label="Country">
                <TextInput value={profile.country} onChange={(e) => update("country", e.target.value)} placeholder="India" />
              </Field>
              <Field label="Current city">
                <TextInput value={profile.city} onChange={(e) => update("city", e.target.value)} placeholder="Bengaluru" />
              </Field>
              <Field label="Education">
                <TextInput value={profile.education} onChange={(e) => update("education", e.target.value)} placeholder="B.Tech Computer Science" />
              </Field>
              <Field label="Current profession">
                <TextInput value={profile.profession} onChange={(e) => update("profession", e.target.value)} placeholder="Software Engineer" />
              </Field>
              <Field label="Years of experience">
                <TextInput type="number" min={0} value={profile.yearsExperience}
                  onChange={(e) => update("yearsExperience", e.target.value)} placeholder="4" />
              </Field>
              <Field label="Current salary (annual)">
                <div className="flex gap-2">
                  <TextInput type="number" min={0} value={profile.salary}
                    onChange={(e) => update("salary", e.target.value)} placeholder="1200000" />
                  <TextInput className="w-24" value={profile.currency}
                    onChange={(e) => update("currency", e.target.value)} placeholder="INR" />
                </div>
              </Field>
              <Field label="Savings">
                <TextInput type="number" min={0} value={profile.savings}
                  onChange={(e) => update("savings", e.target.value)} placeholder="500000" />
              </Field>
              <Field label="Relationship status">
                <Select value={profile.relationshipStatus} onChange={(e) => update("relationshipStatus", e.target.value)}>
                  {RELATIONSHIP_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Dependents">
                <TextInput type="number" min={0} value={profile.dependents}
                  onChange={(e) => update("dependents", e.target.value)} placeholder="0" />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-7">
              <Field label="Risk appetite">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {RISK_APPETITES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => update("riskAppetite", r.value)}
                      className={`px-4 py-3 rounded-xl text-sm text-left border transition-all ${
                        profile.riskAppetite === r.value
                          ? "bg-indigo-500/20 border-indigo-400 text-current"
                          : "bg-white/[0.03] border-white/10 text-muted hover:text-current"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Career goal">
                <TextInput value={profile.careerGoal} onChange={(e) => update("careerGoal", e.target.value)}
                  placeholder="Become a product leader at a global tech company" />
              </Field>

              <Field label="What matters most to you? (select multiple)">
                <div className="flex flex-wrap gap-2">
                  {VALUE_OPTIONS.map((v) => (
                    <Chip key={v} label={v} selected={profile.values.includes(v)} onClick={() => toggleValue(v)} />
                  ))}
                </div>
              </Field>

              <Field label="Simulation horizon">
                <div className="flex gap-2">
                  {HORIZON_OPTIONS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHorizonYears(h)}
                      className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                        horizonYears === h
                          ? "bg-indigo-500 border-indigo-400 text-white"
                          : "bg-white/[0.03] border-white/10 text-muted hover:text-current"
                      }`}
                    >
                      {h} years
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {step === 2 && (
            <div>
              <Field label="What decision are you trying to make?">
                <TextArea
                  rows={6}
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  placeholder="I'm thinking about quitting my software job and pursuing an MBA."
                />
              </Field>
              <p className="text-xs text-muted mt-3">
                We'll simulate 4 plausible futures grounded in your profile above — probabilistic,
                not predictions.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {formError && (
        <p className="text-sm text-rose-400 mt-4">{formError}</p>
      )}

      <div className="flex items-center justify-between mt-8">
        <button
          onClick={back}
          disabled={step === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-muted hover:text-current disabled:opacity-0 transition-all"
        >
          <ArrowLeft size={15} /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-colors"
          >
            Continue <ArrowRight size={15} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={status === "loading"}
            className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 font-semibold text-sm transition-colors shadow-glow"
          >
            Simulate My Future <ArrowRight size={15} />
          </button>
        )}
      </div>
    </main>
  );
}
