import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import User from "../models/User";
import { getWordDefinition } from "../services/OpenAIService";

export const saveWord = async (req: AuthRequest, res: Response) => {
  try {
    const { word, contextSentece } = req.body;
    const userId = req.user._id;
    if (!word) {
      return res.status(400).json({ message: "Kelime Gerekli." });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı Bulunamadı." });
    }
    const exist = user.savedWords.some(
      (w) => w.word.toLowerCase() === word.toLowerCase()
    );
    if (exist) {
      return res
        .status(400)
        .json({ message: "Bu kelime zaten defterinde kayıtlı." });
    }
    const nativeLang = user.preferences?.nativeLanguage;
    const translation = await getWordDefinition(
      word,
      contextSentece,
      nativeLang
    );
    const newWordEntry = {
      word,
      translation,
      contextSentece,
      savedAt: new Date(),
    };
    user.savedWords.push(newWordEntry as any);
    await user.save();
    res.status(201).json({ message: "Kelime kaydedildi.", word: newWordEntry });
  } catch (error) {
    console.error("Save Word Error:", error);
    res.status(500).json({ message: "Kelime kaydedilemedi." });
  }
};
export const getWords = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    const words = user?.savedWords.sort(
      (a: any, b: any) =>
        new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );
    res.json(words);
  } catch (error) {
    console.error("Get Word Error:", error);
    res.status(500).json({ message: "Kelime Getirelemedi." });
  }
};
export const deleteWord = async (req: AuthRequest, res: Response) => {
  try {
    const { wordId } = req.params;

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { savedWords: { _id: wordId } },
    });

    res.json({ message: "Kelime silindi." });
  } catch (error) {
    res.status(500).json({ message: "Silme işlemi başarısız." });
  }
};
export const translate = async (req: AuthRequest, res: Response) => {
  try {
    const { word, contextSentence } = req.body;
    const user = await User.findById(req.user._id);
    const nativeLang = user?.preferences?.nativeLanguage;
    const translation = await getWordDefinition(
      word,
      contextSentence,
      nativeLang
    );

    res.json({ translation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Çeviri yapılamadı." });
  }
};
