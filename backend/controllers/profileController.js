const User = require('../models/User');
const { put } = require('@vercel/blob');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { 
      fullName, 
      phoneNumber, 
      dateOfBirth, 
      country, 
      city, 
      postalCode,
      profilePicture 
    } = req.body;

    const updateData = {
      fullName,
      phoneNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      country,
      city,
      postalCode
    };

    // Handle profile picture upload if new image provided
    if (profilePicture && profilePicture.startsWith('data:image')) {
      const blob = await put(
        `profile-pictures/${req.user.id}-${Date.now()}`,
        profilePicture, 
        {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN
        }
      );
      updateData.profilePicture = blob.url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};