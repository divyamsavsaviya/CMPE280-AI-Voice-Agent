# AI Voice Agent 🎙️

An interactive AI-powered voice interviewer application that conducts real-time voice conversations. Built with React (Vite) for the frontend and Node.js/Express for the backend.

## ✨ Features

- **Real-time Voice Interaction**: Talk naturally with the AI agent.
- **Voice-to-Text & Text-to-Voice**: Seamless conversion between speech and text.
- **Interactive UI**: Visual feedback during the conversation (listening, speaking states).
- **History Tracking**: Keeps track of the conversation context.

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- Lucide React (Icons)
- React Router DOM

**Backend:**
- Node.js & Express
- OpenAI API Integration
- CORS & Environmental Config

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd CMPE280-AI-Voice-Agent
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd client
   npm install
   ```

3. **Install Backend Dependencies:**
   ```bash
   cd ../server
   npm install
   ```

### ⚙️ Configuration

1. **Backend Environment:**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=3000
   OPENAI_API_KEY=your_openai_api_key
   NODE_ENV=development
   ```

2. **Frontend Environment:**
   Create a `.env.local` file in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

### 🏃‍♂️ Running Locally

1. **Start the Backend:**
   ```bash
   cd server
   npm run dev
   ```
   Server will start on `http://localhost:3000` (or your specified port).

2. **Start the Frontend:**
   Open a new terminal:
   ```bash
   cd client
   npm run dev
   ```
   Frontend will start on `http://localhost:5173`.

3. **Open Access:**
   Open your browser and navigate to `http://localhost:5173` to use the application.

## 📦 Deployment

For detailed deployment instructions, please refer to [DEPLOYMENT.md](./DEPLOYMENT.md).

We recommend using **Vercel** for the easiest deployment experience.

## 📄 License

ISC
