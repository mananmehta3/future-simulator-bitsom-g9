# Decision Brief: Mock Engine vs. Gemini (Free) vs. Claude API (Paid)

**Question this answers:** Which of the app's three AI providers should we actually use, and when — if at all — is it worth spending money on Claude?

**Bottom line up front:** As of this update, there's no longer a hard tradeoff between "free" and "real AI" — the **Gemini free tier** now gives genuinely-generated, personalized reasoning at $0. Recommendation: use `gemini` as the default for both building and demoing; reserve `claude` only for the specific moment (if any) where the absolute highest reasoning quality matters more than cost. `mock` remains useful purely as a zero-dependency fallback (offline, no rate limits, instant).

---

## 1. What the three modes are

The app has one config flag, `AI_PROVIDER`, in `server/.env`:

| | `mock` | `gemini` | `claude` |
|---|---|---|---|
| **What generates the simulation** | `server/src/services/mockRules.service.js` — local rule-based template engine | `server/src/services/gemini.service.js` — real call to Google's Gemini API | `server/src/services/claude.service.js` — real call to Anthropic's Claude API (`claude-opus-5`) |
| **Cost** | $0.00, always | $0.00 (free tier, rate-limited) | ~$0.20–$0.35 per simulation |
| **Requires internet / API key** | No | Yes (`GEMINI_API_KEY`, free from aistudio.google.com) | Yes (`ANTHROPIC_API_KEY`, paid) |
| **Speed** | Instant (<100ms) | ~15–40 seconds per simulation (measured) | ~5–20 seconds (estimated) |
| **Output structure** | Identical — same JSON shape, same charts, same PDF | Identical | Identical |
| **Output content** | Templated: 9 fixed decision categories, user's real numbers plugged into fixed sentences | Genuinely generated per request from the user's actual profile, decision text, and values | Genuinely generated per request, generally the most nuanced of the three |

All three run through the exact same validation, database storage, comparison table, decision tree,
AI board, and PDF export — nothing else in the app changes based on this flag. Switching is a
one-line edit in `server/.env` and a server restart.

---

## 2. Real output comparison

