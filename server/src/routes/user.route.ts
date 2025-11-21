import express from "express";
import { register, login, getMe, getUserStats, updatePreferences } from "../controllers/user.controller";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get('/stats', protect, getUserStats);
router.put('/preferences', protect, updatePreferences);
export default router;
