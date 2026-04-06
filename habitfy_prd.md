# Standardized PRD: HabitiFy 🚀

## 1. Product Overview
HabitiFy is a modern, web-based habit tracking application designed with a "glassmorphism" aesthetic. It empowers users to build better routines through simple habit logging, visual progress tracking, and personalized AI coaching.

## 2. Target Audience
-   Individuals looking to track daily habits and routines.
-   People interested in data-driven self-improvement.
-   Users who appreciate modern, visually engaging web interfaces.
-   Admins who need to manage the user base and monitor overall engagement.

## 3. Core Features & Functional Requirements

### 3.1. User Authentication
-   **Register**: Users can create an account with a unique username and password.
-   **Login**: Secure login with JWT-based sessions.
-   **Logout**: Session termination and local storage cleanup.

### 3.2. Habit Management
-   **Create**: Add new habits with a title.
-   **Read**: View all active habits on a personal dashboard.
-   **Update (Complete)**: Toggle a "completed today" status for each habit.
-   **Delete**: Remove habits from the dashboard.
-   **Streak Tracking**: Tracks consecutive days of habit completion (handled by backend logic).

### 3.3. Statistics & Analytics
-   **Progress Charts**: Recharts integration to show habit completion trends over time.
-   **Daily Summary**: Overview of today's progress (e.g., "75% of habits done").

### 3.4. Admin Panel
-   **Admin Login**: Separate login for administrators using predefined credentials.
-   **Global Dashboard**: Overview of total users, active habits, and today's total completions.
-   **User Management**: CRUD operations on users (Create, view, update, delete).

### 3.5. AI Chatbot ("Karina")
-   **Persona**: Karina is an introverted, caring, and emotionally intelligent habit coach.
-   **Conversation**: Real-time chat powered by Google Gemini API.
-   **Context**: Awareness of typical habit-building challenges.

### 3.6. Notifications
-   **Web Push**: Support for browser-based push notifications for reminders.

## 4. Technical Stack
-   **Frontend**: React (Vite), React Router, Lucide-React, Recharts, Canvas-Confetti.
-   **Backend**: Node.js, Express.js.
-   **Database**: PostgreSQL (Supabase) with SQLite fallback/development support.
-   **Authentication**: JWT (JSON Web Tokens) and bcrypt password hashing.
-   **AI Service**: Google Gemini AI API.

## 5. Design System
-   **Style**: Glassmorphism (semi-transparent backgrounds, blur effects).
-   **Animations**: Slide-up transitions, hover effects, and confetti on completion.
-   **Responsiveness**: Mobile-first design for various screen sizes.
