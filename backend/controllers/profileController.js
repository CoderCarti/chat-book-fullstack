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

    if (profilePicture === "remove") {
      // Explicit removal
      updateData.profilePicture = "";
    } else if (profilePicture && profilePicture.startsWith("data:image")) {
      // New upload → store to Vercel Blob
      const blob = await put(
        `profile-pictures/${req.user.id}-${Date.now()}.${profilePicture.split(";")[0].split("/")[1]}`,
        profilePicture,
        {
          access: "public",
          token: process.env.BLOB_READ_WRITE_TOKEN,
        }
      );
      updateData.profilePicture = blob.url;
    } else if (profilePicture && profilePicture.startsWith("http")) {
      // Already an existing URL → keep as is
      updateData.profilePicture = profilePicture;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};