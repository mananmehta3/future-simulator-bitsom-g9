# Future Simulator

> "See the life paths your decisions could create."

An interactive life-decision simulator. Enter a major decision (an MBA, quitting your job,
moving abroad, a startup, a career switch...) and get back four plausible, probabilistically-reasoned
futures — each with a timeline, salary projection, life-metric gauges, ripple effects, a decision
tree, and a board of AI "experts" who weigh in with pros, concerns, and advice. Not a chatbot: a
structured simulation UI backed by a single JSON-generating AI call per simulation.

## Tech stack

- **Client:** React 18, Vite, React Router, Tailwind CSS, Framer Motion, Recharts, Axios,
  React Markdown, Lucide icons, jsPDF (client-side PDF report export)
- **Server:** Node.js, Express, Prisma ORM, SQLite, Zod (request/response validation), Anthropic
  (Claude) SDK + Gemini REST API (two swappable AI providers, plus a free offline rules engine)
- **Monorepo:** npm workspaces (`client/`, `server/`)

## Project structure

```
├── client/                  React app
│   └── src/
│       ├── components/      layout, ui, gauges, timeline, comparison, decisionTree, board
│       ├── pages/            Landing, InputWizard, Overview, FutureDetail, Comparison,
│       │                     DecisionTreePage, AIBoard, WhatIf, History
│       ├── context/          ThemeContext, SimulationContext
│       ├── services/         api.js (axios client)
│       └── utils/            constants.js, pdfExport.js
├── server/                  Express API
│   └── src/
│       ├── routes/           simulate, history, report
│       ├── controllers/      request handling per route
│       ├── services/         claude.service.js, gemini.service.js, mockRules.service.js
│       │                     (one file per AI provider), simulation.service.js (prompt building +
│       │                     provider routing), db.service.js
│       ├── models/           simulation.schema.js (Zod schemas, request + AI response validation)
│       └── utils/            asyncHandler, AppError
│   └── prisma/               schema.prisma, migrations/
└── package.json              npm workspaces root
```

## Setup

**Requirements:** Node.js 18+. No API key needed to run it out of the box.

```bash
# 1. Install everything (root + client + server workspaces)
npm install

# 2. Configure environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env
# AI_PROVIDER defaults to "mock", so it runs at zero cost out of the box.
# To use a real AI provider instead, set AI_PROVIDER to "gemini" (free — get a
# key at aistudio.google.com) or "claude" (paid — get a key at
# console.anthropic.com) and set the matching API key in server/.env.

# 3. Run both client and server together
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:4000 (health check at `/health`)

The SQLite database (`server/prisma/dev.db`) and its migration are already included — `npm install`
runs `prisma generate` automatically via `postinstall`. If you ever change `server/prisma/schema.prisma`,
run `npm run prisma:migrate` from the root to create a new migration.

### Environment variables

**`server/.env`**

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite connection string (defaults to `file:./dev.db`) |
| `AI_PROVIDER` | `mock` (default, free offline rules engine) \| `gemini` (free real AI) \| `claude` (paid, highest quality) |
| `GEMINI_API_KEY` | Your Gemini API key — required when `AI_PROVIDER=gemini`. Free at [aistudio.google.com](https://aistudio.google.com) |
| `GEMINI_MODEL` | Model id, defaults to `gemini-flash-latest` |
| `ANTHROPIC_API_KEY` | Your Anthropic API key — required when `AI_PROVIDER=claude` |
| `ANTHROPIC_MODEL` | Model id, defaults to `claude-opus-5` (use `claude-sonnet-5` for a cheaper/faster option) |
| `PORT` | API port, defaults to `4000` |
| `CLIENT_ORIGIN` | Allowed CORS origin, defaults to `http://localhost:5173` |

**`client/.env`**

| Variable | Description |
|---|---|
| `VITE_API_URL` | API base path, defaults to `/api` (proxied to the server by Vite in dev) |

## How it works

1. **Input Wizard** (`/new`) collects a structured profile (age, location, education, salary,
   risk appetite, values, etc.) plus the free-text decision and a time horizon (5/10/20 years).
2. That profile is sent to `POST /api/simulate`. The server builds a single prompt
   (`server/src/services/simulation.service.js`) instructing the model to reason
   **probabilistically** (never "will", always "likely"/"may"/"reasonably expected") and to return
   one structured JSON object containing 4 futures, a 5-expert AI board, a consensus/disagreements
   summary, and a branching decision tree.
3. The response is validated against a Zod schema (`server/src/models/simulation.schema.js`) before
   being persisted (SQLite via Prisma) and returned to the client — malformed AI output is rejected
   with a clear error rather than silently breaking the UI.
4. The client renders the result across five tabs: **Futures** (card grid + deep-dive timeline,
   gauges, ripple-effect chain), **Comparison** (side-by-side table), **Decision Tree** (branching
   outcomes), **AI Board** (expert pros/concerns/advice + consensus), and **What-If** (toggle levers
   like a promotion, recession, or scholarship and regenerate a new branch).
5. **History** (`/history`) lists every past simulation (and what-if branches) from SQLite.
6. **Export PDF Report** builds a multi-page PDF client-side from `GET /api/report/:id` — no
   server-side PDF rendering, so no headless-browser dependency.

## Three swappable AI providers

`simulation.service.js` builds one prompt (system + user) and hands it to whichever provider
`AI_PROVIDER` selects — everything downstream (Zod validation, styling, DB persistence, the whole
client) is identical regardless of which one ran. Each provider is isolated to exactly one file:

| `AI_PROVIDER` | File | Cost | Notes |
|---|---|---|---|
| `mock` (default) | `mockRules.service.js` | Free, offline, instant | Pattern-matches the decision text against 9 categories (MBA, quitting a job, moving abroad, a startup, a career switch, UPSC prep, a higher-paying job, a master's degree, or a generic fallback) and fills hand-written sentence templates with the user's real profile numbers. Coherent and on-schema, but the sentence structure repeats across users/categories. What-If levers (recession, promotion, layoff, etc.) make real numeric adjustments, not just cosmetic text. |
| `gemini` | `gemini.service.js` | Free (Google's Gemini free tier) | Calls the Gemini REST API directly (`fetch`, no SDK dependency) with `responseMimeType: "application/json"` to request clean JSON, with a fallback extractor in case the model wraps it in prose anyway. Genuinely generated per request — reasons about the user's actual profile, decision text, and values rather than filling a template. |
| `claude` | `claude.service.js` | Paid | Calls Claude Opus 5 via the Messages API. Opts into server-side model fallback (`fallbacks: "default"`), so a safety-classifier decline on Opus 5 automatically retries on a fallback model instead of failing the request. Highest quality of the three. |

Visual styling (color/gradient per future) is assigned deterministically on the server regardless of
provider, so the UI stays consistent no matter what a given model names things.

**Switching providers** is a one-line edit in `server/.env` plus a server restart — no code changes:

```bash
AI_PROVIDER=mock     # free, offline, template-based — safe default for building/testing
AI_PROVIDER=gemini   # free real AI — needs GEMINI_API_KEY
AI_PROVIDER=claude   # paid, highest quality — needs ANTHROPIC_API_KEY
```

See [`AI_MODE_DECISION.md`](./AI_MODE_DECISION.md) for a detailed cost/quality comparison across all
three, including real example output from each.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run client + server together |
| `npm run server` / `npm run client` | Run just one side |
| `npm run build` | Production build of the client |
| `npm run prisma:migrate` | Create/apply a Prisma migration |
| `npm run prisma:studio` | Open Prisma Studio to inspect the SQLite DB |
