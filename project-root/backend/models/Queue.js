const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 25
  },
  category: {
    type: String,
    required: true,
    enum: ['health', 'education', 'banking', 'government', 'retail', 'other'],
    default: 'other'
  },
  capacity: {
    type: Number,
    min: 10,
    max: 200,
    default: 50
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    position: Number
  }],
  servedUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    servedAt: {
      type: Date,
      default: Date.now
    },
    waitTime: Number // in minutes
  }],
  stats: {
    totalJoined: {
      type: Number,
      default: 0
    },
    totalServed: {
      type: Number,
      default: 0
    },
    averageWaitTime: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
queueSchema.index({ createdBy: 1, status: 1 });
queueSchema.index({ category: 1 });

module.exports = mongoose.model('Queue', queueSchema);