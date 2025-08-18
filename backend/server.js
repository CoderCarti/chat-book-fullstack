const express = require('express');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");

dotenv.config();

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://chatbook:chatbook0815@chatbook.eixa1ec.mongodb.net/");
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Handle OPTIONS requests first
app.options('*', cors());

// Enhanced CORS middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://chat-book-silk.vercel.app',
      'https://chat-book-server.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'x-auth-token',  // Explicitly allow your custom header
      'Set-Cookie'
    ],
    exposedHeaders: [
      'Set-Cookie',
      'x-auth-token'  // Expose if needed by the client
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

// Add cookie parser middleware before express.json()
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));