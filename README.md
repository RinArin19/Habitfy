# HabitiFy 🚀

A premium, highly interactive full-stack habit tracking application built with modern web technologies. HabitiFy features a robust achievement gamification system, an interactive backend Admin Dashboard with data visualizations, and an embedded AI assistant powered by Google Gemini.

## 🌟 Key Features

### User Experience
- **Daily Habit Tracking**: Add, toggle, and maintain streaks for infinite habits.
- **Trophy Case & Gamification**: A dynamic achievement engine that unlocks 10 unique visual badges based on your performance, including a `canvas-confetti` explosion for achieving a "Perfect Day"!
- **Karina AI Assistant**: A globally available, floating Chatbot assistant. Powered by Google Gemini (`gemini-2.5-flash`), she features an introverted, funny persona and actually remembers your conversation history across the site.
- **Glassmorphism Design**: Beautiful, responsive UI built with pure CSS, modern variables, and smooth micro-animations.

### Admin System
- **Real-Time Analytics**: An exclusive `/admin` dashboard delivering platform usage statistics.
- **Interactive Recharts**: Visual breakdown of every user's habit progress, instantly toggleable between Pie, Bar, and Line charts.
- **User Management**: Direct UI capabilities to create new users or force password resets for existing ones.

## 🛠️ Tech Stack

**Frontend**
- React (Vite)
- React Router DOM
- Canvas Confetti (Gamification)
- Recharts (Data Visualization)
- Lucide React (Icons)

**Backend**
- Node.js & Express
- SQLite (Local disk Persistence)
- JSON Web Tokens (JWT) & bcrypt (Authentication)
- `@google/genai` SDK (Gemini AI Integration)

## 🚀 Getting Started

### 1. Backend Setup
1. Navigate to the `server/` directory:
   ```bash
   cd server
   npm install
   ```
2. Create a `.env` file in the `server` folder with the following credentials:
   ```env
   PORT=5000
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=Admin@2026
   GEMINI_API_KEY=your_google_ai_studio_key_here
   JWT_SECRET=any_random_string_here
   ```
3. Start the backend:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the `client/` directory:
   ```bash
   cd client
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```

### 3. Usage
- Go to `http://localhost:5173/` to register as a normal user, track habits, unlock badges, and talk to Karina!
- Go to `http://localhost:5173/admin` and log in using the credentials in your `.env` to view the master dashboard.
