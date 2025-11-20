import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const getChatCompletion = async (history: any[]) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: history,
    temperature: 0.7,
    max_tokens: 150,
  });

  return completion.choices[0].message.content;
};

export const generateFeedbackAnalysis = async (conversationHistory: any[]) => {
  const systemPrompt = `
      You are an expert English teacher. 
      Analyze the user's performance in the following roleplay conversation.
      Do not continue the roleplay. Provide feedback.
      
      Return ONLY a JSON object in this format:
      {
        "score": number (0-100 based on accuracy and fluency),
        "grammarMistakes": [
           { "original": "user's wrong sentence", "correction": "corrected version", "explanation": "why it is wrong" }
        ],
        "vocabularySuggestions": ["word1", "word2" (relevant to the topic)],
        "overallComment": "Brief encouraging feedback"
      }
    `;
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" }, // JSON garantisi
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(conversationHistory) },
    ],
  });

  const content = completion.choices[0].message.content;
  return content ? JSON.parse(content) : null;
};
