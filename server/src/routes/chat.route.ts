import express from "express";

import { protect } from "../middlewares/auth.middleware";
import {
  endSession,
  getLastSession,
  getSession,
  sendMessage,
  startSession,
} from "../controllers/chat.controller";

const router = express.Router();
router.get("/last", protect, getLastSession);
router.get('/:id', protect, getSession);
router.post("/start", protect, startSession);
router.post("/message", protect, sendMessage);
router.post("/end", protect, endSession);

export default router;
