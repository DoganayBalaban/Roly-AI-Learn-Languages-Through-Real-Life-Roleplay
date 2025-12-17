# RolyAI
RolyAI is an AI-powered language-learning platform focused on speaking, not memorizing.
It puts learners into real-life roleplay conversations so practice feels practical.
Instant feedback helps fix pronunciation and grammar before bad habits stick.
The goal is confidence for meetings, travel, and everyday conversations.
This repo ships the landing site + waitlist, a mobile app, and the API server.

**Live Demo**
- App: https://rolyai.vercel.app/
- GitHub repo: https://github.com/DoganayBalaban/Roly-AI-Learn-Languages-Through-Real-Life-Roleplay

## Problem
Most language apps train vocabulary and reading, but people freeze when it matters: speaking. Learners lack safe, realistic practice and timely feedback, so confidence lags behind knowledge.

## Solution
RolyAI provides AI-driven roleplay conversations with immediate feedback on pronunciation and grammar. The experience is designed to build confidence through realistic practice and progression.

## Key Features
- Real-life roleplay scenarios that mirror everyday situations
- Instant pronunciation + grammar feedback
- Adaptive learning for different proficiency levels
- Gamified progression (XP, streaks, leaderboards)
- Multi-language support (English, Turkish, Spanish, German, French, Italian, Japanese, Korean, Russian)

## Tech Stack
- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS, GSAP
- Mobile: React Native (Expo), React Navigation, Expo AV/Speech
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Zod
- AI: OpenAI API
- Infra: Resend (waitlist email capture), [TODO: hosting/deployment]

## System Overview
1. User visits the Next.js landing page and scrolls through product highlights.
2. GSAP animations present feature steps and device screens.
3. The waitlist form submits via a Next.js Server Action.
4. The server action validates the email and stores it in Resend.
5. Mobile client authenticates users and calls the Express API.
6. The API stores user data in MongoDB and issues JWTs.
7. AI responses/feedback are generated via the OpenAI API.

## Architecture Notes
- Monorepo with `landing/`, `mobile/`, and `server/` apps
- Next.js Server Actions handle waitlist submissions on the landing page
- Express API handles auth + AI orchestration for the mobile app
- MongoDB stores users and content; secrets are injected via env vars

## Getting Started

### Landing (Next.js)
```bash
cd landing
npm install
npm run dev
```

### Server (Express)
```bash
cd server
npm install
npm run dev
```

### Mobile (Expo)
```bash
cd mobile
npm install
npm start
```

## Environment Variables
| App | Variable | Purpose |
| --- | --- | --- |
| landing | `RESEND_API_KEY` | Resend API key for waitlist capture |
| landing | `NEXT_PUBLIC_SITE_URL` | Canonical site URL for metadata |
| server | `MONGODB_URI` | MongoDB connection string |
| server | `JWT_SECRET` | JWT signing secret |
| server | `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| server | `OPENAI_API_KEY` | OpenAI API key |
| server | `PORT` | API port (defaults to 3000) |

## Challenges & Learnings
- Coordinating GSAP scroll-timelines with pinned hero sections
- Keeping animations type-safe with dynamic refs in TypeScript
- Designing a waitlist flow that feels instant yet reliable
- Balancing marketing polish with app readiness across web + mobile

## Roadmap
- [TODO] In-app speaking sessions with richer feedback UI
- [TODO] Personalized study plans and goal tracking
- [TODO] Multi-language content packs and scenario expansion
- [TODO] App store launch and public beta rollout

## Contributing
Issues and PRs are welcome. Please open an issue first for large changes so we can align on scope.