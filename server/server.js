const express = require("express");
const cors = require("cors");
const sessionRoutes = require("./routes/session");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL, // Allow configured frontend
    'https://cmpe-280-ai-voice-agent.vercel.app',
    'http://localhost:5173',
    'http://localhost:4173'
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/session", sessionRoutes);
app.use("/api/feedback", require("./routes/feedback"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
