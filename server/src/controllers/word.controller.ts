import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import User from "../models/User";
import {
  getSentenceDefinition,
  getWordDefinition,
} from "../services/OpenAIService";
import { updateQuestProgress } from "../services/QuestService";

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
    updateQuestProgress(userId, "WORD_SAVE", 1).catch((err) =>
      console.log(err)
    );
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
export const translateWord = async (req: AuthRequest, res: Response) => {
  try {
    const { word, contextSentence } = req.body;
    const user = await User.findById(req.user._id);

    // Kullanıcının ana dilini al (Varsayılan İngilizce olsun global için)
    const nativeLang = user?.preferences?.nativeLanguage || "English";

    // Servise nativeLang'i gönderiyoruz
    const translation = await getWordDefinition(
      word,
      contextSentence,
      nativeLang
    );

    res.json({ translation });
  } catch (error) {
    res.status(500).json({ message: "Translation failed." });
  }
};
export const translateSentence = async (req: AuthRequest, res: Response) => {
  try {
    const { sentence } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı Bulunamadı" });
    }
    const nativeLang = user?.preferences?.nativeLanguage || "English";
    const translation = await getSentenceDefinition(sentence, nativeLang);
    if (!translation) {
      return res.status(400).json({ message: "Anlam Bulunamadı." });
    }
    res.json({ translation });
  } catch (error) {
    res.status(500).json({ message: "Translation failed." });
    console.error(error);
  }
};
