# AI Professor - Modern React Frontend

A production-quality, dark-themed React frontend for the AI Professor system.

## ✨ Features

- **Dark Theme UI** - Beautiful neon-accented dark design
- **Dashboard** - Progress tracking, stats, weak/strong topics
- **AI Chat** - ChatGPT-style interface with source citations
- **Leaderboard** - Animated podium and rankings table
- **Recommendations** - AI-generated study suggestions
- **File Upload** - Drag & drop PDF upload with processing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Backend running on http://localhost:8000

### Installation

```bash
# Navigate to frontend
cd frontend-react

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at **http://localhost:3000**

## 📁 Project Structure

```
frontend-react/
├── index.html              # HTML entry point
├── package.json            # Dependencies
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
│
└── src/
    ├── main.tsx            # React entry point
    ├── App.tsx             # Routes & providers
    ├── index.css           # Global styles
    │
    ├── components/
    │   ├── Layout.tsx      # Main layout wrapper
    │   ├── Sidebar.tsx     # Navigation sidebar
    │   ├── Card.tsx        # Reusable card component
    │   ├── ProgressBar.tsx # Progress indicator
    │   └── TopicBadge.tsx  # Topic tag component
    │
    ├── pages/
    │   ├── LoginPage.tsx        # Auth screen
    │   ├── DashboardPage.tsx    # Main dashboard
    │   ├── ChatPage.tsx         # AI chat interface
    │   ├── LeaderboardPage.tsx  # Rankings
    │   ├── RecommendationsPage.tsx  # Study suggestions
    │   └── UploadPage.tsx       # File upload
    │
    ├── hooks/
    │   └── useAuth.tsx     # Authentication context
    │
    └── lib/
        ├── api.ts          # API client (axios)
        └── utils.ts        # Helper functions
```

## 🎨 Design System

### Colors
- **Background**: `#0f172a` to `#020617` gradient
- **Neon Blue**: `#00d4ff`
- **Neon Purple**: `#a855f7`
- **Neon Pink**: `#ec4899`
- **Neon Green**: `#22c55e`

### Components
- Glass morphism cards with backdrop blur
- Gradient buttons with glow effects
- Animated transitions
- Responsive design

## 🔌 API Integration

The frontend connects to FastAPI backend at `http://localhost:8000`

### Endpoints Used:
- `POST /auth/login` - Authentication
- `POST /auth/signup` - Registration
- `GET /auth/me` - Current user
- `GET /courses/` - List courses
- `POST /qa/ask-simple` - AI Q&A
- `GET /submissions/leaderboard/{id}` - Rankings
- `GET /students/dashboard` - Dashboard data
- `GET /students/recommendations/{id}` - Suggestions
- `POST /materials/upload/{id}` - File upload
- `POST /ingest/{id}` - Process materials

## 🛠️ Development

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📱 Screenshots

### Login Page
- Split screen design
- Feature highlights
- Glassmorphism cards

### Dashboard
- Stats cards with gradients
- Progress visualization
- Weak/strong topics
- Recent activity feed

### AI Chat
- ChatGPT-style interface
- Message bubbles
- Source citations
- Typing indicator

### Leaderboard
- Animated podium
- Rankings table
- Progress bars
- Activity metrics

## 🎯 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons
