// controllers/notificationController.js
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

exports.getUserNotifications = async (userId, limit = 20) => {
  try {
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'username fullName profilePicture');
      
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

exports.markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { $set: { read: true } },
      { new: true }
    );
    
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

exports.markAllAsRead = async (userId) => {
  try {
    await Notification.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

exports.deleteNotification = async (notificationId, userId) => {
  try {
    await Notification.deleteOne({ _id: notificationId, recipient: userId });
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};