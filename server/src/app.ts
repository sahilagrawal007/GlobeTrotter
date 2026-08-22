import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";

// Routes
import authRoutes from "./routes/auth.routes";
import tripRoutes from "./routes/trips.routes";
import stopsRoutes from "./routes/stops.routes";
import citiesRoutes from "./routes/cities.routes";
import activitiesRoutes from "./routes/activities.routes";
import usersRoutes from "./routes/users.routes";
import publicRoutes from "./routes/public.routes";
import adminRoutes from "./routes/admin.routes";
import aiRoutes from "./routes/ai.routes";

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/trips", stopsRoutes);
app.use("/api/cities", citiesRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
});

// ─── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

export default app;
