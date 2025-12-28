import cors from "cors";
import express from "express";
import { connectDB } from "./config/db";
import appRoutes from "./routes/app.route";
import chatRoutes from "./routes/chat.route";
import leaderboardRoutes from "./routes/leaderboard.route";
import userRoutes from "./routes/user.route";
import wordRoutes from "./routes/word.route";
import { initCronJobs } from "./services/NotificationService";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use("/api/app", appRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/words", wordRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
initCronJobs();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
