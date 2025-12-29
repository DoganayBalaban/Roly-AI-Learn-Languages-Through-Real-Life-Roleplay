import express from "express";
import { checkAppVersion } from "../controllers/app.controller";

const router = express.Router();

// Sürüm kontrolü endpoint'i - authentication gerektirmez
router.get("/version-check", checkAppVersion);

export default router;

