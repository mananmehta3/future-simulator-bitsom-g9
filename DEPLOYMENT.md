# Deployment Guide: Vercel + Render + Turso (all free)

This deploys the app across three free services: **Vercel** hosts the React client (static site),
**Render** hosts the Express API (a real persistent Node process — Vercel's serverless functions
can't do this), and **Turso** hosts the database (a free, SQLite-compatible hosted DB — plain local
SQLite doesn't survive on any free serverless/ephemeral host, Vercel or Render alike).

The codebase already supports this — `server/src/services/db.service.js` uses the libSQL driver
adapter, which talks to either a local `file:./prisma/dev.db` (dev) or a remote Turso database
(production) through the same code path. No further code changes are needed; this is dashboard/CLI
configuration only.

---

## 1. Create a free Turso database

Install the Turso CLI and sign up (no credit card):

```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso auth signup   # opens a browser to sign up/log in
```

Create a database and get its connection details:

```bash
turso db create future-simulator

turso db show future-simulator --url
# -> libsql://future-simulator-<your-username>.turso.io

turso db tokens create future-simulator
# -> a long JWT string — this is your DATABASE_AUTH_TOKEN
```

Save both values — you'll paste them into Render's environment variables in step 3.

## 2. Apply the existing schema to Turso

Prisma Migrate can't talk to Turso directly, so apply the already-generated migration SQL manually:

```bash
cd server
turso db shell future-simulator < prisma/migrations/20260725120651_init/migration.sql
```

Verify it worked:

```bash
turso db shell future-simulator ".tables"
# should print: Simulation
```

## 3. Deploy the backend to Render

1. Go to **render.com** → sign up (free, no credit card) → **New → Web Service**.
2. Connect your GitHub repo.
3. Configure:
   | Setting | Value |
   |---|---|
   | Root Directory | `server` |
   | Runtime | Node |
   | Build Command | `npm install && npx prisma generate` |
   | Start Command | `npm start` |
   | Instance Type | Free |
4. Add environment variables (Render dashboard → Environment):
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | `libsql://future-simulator-<your-username>.turso.io` (from step 1) |
   | `DATABASE_AUTH_TOKEN` | the token from step 1 |
   | `AI_PROVIDER` | `gemini` |
   | `GEMINI_API_KEY` | your Gemini key |
   | `GEMINI_MODEL` | `gemini-flash-latest` |
   | `CLIENT_ORIGIN` | leave blank for now — you'll set this in step 5 once you have the Vercel URL |
   | `PORT` | leave unset — Render sets this automatically and the app already reads `process.env.PORT` |
5. Deploy. Once live, note the public URL Render gives you, e.g. `https://future-simulator-api.onrender.com`.

**Free tier note:** Render's free web services spin down after 15 minutes of inactivity and take
~30–60 seconds to wake up on the next request — expect a slow first load if the app has been idle.
This doesn't affect the database (that's on Turso now, not Render), only cold-start latency.

## 4. Deploy the frontend to Vercel

1. Go to **vercel.com** → sign up (free) → **Add New → Project** → import your GitHub repo.
2. Configure:
   | Setting | Value |
   |---|---|
   | Root Directory | `client` |
   | Framework Preset | Vite (auto-detected) |
   | Build Command | `npm run build` (default) |
   | Output Directory | `dist` (default) |
3. Add environment variable:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://future-simulator-api.onrender.com/api` (your Render URL from step 3, plus `/api`) |
4. Deploy. Vercel gives you a URL like `https://future-simulator.vercel.app`.

## 5. Connect CORS

Go back to Render → your web service → Environment → set:

```
CLIENT_ORIGIN=https://future-simulator.vercel.app
```

(your actual Vercel URL from step 4). Render redeploys automatically on env var changes.

## 6. Verify

Open your Vercel URL, run through the wizard, and confirm a simulation completes and shows up in
History on a page refresh (proving Turso persistence is actually working, not just the request
completing). If it fails, check Render's logs (dashboard → Logs) — most first-deploy issues are a
missing/mistyped environment variable.

---

## Local development is unaffected

`server/.env` still points at `file:./prisma/dev.db` with no `DATABASE_AUTH_TOKEN` set — local dev
keeps using the local SQLite file exactly as before. Nothing about this deployment changes how you
run `npm run dev` locally.
