const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');

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
    const io = req.app.get('io');

    // Validate recipientId format
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ message: 'Invalid recipient ID' });
    }

    // Check if users exist with proper field selection
    const [sender, recipient] = await Promise.all([
      User.findById(senderId)
        .select('username fullName profilePicture outgoingRequests')
        .lean(),
      User.findById(recipientId)
        .select('incomingRequests')
        .lean()
    ]);

    if (!sender || !recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize arrays if they don't exist
    sender.outgoingRequests = sender.outgoingRequests || [];
    recipient.incomingRequests = recipient.incomingRequests || [];

    // Check if request already exists
    if (sender.outgoingRequests.includes(recipientId) || 
        recipient.incomingRequests.includes(senderId)) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Update both users using $addToSet to avoid duplicates
    await Promise.all([
      User.findByIdAndUpdate(senderId, {
        $addToSet: { outgoingRequests: recipientId }
      }, { new: true }),
      
      User.findByIdAndUpdate(recipientId, {
        $addToSet: { incomingRequests: senderId }
      }, { new: true })
    ]);

    // Create notification
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type: 'friend_request',
      message: `${sender.fullName || sender.username} sent you a friend request`,
      relatedEntity: senderId,
      onModel: 'User'
    });

    // Populate notification
    const populatedNotification = await Notification.populate(notification, {
      path: 'sender',
      select: 'username fullName profilePicture'
    });

    // Emit real-time notification
    if (io) {
      io.to(recipientId.toString()).emit('new-notification', populatedNotification);
    }

    return res.status(200).json({ 
      message: 'Friend request sent successfully',
      notification: populatedNotification
    });

  } catch (error) {
    console.error('Error sending friend request:', error);
    return res.status(500).json({ 
      message: error.message || 'Error sending friend request' 
    });
  }
};

exports.handleFriendRequest = async (req, res) => {
  try {
    const { senderId, action } = req.body; // action: 'accept' or 'decline'
    const recipientId = req.user.id;
    const io = req.app.get('io');

    // Check if request exists
    const recipient = await User.findById(recipientId);
    if (!recipient.incomingRequests.includes(senderId)) {
      return res.status(400).json({ message: 'No friend request found' });
    }

    if (action === 'accept') {
      // Add to each other's friends list
      await Promise.all([
        User.findByIdAndUpdate(recipientId, {
          $pull: { incomingRequests: senderId },
          $addToSet: { friends: senderId }
        }),
        User.findByIdAndUpdate(senderId, {
          $pull: { outgoingRequests: recipientId },
          $addToSet: { friends: recipientId }
        })
      ]);

      // Create notification for sender
      const recipientUser = await User.findById(recipientId).select('username fullName profilePicture');
      const notification = await Notification.create({
        recipient: senderId,
        sender: recipientId,
        type: 'friend_request_accepted',
        message: `${recipientUser.fullName || recipientUser.username} accepted your friend request`,
        relatedEntity: recipientId,
        onModel: 'User'
      });

      // Populate notification for real-time emission
      const populatedNotification = await Notification.populate(notification, {
        path: 'sender',
        select: 'username fullName profilePicture'
      });

      // Emit real-time notification to sender
      io.to(senderId.toString()).emit('new-notification', populatedNotification);

      res.status(200).json({ message: 'Friend request accepted' });
    } else {
      // [Previous decline logic remains...]
      res.status(200).json({ message: 'Friend request declined' });
    }
  } catch (error) {
    console.error('Error handling friend request:', error);
    res.status(500).json({ 
      message: error.message || 'Error handling friend request' 
    });
  }
};