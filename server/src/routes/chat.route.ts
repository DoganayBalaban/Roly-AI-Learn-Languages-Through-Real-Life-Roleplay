import express from "express";
import multer from "multer";

import { protect } from "../middlewares/auth.middleware";
import {
  endSession,
  getLastSession,
  getSession,
  sendMessage,
  startSession,
  transcribeAudio,
} from "../controllers/chat.controller";
const upload = multer({ dest: "uploads/" });

const router = express.Router();
router.get("/last", protect, getLastSession);
router.get("/:id", protect, getSession);
router.post("/start", protect, startSession);
router.post("/message", protect, sendMessage);
router.post("/end", protect, endSession);
router.post("/transcribe", protect, upload.single("audio"), transcribeAudio);

export default router;
