import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import { connectDB } from "./utils/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import orgRoutes from "./routes/organisation.routes.js";
import memberRoutes from "./routes/member.routes.js";
import groupRoutes from "./routes/group.routes.js";
import farmRoutes from "./routes/farm.routes.js";
import cropRoutes from "./routes/crop.routes.js";
import collectionRoutes from "./routes/collection.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import loanRoutes from "./routes/loan.routes.js";
import visitRoutes from "./routes/visit.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import reportRoutes from "./routes/report.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import { markOverdueLoans } from "./services/overdue.service.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS. In development the client (Vite on :5173) calls the API directly, so
// we allow any origin. In production the origin must be restricted to the
// deployed CLIENT_URL. credentials: true is used for cookie-based flows;
// auth itself is handled via Authorization header (JWT), not cookies.
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? process.env.CLIENT_URL : true,
    credentials: true,
  }),
);

// Logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "KonnectCore API is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/organisations", orgRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/audit-logs", auditRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`KonnectCore server running on port ${PORT}`);
  });

  // Scheduled overdue sweep (README Task 53). Runs shortly after startup and
  // then every 6 hours. Low-cost batched update; failures are logged rather
  // than crashing the process.
  const OVERDUE_INTERVAL_MS = 6 * 60 * 60 * 1000;
  setTimeout(() => {
    markOverdueLoans()
      .then((n) => {
        if (n > 0) console.log(`[overdue] ${n} loan(s) marked overdue`);
      })
      .catch((err) => console.error("[overdue] sweep failed:", err.message));
  }, 60 * 1000);
  setInterval(() => {
    markOverdueLoans().catch((err) =>
      console.error("[overdue] sweep failed:", err.message),
    );
  }, OVERDUE_INTERVAL_MS);
});
