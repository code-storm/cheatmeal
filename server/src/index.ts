import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import onboardingRoutes from "./routes/onboarding.routes";
import profileRoutes from "./routes/profile.routes";
import planRoutes from "./routes/plan.routes";
import customTasksRoutes from "./routes/customTasks.routes";
import rewardsRoutes from "./routes/rewards.routes";
import challengesRoutes from "./routes/challenges.routes";
import badgesRoutes from "./routes/badges.routes";
import tipsRoutes from "./routes/tips.routes";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api", healthRoutes);
app.use("/api", authRoutes);
app.use("/api", onboardingRoutes);
app.use("/api", profileRoutes);
app.use("/api", planRoutes);
app.use("/api", customTasksRoutes);
app.use("/api", rewardsRoutes);
app.use("/api", challengesRoutes);
app.use("/api", badgesRoutes);
app.use("/api", tipsRoutes);

// Catch-all 404 for unmatched /api routes.
app.use("/api", (_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

// Error-handling middleware - must be registered last, with 4 args so
// Express treats it as an error handler.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[server] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.listen(PORT, () => {
  console.log(`CheatMeal server listening on http://localhost:${PORT}`);
});
