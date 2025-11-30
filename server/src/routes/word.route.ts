import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  saveWord,
  getWords,
  deleteWord,
  translate,
} from "../controllers/word.controller";

const router = Router();

router.post("/", protect, saveWord); // POST /api/words
router.get("/", protect, getWords); // GET /api/words
router.delete("/:wordId", protect, deleteWord); // DELETE /api/words/:id
router.post("/lookup", protect, translate);
export default router;
