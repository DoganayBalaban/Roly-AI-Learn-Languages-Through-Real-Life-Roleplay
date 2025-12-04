import mongoose, { Schema, Document } from "mongoose";

interface IMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface IFeedback {
  score: number; // 100 üzerinden
  grammarMistakes: Array<{
    original: string;
    correction: string;
    explanation: string;
  }>;
  pronunciationMistakes: Array<{
    word: string;
    correctPronunciation: string;
    explanation: string;
  }>;
  vocabularySuggestions: string[];
  overallComment: string;
}
export interface ISession extends Document {
  userId: mongoose.Types.ObjectId; // Hangi kullanıcı?
  scenario: string; // Örn: "Coffee Shop"
  role: string; // Örn: "Barista"
  difficultyLevel: string; // Örn: "B1"
  status: "active" | "completed";
  messages: IMessage[];
  feedback?: IFeedback; // Başta boş, bitince dolacak
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scenario: { type: String, required: true },
    role: { type: String, required: true },
    difficultyLevel: { type: String, required: true },
    status: { type: String, enum: ["active", "completed"], default: "active" },

    messages: [
      {
        role: {
          type: String,
          enum: ["system", "user", "assistant"],
          required: true,
        },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    feedback: {
      score: Number,
      grammarMistakes: [
        {
          original: String,
          correction: String,
          explanation: String,
        },
      ],
      pronunciationMistakes: [
        {
          word: String,
          correctPronunciation: String,
          explanation: String,
        },
      ],
      vocabularySuggestions: [String],
      overallComment: String,
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model<ISession>("Session", sessionSchema);
