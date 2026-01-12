import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { connectDB } from "./config/db";
import { config } from "./config/env";
import appRoutes from "./routes/app.route";

import chatRoutes from "./routes/chat.route";
import leaderboardRoutes from "./routes/leaderboard.route";
import userRoutes from "./routes/user.route";
import wordRoutes from "./routes/word.route";
import { initCronJobs } from "./services/NotificationService";
const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: "Too many requests, please try again later.",
  })
);
app.use("/api/app", appRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/words", wordRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
initCronJobs();
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  connectDB();
});
