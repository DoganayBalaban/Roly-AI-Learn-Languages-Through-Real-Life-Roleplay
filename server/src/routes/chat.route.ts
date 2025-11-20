import express from "express";

import { protect } from "../middlewares/auth.middleware";
import {
  endSession,
  sendMessage,
  startSession,
} from "../controllers/chat.controller";

const router = express.Router();

router.post("/start", protect, startSession);
router.post("/message", protect, sendMessage);
router.post("/end", protect, endSession);

export default router;
