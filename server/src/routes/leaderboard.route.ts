import express from "express";
import { getLeaderboard } from "../controllers/leaderboard.controller";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", protect, getLeaderboard);

export default router;