This section uses **actual captured output**, not paraphrased or illustrative examples, for `mock`
and `gemini`. `claude` output below is illustrative (based on the app's prompt design) since running
it costs money — see Section 6 for how to get a real example cheaply.

**Test input for all three:** 26-year-old software engineer, Bengaluru, ₹12,00,000 salary, ₹5,00,000
savings, moderate risk appetite, career goal "Become a product leader", values = Learning + Impact.
Decision: *"I am thinking about quitting my software job and pursuing an MBA."*

### 2.1 `mock` — real captured output

> **Take the MBA** — *"A plausible path where you pursue the MBA full-time. Outcomes here are likely
> shaped by credentialing and network access, and this route sits at a moderate risk level relative
> to the alternatives."*
>
> Ripple effects: *"Choosing to pursue the MBA full-time triggers an initial shift in credentialing
> and daily routine. That shift likely keeps short-term stress relatively contained in the near
> term..."*
>
> Salary curve: ₹12,00,000 → ₹12,24,000 (yr 3) → ₹13,80,000 (yr 5) → ₹18,60,000 (yr 10)

Coherent, uses correct probabilistic language, plugs in the user's real salary — but the sentence
skeleton ("triggers an initial shift in X", "reasonably settle into a Y trajectory") is **identical
for every category and every user**. Try a different decision and you'll see the same structure with
different nouns dropped in.

### 2.2 `gemini` — real captured output (this is what actually came back from a live call)

> **The Full-Time MBA Pivot** *(archetype: "Accelerated Career Transition")* — *"You leave your
> software role to attend a top-tier business school, leveraging debt and savings. This path rapidly
> shifts your trajectory into business management, though it introduces temporary financial strain
> before unlocking high-level product leadership roles."*
>
> Probability of success: 75% · Risk: 65/100
>
> Salary curve: **₹0** (yr 1) → ₹28,00,000 (yr 3) → ₹45,00,000 (yr 5) → ₹85,00,000 (yr 10)
>
> Ripple effects (7 steps): *"You resign from your engineering role and enroll in an MBA program →
> You incur substantial educational debt, forcing a disciplined budget → You build broad business
> acumen and forge relationships with ambitious peers → You leverage alumni networks to secure a
> formal Product Manager role post-graduation → You bridge technical knowledge with business acumen,
> outperforming peers in cross-functional coordination → You achieve rapid promotions to Senior PM
> and eventually Director of Product → You reach financial payoff by year 7, establishing long-term
> wealth and strategic influence."*
>
> Career Coach's advice: *"If learning and impact drive you, take the bold step toward product
> leadership through an MBA or structured transition early in your 20s while your dependents and
> fixed commitments are low."*
>
> Consensus: *"The board unanimously agrees that transitioning into Product Management fits your
> technical background and career goals well. They concur that your age (26) and lack of dependents
> make this an ideal time to take calculated risks..."*
>
> The other three futures were titled **"The Engineering Mastery Track"**, **"The Internal APM &
> Part-Time Pivot"**, and **"The High-Equity Startup PM Venture"** — each a distinct, specific
> framing, not a re-skinned version of the same four templates.

Notice what this actually does that the mock engine cannot: it modeled **year-1 salary as ₹0**
(realistic — you're not earning while doing a full-time MBA), it tied the entire path specifically to
**Product Management** because that's what the user's stated career goal implies, it referenced the
user's **actual age and lack of dependents** as a timing argument, and it used **"Impact"** (one of
the user's stated values) as a reason to favor this path. None of that is templated — it's reasoning
about the specific inputs.

### 2.3 `claude` — illustrative example only (not a captured response)

> *"With four years as a software engineer and a stated goal of becoming a product leader, an MBA is
> likely to function less as a technical credential and more as a lateral bridge into strategy and
> general management roles that pure engineering experience doesn't easily unlock..."*

Expected to be comparably personalized to the Gemini example above, generally with more nuanced
second-order reasoning (Claude Opus 5 vs. Gemini Flash is a meaningfully larger model), at real cost
per call. Whether that gap is worth paying for is the actual open question this document exists to
answer — see Section 5.

### 2.4 Side-by-side

| | `mock` | `gemini` | `claude` (expected) |
|---|---|---|---|
| Uses the person's real salary/currency | Yes | Yes | Yes |
| Reasoning uses profession/savings/risk-appetite/values as *inputs*, not just labels | No | **Yes** | Yes |
| Sentence structure varies by what was actually typed | No — 4 fixed templates | Yes | Yes |
| Future titles/archetypes vary meaningfully per request | No | Yes | Yes |
| Handles decisions outside the 9 built-in categories well | Generic fallback (noticeably templated) | Yes | Yes |
| Cost | $0 | $0 (rate-limited) | ~$0.20–0.35/run |
| Speed | Instant | ~15–40s | ~5–20s (est.) |

---

## 3. Cost breakdown (`claude` only — the other two are $0)

### 3.1 Per-simulation cost estimate

Claude Opus 5 pricing: **$5 / 1M input tokens, $25 / 1M output tokens.**

| Component | Estimate |
|---|---|
| Input tokens (profile + decision + schema instructions) | ~1,500 tokens → ~$0.0075 |
| Visible output tokens | ~5,000 tokens |
| Hidden "thinking" tokens (billed, not shown to the user) | ~2,000–8,000 tokens, varies |
| **Total per simulation** | **~$0.20–$0.35** |

### 3.2 What a given budget buys, if you do spend

| Budget | Model | Estimated simulations |
|---|---|---|
| $5 | `claude-opus-5` (default) | ~15–25 |
| $5 | `claude-sonnet-5` | ~40–70 |
| $10 | `claude-opus-5` | ~30–50 |
| $10 | `claude-sonnet-5` | ~80–140 |

Still an estimate, not a measurement — see Section 6 for how to get an exact number cheaply.

### 3.3 Gemini free tier limits (so you know the ceiling)

As of the account this app is configured with: roughly **10 requests/minute, ~500 requests/day** on
the Flash model tier, no credit card attached. That comfortably covers building, testing, and any
realistic demo/grading session — you would need to run the simulator dozens of times in a single
minute to hit the limit. If it's ever hit, the API returns a clear rate-limit error rather than
silently failing or charging anything (no billing is attached to this key).

---

## 4. Risk considerations

| Risk | `mock` | `gemini` | `claude` |
|---|---|---|---|
| **Budget overrun** | Impossible | Impossible (free tier, no billing attached) | Possible if run repeatedly/unattended — set a spend cap in the Anthropic console |
| **Grader notices templated output** | Real risk if evaluated on AI reasoning quality | Not a risk | Not a risk |
| **Outage/rate limit during a live demo** | Not possible (offline) | Small risk — Google can throttle without warning | Small risk |
| **Slower live demo** | Not an issue | 15–40s per click — noticeable in a timed demo | 5–20s (est.) |
| **Key exposure** | N/A | Free-tier key — low real risk if leaked (no billing to abuse), but could burn your daily quota | Paid key — real financial risk if leaked; rotate immediately if exposed |

A sensible default: **run `gemini` day-to-day** (real output, zero cost) and keep `mock` as an
instant, zero-dependency fallback if the network or Google's API is unavailable during a live demo.

---

## 5. Recommendation by scenario

| Scenario | Recommendation |
|---|---|
| Building/testing the UI, fixing bugs, iterating on design | `mock` — no reason to make network calls at all while iterating on layout/CSS |
| Practicing a demo, or the actual demo, where AI reasoning quality matters | **`gemini`** — real, personalized output at $0. This is the new default recommendation. |
| Live demo with an unreliable network / conference wifi | `mock` as a fallback — instant, no dependency on Google's API being up |
| Final submission, if a grader will specifically probe edge-case decisions or compare against Claude-quality output | Consider `claude` for that specific artifact — spend ~$2–5, generate the handful of showcase examples, done |
| Just want the most nuanced reasoning available, cost aside | `claude` |

---

## 6. Getting an exact (not estimated) Claude cost, cheaply

If real Claude output is wanted for even one showcase example: run 2–3 real simulations, then read
`response.usage` from the Claude API response (exact input/output/thinking token counts). That turns
"$5 → 15–25 simulations" into an exact "$5 → N simulations" after spending a few cents. Ask if this
usage logging should be added to `claude.service.js` before committing a budget.

---

## 7. How to switch modes

Edit `server/.env`:

```bash
# Free, offline, template-based
AI_PROVIDER=mock

# Free, real AI (recommended default)
AI_PROVIDER=gemini
GEMINI_API_KEY="AIza..."
GEMINI_MODEL="gemini-flash-latest"

# Paid, highest quality
AI_PROVIDER=claude
ANTHROPIC_API_KEY="sk-ant-..."
ANTHROPIC_MODEL="claude-opus-5"   # or "claude-sonnet-5" for ~3x more runs per dollar
```

Restart the server (`npm run dev`) after changing this file — no code changes needed either way.
