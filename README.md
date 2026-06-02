<div align="center">

# Codaris AI
### AI-Powered Code Review — Free, Instant, No Credit Card

[![Live Demo](https://img.shields.io/badge/Live_Demo-codaris--ai--review.vercel.app-c96442?style=for-the-badge&logo=vercel&logoColor=white)](https://codaris-ai-review.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/atlas)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br />

**Paste any code. Get instant AI-powered feedback.**

Security vulnerabilities · Line-by-line issues · Fix suggestions · Quality score — all in seconds.

[**→ Try it live**](https://codaris-ai-review.vercel.app)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Code Review** | Powered by Google Gemini 2.5 Flash with Groq (LLaMA 3.3 70B) as automatic fallback |
| 🖥️ **Monaco Editor** | Full VS Code editor experience in the browser with syntax highlighting |
| 📊 **Quality Score** | 0–100 score with animated ring visualization and label (Excellent / Good / Fair / Poor) |
| 📍 **Line Numbers** | Every issue is pinpointed to the exact line in your code |
| 💡 **Fix Suggestions** | Each issue includes a plain-English fix and a corrected code snippet to copy |
| 🔴 **Severity Badges** | Critical · Warning · Info · Suggestion — color-coded and categorised |
| 🌐 **15+ Languages** | JavaScript, TypeScript, Python, Java, Go, Rust, C++, PHP, Ruby, Swift, Kotlin & more |
| 🔒 **Security Analysis** | Detects SQL injection, XSS, auth flaws, data exposure, and 50+ vulnerability patterns |
| 📜 **Review History** | All reviews saved per-user with a stats dashboard (total reviews, avg score, issues caught) |
| 🐙 **GitHub OAuth** | One-click sign-in with GitHub — reviews linked to your account |
| 🕒 **Remember Me** | Toggle to stay signed in for 30 days, or session-only (7 days) |
| ⚡ **Guest Mode** | Review code without signing in — no account required |
| 📱 **Responsive** | Clean, professional UI that works on desktop and mobile |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript** — Type-safe component-based UI
- **Vite 6** — Lightning-fast dev server & production bundler
- **Tailwind CSS** — Utility-first styling with custom warm design tokens
- **Monaco Editor** — VS Code editor component (`@monaco-editor/react`)
- **Zustand** — Lightweight global state (auth + review state)
- **TanStack Query** — Server state, caching & background refetching
- **React Router v7** — Client-side routing with protected routes
- **React Hot Toast** — Elegant toast notifications
- **Instrument Serif + Inter** — Professional typography (Google Fonts)

### Backend
- **Express.js** — REST API server
- **Mongoose** — MongoDB ODM with schema validation
- **Passport.js** + **passport-github2** — GitHub OAuth 2.0
- **JWT** + **HttpOnly Cookies** — Secure, stateless authentication
- **Winston** — Structured JSON logging
- **Helmet** + **CORS** + **Express Rate Limit** — Security hardening
- **cookie-parser** — Cookie parsing middleware

### AI / Services
- **Google Gemini 2.5 Flash** — Primary AI review engine (structured JSON output)
- **Groq (LLaMA 3.3 70B)** — Automatic fallback AI provider
- **MongoDB Atlas** — Cloud database (free tier)

### Deployment
- **Vercel** — Frontend hosting with automatic deploys from GitHub
- **Render** — Backend hosting with auto-deploy
- **MongoDB Atlas** — Cloud database

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB Atlas account (free)
- Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))
- GitHub OAuth App credentials

### 1. Clone the repository

```bash
git clone https://github.com/AnshGupta-byte/codaris-ai-review.git
cd codaris-ai-review
```

### 2. Install all dependencies

```bash
npm run install:all
```

### 3. Configure environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your credentials:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codaris-ai

# AI Providers (both are free)
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key

# Auth
JWT_SECRET=your-long-random-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# URLs
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

For the frontend, create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### 4. Get your free API keys

| Key | Where to get it | Cost |
|---|---|---|
| **Gemini API** | [aistudio.google.com](https://aistudio.google.com) | 🆓 Free |
| **Groq API** | [console.groq.com](https://console.groq.com) | 🆓 Free |
| **MongoDB Atlas** | [mongodb.com/atlas](https://mongodb.com/atlas) | 🆓 Free 512MB |
| **GitHub OAuth App** | [github.com/settings/developers](https://github.com/settings/developers) | 🆓 Free |

### 5. Run the development servers

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
├── client/                          # Vite + React + TypeScript frontend
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.ts     # Axios with base URL + credentials
│   │   ├── components/
│   │   │   └── layout/
│   │   │       └── Navbar.tsx       # Top nav with auth + remember me
│   │   ├── features/
│   │   │   ├── editor/
│   │   │   │   └── CodeEditor.tsx   # Monaco editor + language selector
│   │   │   └── review/
│   │   │       ├── ReviewPanel.tsx  # Full AI review results panel
│   │   │       ├── ScoreRing.tsx    # Animated SVG quality score ring
│   │   │       └── IssueBadge.tsx   # Issue cards with line numbers + fix code
│   │   ├── pages/
│   │   │   ├── HomePage.tsx         # Landing page with features + footer
│   │   │   ├── ReviewPage.tsx       # Editor + review split-pane layout
│   │   │   ├── DashboardPage.tsx    # Review history + stats
│   │   │   └── AuthCallbackPage.tsx # GitHub OAuth callback handler
│   │   ├── store/
│   │   │   ├── authStore.ts         # Zustand auth state (persisted)
│   │   │   └── reviewStore.ts       # Zustand review state + history
│   │   ├── App.tsx                  # Routes + auth initialisation
│   │   ├── index.css                # Design system (tokens, components)
│   │   └── vite-env.d.ts            # ImportMeta type declarations
│   ├── tailwind.config.js           # Custom warm colour palette
│   ├── vercel.json                  # SPA routing rewrites for Vercel
│   └── vite.config.ts
│
├── server/                          # Express.js REST API
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   ├── logger.js                # Winston structured logger
│   │   └── passport.js              # GitHub OAuth strategy
│   ├── controllers/
│   │   ├── reviewController.js      # Review CRUD + AI trigger
│   │   └── authController.js        # Login, callback, logout, me
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification middleware
│   │   ├── rateLimiter.js           # Per-IP rate limiting
│   │   └── errorHandler.js          # Global error handler
│   ├── models/
│   │   ├── User.js                  # User schema (GitHub profile)
│   │   └── Review.js                # Review schema
│   ├── routes/
│   │   ├── auth.js                  # /api/auth/* routes
│   │   └── review.js                # /api/review/* routes
│   ├── services/
│   │   └── aiService.js             # Gemini + Groq AI logic + prompt builder
│   └── index.js                     # Express app, CORS, middleware setup
│
├── render.yaml                      # Render backend deployment config
├── package.json                     # Root scripts (concurrently)
└── README.md
```

---

## 🎯 API Endpoints

### Review
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/review` | Optional | Submit code for AI review |
| `GET` | `/api/review` | Required | Get paginated review history |
| `GET` | `/api/review/:id` | Required | Get a specific review |

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/auth/github` | Start GitHub OAuth flow (accepts `?remember=1`) |
| `GET` | `/api/auth/github/callback` | OAuth callback — issues JWT cookie |
| `GET` | `/api/auth/me` | Get current authenticated user |
| `POST` | `/api/auth/logout` | Clear JWT cookie and sign out |

### System
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |

---

## 🤖 AI Review Response Format

The AI returns structured JSON with full issue details including exact line numbers and fix snippets:

```json
{
  "score": 72,
  "summary": "The code has a critical SQL injection vulnerability and leaks sensitive data via console.log. Overall structure is reasonable but needs security hardening.",
  "issues": [
    {
      "line": 4,
      "severity": "critical",
      "category": "security",
      "message": "SQL injection vulnerability — user input is concatenated directly into the query string.",
      "suggestion": "Use parameterised queries to prevent SQL injection.",
      "fix": "const query = 'SELECT * FROM users WHERE id = ?';\ndb.execute(query, [userId]);"
    },
    {
      "line": 7,
      "severity": "warning",
      "category": "security",
      "message": "console.log exposes result.password in production logs.",
      "suggestion": "Remove the console.log or guard it behind a NODE_ENV check.",
      "fix": "if (process.env.NODE_ENV !== 'production') {\n  console.log('User found:', result.id);\n}"
    }
  ],
  "positives": [
    "Function is well-named and has a single clear responsibility."
  ],
  "overallSuggestions": [
    "Add input validation before the database call.",
    "Consider returning only the fields your client needs, not the full user row."
  ],
  "aiProvider": "gemini-2.5-flash",
  "tokensUsed": 1248
}
```

---

## 🗺️ Roadmap

- [x] Monaco Editor with syntax highlighting and 15+ languages
- [x] Google Gemini 2.5 Flash AI review engine
- [x] Groq (LLaMA 3.3 70B) automatic fallback provider
- [x] Quality score ring with colour-coded labels
- [x] Issue severity badges (Critical · Warning · Info · Suggestion)
- [x] Line-number pinpointing for every issue
- [x] Fix code snippets — exact replacement code per issue
- [x] Review history dashboard with stats
- [x] Guest mode — no login required
- [x] GitHub OAuth login
- [x] Remember Me — 30-day or 7-day session toggle
- [x] JWT in HttpOnly cookies — secure, stateless auth
- [x] Deployed to Vercel (frontend) + Render (backend)
- [x] Professional Claude-inspired design — warm palette, Instrument Serif
- [ ] Solve with AI — describe a problem, get working code back
- [ ] Review diff highlighting in editor
- [ ] GitHub PR webhook auto-review
- [ ] Export review as PDF

---

## ☁️ Deployment

### Frontend — Vercel
1. Import the GitHub repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `client`
3. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com`
4. Deploy — auto-redeploys on every push to `main`

### Backend — Render
1. Create a new **Web Service** on [render.com](https://render.com)
2. Set **Root Directory** to `server`
3. **Build Command**: `npm install`
4. **Start Command**: `node index.js`
5. Add all environment variables from `server/.env.example`
6. Set MongoDB Atlas network access to `0.0.0.0/0` (Render uses dynamic IPs)

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

Built by **[Ansh Kumar Gupta](https://www.linkedin.com/in/anshkrgupta/)**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-anshkrgupta-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/anshkrgupta/)
[![GitHub](https://img.shields.io/badge/GitHub-AnshGupta--byte-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/AnshGupta-byte)
[![Email](https://img.shields.io/badge/Email-anshg397@gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:anshg397@gmail.com)

⭐ **Star this repo** if you found it useful!

</div>
