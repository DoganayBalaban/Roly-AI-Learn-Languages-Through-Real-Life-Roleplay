import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/speakai",
  jwtSecret: process.env.JWT_SECRET || "secret",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || "",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  minimumAppVersion: process.env.MINIMUM_APP_VERSION || "1.2.4",
  minimumAppVersionCode: process.env.MINIMUM_APP_VERSION_CODE
    ? parseInt(process.env.MINIMUM_APP_VERSION_CODE, 10)
    : 9,
};
