import express from "express";
import { connectDB } from "./config/db";
import cors from "cors";
import userRoutes from "./routes/user.route";
import chatRoutes from "./routes/chat.route";
import wordRoutes from "./routes/word.route";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use("/api/auth", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/words", wordRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
