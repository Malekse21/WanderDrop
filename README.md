# WanderDrop 🧭

WanderDrop is a collaborative urban exploration platform that encourages spontaneous discovery and gamified travel. It combines AI-driven recommendations with real-world challenges to turn city wandering into a premium, shared adventure.

DEMO VIDEO: https://youtu.be/xWddOa-EDAU 
APP LINK: wander-drop.vercel.app
## 🌟 Core Features

- **The Drop**: Receive a curated, AI-generated travel package (destination, itinerary, and "welcome challenge") that remains a secret until you're ready to reveal it.
- **Urban Gems**: Discover and share "Hidden Gems" — unique locations verified by the community. Gems have different access tiers based on your explorer status.
- **Daily Challenges**: Complete location-based quests to earn XP, level up your profile, and maintain your streak.
- **Wanderer Profile**: A dynamic identity system that calculates your "Explorer Archetype" (e.g., *The Hidden Gem Hunter*, *The Chaos Tourist*) based on your activity patterns.
- **Companion Matching**: Find "Travel Twins" — other users with complementary exploration styles, matched via AI analysis of your trait maps.

## 🛠 Tech Stack

### Frontend
- **React 19** with **TypeScript**
- **Vite** for fast builds and HMR
- **Tailwind CSS 4** for premium, modern aesthetics
- **Framer Motion** for smooth micro-animations and transitions
- **Leaflet & React Leaflet** for interactive map experiences
- **Canvas Confetti** for celebration moments

### Backend & Infrastructure
- **Supabase**: Auth, PostgreSQL database, and Real-time updates.
- **Supabase Edge Functions**: Deno-based serverless functions for AI logic and heavy compute.
- **Groq AI**: Powering the "Explorer Archetype" analysis and companion matching blurb generation.

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- A Supabase Project
- A Groq API Key (for AI features)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Malekse21/WanderDrop.git
   cd WanderDrop
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Supabase and Groq keys (use `.env.example` as a template):
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

- `src/components`: Reusable UI elements (cards, charts, headers, overlays).
- `src/hooks`: Custom React hooks for data fetching, auth, and state management.
- `src/pages`: Core application views (Discovery, Profile, Challenges, Gems).
- `supabase/migrations`: SQL schema definitions and RLS policies.
- `supabase/functions`: Edge functions for AI processing and core logic.

## 📄 License

This project is private and intended for personal use by the WanderDrop team.
