# Roly AI - Learn Languages Through Real-Life Roleplay

<div align="center">
  <img src="https://img.shields.io/badge/React_Native-0.72.5-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
</div>

## 🌍 Overview

Roly AI is an innovative language learning application that helps users practice new languages through AI-powered roleplay conversations. The app provides an immersive experience where users can engage in realistic dialogues, receive instant feedback, and track their progress over time.

## ✨ Features

- **AI-Powered Conversations**: Practice real-life dialogues with an AI language partner
- **Multiple Languages**: Support for various target languages with customizable difficulty levels (A1-C2)
- **Progress Tracking**: Monitor your learning journey with detailed statistics and achievements
- **Vocabulary Builder**: Save and review new words with translations and examples
- **Speech Recognition**: Improve your pronunciation with voice input and feedback
- **Personalized Learning**: Adaptive difficulty based on your progress and preferences

## 🚀 Tech Stack

### Frontend (Mobile)
- **Framework**: React Native with Expo
- **State Management**: React Context API
- **Navigation**: React Navigation
- **UI Components**: React Native Paper, @expo/vector-icons
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js with Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: OpenAI API
- **Validation**: Zod

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- MongoDB (local or cloud instance)
- OpenAI API key

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server root with the following variables:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Mobile App Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the mobile root with your API URL:
   ```
   API_URL=http://your-local-ip:3000
   ```

4. Start the development server:
   ```bash
   expo start
   ```

5. Use the Expo Go app on your device or an emulator to run the application.

## 📱 Screenshots

*(Screenshots will be added here)*

## 📊 Project Structure

```
RolyAI/
├── mobile/                 # React Native mobile application
│   ├── src/
│   │   ├── screens/       # Application screens
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context providers
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── app.json           # Expo configuration
│
└── server/                # Node.js backend
    ├── src/
    │   ├── controllers/   # Route controllers
    │   ├── models/        # Database models
    │   ├── routes/        # API routes
    │   ├── services/      # Business logic
    │   └── utils/         # Helper functions
    └── .env.example       # Environment variables template
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for their powerful language models
- Expo for the amazing cross-platform development experience
- The open-source community for their invaluable contributions

---

<div align="center">
  Made with ❤️ by Roly AI Team
</div>
