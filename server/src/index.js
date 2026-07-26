import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import simulateRoutes from "./routes/simulate.routes.js";
import historyRoutes from "./routes/history.routes.js";
import reportRoutes from "./routes/report.routes.js";
import { AppError } from "./utils/AppError.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/simulate", simulateRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/report", reportRoutes);

// 404 for unmatched API routes.
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Centralized error handler — every asyncHandler-wrapped route funnels here.
app.use((err, req, res, next) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  if (statusCode >= 500) console.error(err);
  res.status(statusCode).json({
    error: err.message || "Internal server error",
    details: err instanceof AppError ? err.details : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`Future Simulator API listening on http://localhost:${PORT}`);
});
