const express = require('express');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const http = require('http');
const socketio = require('socket.io');

dotenv.config();

// Initialize Express app first
const app = express();

// Then create HTTP server
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://chat-book-silk.vercel.app',
      'https://chat-book-server.vercel.app'
    ],
    methods: ["GET", "POST"],
    credentials: true,
    transports: ['websocket', 'polling'] // Explicitly enable both transports
  },
  path: '/socket.io', // Explicit path
  serveClient: false // Don't serve client files
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join user to their own room for private notifications
  socket.on('join-user', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.set('io', io);

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
      'x-auth-token',
      'Set-Cookie'
    ],
    exposedHeaders: [
      'Set-Cookie',
      'x-auth-token'
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
app.use("/api/notifications", notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Start server with server.listen() instead of app.listen()
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));