// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['friend_request', 'friend_request_accepted', 'like', 'comment', 'message']
  },
  message: {
    type: String,
    required: true
  },
  relatedEntity: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'onModel'
  },
  onModel: {
    type: String,
    enum: ['User', 'Post', 'Comment']
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;