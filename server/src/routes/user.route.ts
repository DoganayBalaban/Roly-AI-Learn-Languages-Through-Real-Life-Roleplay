import express from "express";
import {
  register,
  login,
  getMe,
  getUserStats,
  updatePreferences,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  upgradeToPremium,
  googleLogin,
  deleteAccount,
  updateAvatar,
} from "../controllers/user.controller";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/stats", protect, getUserStats);
router.put("/preferences", protect, updatePreferences);
router.post("/forgot-password", forgotPassword);
router.post("/verify-code", verifyResetCode);
router.post("/reset-password", resetPassword);
router.post("/upgrade", protect, upgradeToPremium);
router.post("/google", googleLogin);
router.delete("/delete", protect, deleteAccount);
router.put("/avatar", protect, updateAvatar);
export default router;
