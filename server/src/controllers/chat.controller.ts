import { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import Session from "../models/Session";
import {
  getChatCompletion,
  generateFeedbackAnalysis,
} from "../services/OpenAIService";

export const startSession = async (req: AuthRequest, res: Response) => {
  try {
    const { scenario, role, difficultyLevel } = req.body;
    const userId = req.user._id;
    // System Prompt: Botun karakterini tanımlıyoruz
    const systemMessage = {
      role: "system",
      content: `You are a ${role} in a ${scenario}. The user is learning English at ${difficultyLevel} level. 
        Roleplay with them. Be immersive. Don't correct grammar yet. Keep responses short (1-3 sentences).`,
    };

    const newSession = await Session.create({
      userId,
      scenario,
      role,
      difficultyLevel,
      messages: [systemMessage],
    });
    res.status(201).send(newSession);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.error("Error in startSession controller:", error);
  }
};
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, message } = req.body;
    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
    });
    if (!session || session.status === "completed") {
      return res
        .status(404)
        .json({ message: "Session not found or completed" });
    }
    session.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });
    const historyForAI = session.messages.map((msg) => ({
      role: msg.role as "system" | "user" | "assistant",
      content: msg.content,
    }));
    const aiResponse = await getChatCompletion(historyForAI);
    if (aiResponse) {
      session.messages.push({
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      });
    }
    await session.save();
    res.json({ reply: aiResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Message failed" });
  }
};
export const endSession = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
    });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    const feedback = await generateFeedbackAnalysis(session.messages);
    if (!feedback) {
      return res
        .status(500)
        .json({ message: "Failed to parse feedback from AI" });
    }
    session.feedback = feedback;
    session.status = "completed";
    await session.save();
    res.json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate feedback" });
  }
};
export const getLastSession = async (req: AuthRequest, res: Response) => {
  try {
    const lastSession = await Session.findOne({ 
      userId: req.user._id,
      status: 'active' // <-- KRİTİK NOKTA: Sadece aktifleri getir
    })
      .sort({ updatedAt: -1 })
      .limit(1);

    if (!lastSession) {
      return res.json(null);
    }

    res.json(lastSession);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch last session" });
  }
};
export const getSession = async (req: AuthRequest, res: Response) => {
  try {
    const session = await Session.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch session" });
  }
};