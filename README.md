<div align="center">

# ⬡ CODARIS AI
### AI-Powered Code Review System

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/atlas)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com)
[![License](https://img.shields.io/badge/License-MIT-a855f7?style=for-the-badge)](LICENSE)

<br />

**Paste any code. Get instant AI-powered feedback.**

Security vulnerabilities · Performance issues · Best practices · Quality score — all in seconds.

<br />

![CODARIS AI Banner](https://img.shields.io/badge/CODARIS-AI_Code_Review-00e5ff?style=for-the-badge&labelColor=05060f)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Code Review** | Powered by Google Gemini 2.5 Flash with Groq as fallback |
| 🖥️ **Monaco Editor** | Full VS Code editor experience in the browser |
| 📊 **Quality Score** | 0–100 score with animated ring visualization |
| 🔴 **Severity Badges** | Critical · Warning · Info · Suggestion |
| 🌐 **15+ Languages** | JS, TS, Python, Java, Go, Rust, C++, PHP, Ruby, Swift & more |
| 🔒 **Security Analysis** | Detects SQL injection, XSS, auth flaws, and 50+ patterns |
| 📜 **Review History** | Saved per-user with stats dashboard |
| 🐙 **GitHub OAuth** | Sign in with GitHub — reviews linked to your account |
| ⚡ **Guest Mode** | Review code without signing in |
| 📱 **Responsive** | Works on desktop and mobile |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript** — Component-based UI
- **Vite 6** — Lightning-fast dev server & bundler
- **Tailwind CSS** — Utility-first styling with custom CODARIS theme
- **Monaco Editor** — VS Code editor component (`@monaco-editor/react`)
- **Zustand** — Lightweight global state management
- **TanStack Query** — Server state & caching
- **React Router v7** — Client-side routing

### Backend
- **Express.js** — REST API server
- **Mongoose** — MongoDB ODM with schema validation
- **Passport.js** + **passport-github2** — GitHub OAuth 2.0
- **JWT** + **HttpOnly Cookies** — Secure authentication
- **Winston** — Structured logging
- **Helmet** + **CORS** + **Rate Limiting** — Security middleware

### AI / Services
- **Google Gemini 2.5 Flash** — Primary AI review engine
- **Groq (LLaMA 3.3 70B)** — Fallback AI provider
- **MongoDB Atlas** — Cloud database (free tier)
- **BullMQ** — Background job queue *(Phase 2)*

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB Atlas account (free)
- Gemini API key (free)

### 1. Clone the repository

```bash
git clone https://github.com/AnshGupta-byte/codaris-ai-review.git
cd codaris-ai-review
```

### 2. Install all dependencies

```bash
npm run install:all
```

### 3. Set up environment variables

```bash
cp server/.env.example server/.env
```

Open `server/.env` and fill in your keys:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codaris-ai
GEMINI_API_KEY=your-gemini-api-key      # aistudio.google.com — FREE
GROQ_API_KEY=your-groq-api-key          # console.groq.com — FREE
JWT_SECRET=your-random-secret-string
```

### 4. Get your free API keys

| Key | Link | Cost |
|---|---|---|
| **Gemini API** | [aistudio.google.com](https://aistudio.google.com) | 🆓 Free |
| **Groq API** | [console.groq.com](https://console.groq.com) | 🆓 Free |
| **MongoDB Atlas** | [mongodb.com/atlas](https://mongodb.com/atlas) | 🆓 Free 512MB |

### 5. Start the development servers

```bash
npm run dev
```

| Service | URL |
|---|---|
| 🌐 Frontend | http://localhost:5173 |
| ⚙️ Backend API | http://localhost:5000 |
| 🏥 Health Check | http://localhost:5000/api/health |

---

## 📁 Project Structure

```
codaris-ai-review/
├── client/                          # Vite + React + TypeScript
│   └── src/
│       ├── api/                     # Axios instance & interceptors
│       ├── components/
│       │   └── layout/
│       │       └── Navbar.tsx
│       ├── features/
│       │   ├── editor/
│       │   │   └── CodeEditor.tsx   # Monaco editor component
│       │   └── review/
│       │       ├── ReviewPanel.tsx  # AI review results
│       │       ├── ScoreRing.tsx    # Animated SVG score ring
│       │       └── IssueBadge.tsx   # Severity badge components
│       ├── pages/
│       │   ├── HomePage.tsx         # Landing page
│       │   ├── ReviewPage.tsx       # Main editor + review split pane
│       │   ├── DashboardPage.tsx    # Review history & stats
│       │   └── AuthCallbackPage.tsx # GitHub OAuth callback
│       └── store/
│           ├── authStore.ts         # Zustand auth state
│           └── reviewStore.ts       # Zustand review state
│
├── server/                          # Express.js API
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   ├── logger.js                # Winston logger
│   │   └── passport.js              # GitHub OAuth strategy
│   ├── controllers/
│   │   ├── reviewController.js      # Review CRUD logic
│   │   └── authController.js        # Auth logic
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   ├── rateLimiter.js           # Rate limiting
│   │   └── errorHandler.js         # Global error handler
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   └── Review.js                # Review schema
│   ├── routes/
│   │   ├── auth.js                  # /api/auth/*
│   │   └── review.js                # /api/review/*
│   ├── services/
│   │   └── aiService.js             # Gemini + Groq AI logic
│   └── index.js                     # Express app entry point
│
├── package.json                     # Root scripts (concurrently)
└── .env.example                     # Environment template
```

---

## 🎯 API Endpoints

### Review
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/review` | Optional | Submit code for AI review |
| `GET` | `/api/review` | Required | Get review history |
| `GET` | `/api/review/:id` | Required | Get specific review |

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/auth/github` | Redirect to GitHub OAuth |
| `GET` | `/api/auth/github/callback` | OAuth callback |
| `GET` | `/api/auth/me` | Get current user |
| `POST` | `/api/auth/logout` | Sign out |

### System
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |

---

## 🤖 AI Review Response Format

```json
{
  "score": 72,
  "summary": "The code has a critical SQL injection vulnerability...",
  "issues": [
    {
      "line": 4,
      "severity": "critical",
      "category": "security",
      "message": "SQL injection vulnerability detected",
      "suggestion": "Use parameterized queries instead of string concatenation"
    }
  ],
  "positives": ["Good variable naming", "Proper function structure"],
  "overallSuggestions": ["Add input validation", "Write unit tests"],
  "aiProvider": "gemini-2.5-flash"
}
```

---

## 🗺️ Roadmap

- [x] Monaco Editor integration
- [x] Gemini AI review engine
- [x] Groq fallback provider
- [x] Score ring visualization
- [x] Issue severity badges
- [x] Review history dashboard
- [x] Guest mode (no login required)
- [ ] GitHub OAuth login
- [ ] BullMQ background job queue
- [ ] GitHub PR webhook auto-review
- [ ] Deploy to Vercel + Render
- [ ] Review diff highlighting in editor
- [ ] Export review as PDF

---

## 🤝 Contributing

Contributions are welcome!

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ by **[Ansh Gupta](https://github.com/AnshGupta-byte)**

⭐ **Star this repo** if you found it helpful!

</div>
