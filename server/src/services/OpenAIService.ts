import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
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
export const transcribeAudioWithWhisper = async (
  filePath: string,
  fileExtension: string = "m4a",
  language: string = "en"
) => {
  try {
    // OpenAI SDK ReadStream kabul eder ve dosya formatını uzantıdan algılar
    // Dosya zaten doğru uzantıyla kaydedilmiş olmalı (controller'da yapılıyor)
    const fileStream = fs.createReadStream(filePath);

    const transcription = await openai.audio.transcriptions.create({
      file: fileStream as any, // OpenAI SDK ReadStream kabul eder
      model: "whisper-1",
      language: language, // Varsayılan 'en', ama parametre olarak gönderilebilir
    });

    return transcription.text;
  } catch (error) {
    console.error("OpenAI Whisper Error:", error);
    throw new Error("Ses dosyası yazıya çevrilemedi.");
  }
};
export const generateFeedbackAnalysis = async (
  conversationHistory: any[],
  nativeLanguage: string
) => {
  const systemPrompt = `
    You are an expert language tutor with a focus on pronunciation and grammar. 
    Analyze the user's performance in the conversation history provided.
    
    CRITICAL INSTRUCTIONS: 
    1. All explanations, comments, and corrections must be written in **${nativeLanguage}**.
    2. For pronunciation feedback, include the correct pronunciation in the international phonetic alphabet (IPA) format.
    
    Output must be a valid JSON object with this structure:
    {
      "score": number (0-100 based on accuracy, fluency, and pronunciation),
      "grammarMistakes": [
         { 
           "original": "user's wrong sentence", 
           "correction": "corrected version", 
           "explanation": "Explanation of the mistake in ${nativeLanguage}" 
         }
      ],
      "pronunciationMistakes": [
        {
          "word": "mispronounced word",
          "correctPronunciation": "IPA pronunciation (e.g., /ˈʃɛdjuːl/ for 'schedule' in British English)",
          "explanation": "Explanation of the correct pronunciation in ${nativeLanguage}"
        }
      ],
      "vocabularySuggestions": ["word1", "word2" (relevant to the topic)],
      "suggestions": [
        "Better way to say X", 
        "More natural phrasing for Y",
        "Pronunciation tip for word Z"
      ],
      "overallComment": "Brief encouraging feedback in ${nativeLanguage}, mentioning both grammar and pronunciation aspects."
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
export const getWordDefinition = async (
  word: string,
  context: string,
  outputLanguage: string
) => {
  const prompt = `
    You are a dictionary helper.
    Task: Translate the word "${word}" to ${outputLanguage}.
    Context sentence where the word is used: "${context}".
    
    Output format: Just the translation and maybe a very short definition or synonym in parenthesis. 
    Keep it concise (max 5-6 words).
    IMPORTANT: The translation/definition MUST be in ${outputLanguage}.
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 30,
  });

  return completion.choices[0].message.content || "Anlam bulunamadı.";
};
export const textToSpeech = async (text: string, voice: string = "alloy") => {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      // TypeScript için 'voice' tipini cast ediyoruz, çünkü string geliyor
      voice: voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    return buffer.toString("base64");
  } catch (error) {
    console.error("OpenAI TTS Error:", error);
    throw new Error("Ses oluşturulamadı.");
  }
};
