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
      profilePicture: ''
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

// Add this to your authController.js
exports.getSuggestedFriends = async (req, res) => {
  try {
    // Get the current user's ID from the auth middleware
    const currentUserId = req.user.id;
    
    // Find users who are not friends with the current user
    // For now, we'll just get all users except the current user
    // In a real app, you'd want more sophisticated logic (mutual friends, location, etc.)
    const users = await User.find({ 
      _id: { $ne: currentUserId } 
    }).select('-password -__v'); // Exclude sensitive fields

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching suggested friends:', error);
    res.status(500).json({ 
      message: error.message || 'Error fetching suggested friends' 
    });
  }
};

// Add to authController.js
exports.sendFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user.id;

    // Check if users exist
    const [sender, recipient] = await Promise.all([
      User.findById(senderId),
      User.findById(recipientId)
    ]);

    if (!sender || !recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if request already exists
    if (sender.outgoingRequests.includes(recipientId) || 
        recipient.incomingRequests.includes(senderId)) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Update both users
    await Promise.all([
      User.findByIdAndUpdate(senderId, { 
        $addToSet: { outgoingRequests: recipientId } 
      }),
      User.findByIdAndUpdate(recipientId, { 
        $addToSet: { incomingRequests: senderId } 
      })
    ]);

    res.status(200).json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ 
      message: error.message || 'Error sending friend request' 
    });
  }
};