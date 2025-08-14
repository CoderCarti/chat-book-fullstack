const express = require('express');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

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

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://chat-book-silk.vercel.app',
      'https://chat-book-server.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));