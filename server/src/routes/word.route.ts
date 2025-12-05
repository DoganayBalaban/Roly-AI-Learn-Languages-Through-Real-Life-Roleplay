import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  saveWord,
  getWords,
  deleteWord,
  translateWord,
  translateSentence,
} from "../controllers/word.controller";

const router = Router();

router.post("/", protect, saveWord); // POST /api/words
router.get("/", protect, getWords); // GET /api/words
router.delete("/:wordId", protect, deleteWord); // DELETE /api/words/:id
router.post("/lookup", protect, translateWord);
router.post("/sentence", protect, translateSentence);
export default router;
