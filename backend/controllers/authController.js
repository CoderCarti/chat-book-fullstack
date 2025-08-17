const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email 
          ? "Email already in use" 
          : "Username already taken"
      });
    }

    // Create new user with minimal required fields
    const user = await User.create({ 
      username, 
      email, 
      password,
      // Set default profile picture from environment if available
      profilePicture: process.env.DEFAULT_PROFILE_PIC || ''
    });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { 
      expiresIn: "1d" 
    });

    // Return token and basic user info
    res.status(201).json({ 
      token, 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message || 'Registration failed' 
    });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { 
      expiresIn: "1d" 
    });

    // Return token and user data (excluding sensitive info)
    res.status(200).json({ 
      token, 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        fullName: user.fullName
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: error.message || 'Login failed' 
    });
  }
};