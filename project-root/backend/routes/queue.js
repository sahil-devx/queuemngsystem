const express = require('express');
const mongoose = require('mongoose');
const Queue = require('../models/Queue');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a new queue
router.post('/create', auth, async (req, res) => {
  try {
    const { name, description, category, capacity } = req.body;

    // Validate required fields
    if (!name || !description || !category) {
      return res.status(400).json({ message: 'Name, description, and category are required' });
    }

    // Create new queue
    const queue = new Queue({
      name: name.trim(),
      description: description.trim(),
      category,
      capacity: capacity || 50,
      createdBy: req.user._id
    });

    await queue.save();

    res.status(201).json({
      message: 'Queue created successfully',
      queue: {
        id: queue._id,
        name: queue.name,
        description: queue.description,
        category: queue.category,
        capacity: queue.capacity,
        status: queue.status,
        createdAt: queue.createdAt
      }
    });
  } catch (error) {
    console.error('Create queue error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all queues for the authenticated admin
router.get('/my-queues', auth, async (req, res) => {
  try {
    const queues = await Queue.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .select('name description category capacity status currentUsers servedUsers stats createdAt');

    res.json({ queues });
  } catch (error) {
    console.error('Get queues error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all queues that the authenticated user has joined
router.get('/my-joined', auth, async (req, res) => {
  try {
    const queues = await Queue.find({
      'currentUsers.userId': req.user._id,
      status: 'active'
    })
      .populate('createdBy', 'name')
      .sort({ 'currentUsers.joinedAt': -1 })
      .select('name description category capacity status currentUsers servedUsers stats createdAt');

    // Filter and format the queues to include user's position
    const formattedQueues = queues.map(queue => {
      const userInQueue = queue.currentUsers.find(user => user.userId.toString() === req.user._id.toString());
      return {
        id: queue._id,
        name: queue.name,
        description: queue.description,
        category: queue.category,
        capacity: queue.capacity,
        status: queue.status,
        position: userInQueue.position,
        peopleAhead: userInQueue.position - 1,
        estimatedWaitTime: calculateEstimatedWaitTime(queue),
        joinedAt: userInQueue.joinedAt,
        createdAt: queue.createdAt
      };
    });

    res.json({ queues: formattedQueues });
  } catch (error) {
    console.error('Get joined queues error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get queue details by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const queue = await Queue.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    }).populate('currentUsers.userId', 'name email');

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    res.json({ queue });
  } catch (error) {
    console.error('Get queue error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update queue status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'paused', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const queue = await Queue.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { status },
      { new: true }
    );

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    res.json({ message: 'Queue status updated', queue });
  } catch (error) {
    console.error('Update queue status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete queue
router.delete('/:id', auth, async (req, res) => {
  try {
    const queue = await Queue.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    res.json({ message: 'Queue deleted successfully' });
  } catch (error) {
    console.error('Delete queue error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search for a queue by ID (public route for users to find queues)
router.get('/search/:queueId', async (req, res) => {
  try {
    const queueId = req.params.queueId.trim();

    if (!queueId) {
      return res.status(400).json({ message: 'Queue ID is required' });
    }

    // Find queue by MongoDB _id
    let queue;

    // Try to find by _id first
    if (mongoose.Types.ObjectId.isValid(queueId)) {
      queue = await Queue.findById(queueId).populate('createdBy', 'name');
    }

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    // Check if queue is active
    if (queue.status !== 'active') {
      return res.status(404).json({ message: 'Queue is not currently active' });
    }

    // Return queue info (without sensitive data)
    res.json({
      queue: {
        id: queue._id,
        name: queue.name,
        description: queue.description,
        category: queue.category,
        capacity: queue.capacity,
        status: queue.status,
        currentUsersCount: queue.currentUsers.length,
        createdAt: queue.createdAt,
        position: queue.currentUsers.length + 1, // Next position
        estimatedWaitTime: calculateEstimatedWaitTime(queue)
      }
    });
  } catch (error) {
    console.error('Search queue error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Join a queue (requires authentication)
router.post('/:id/join', auth, async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    if (queue.status !== 'active') {
      return res.status(400).json({ message: 'Queue is not currently active' });
    }

    if (queue.currentUsers.length >= queue.capacity) {
      return res.status(400).json({ message: 'Queue is at full capacity' });
    }

    // Check if user is already in the queue
    const alreadyInQueue = queue.currentUsers.some(user => user.userId.toString() === req.user._id.toString());
    if (alreadyInQueue) {
      return res.status(400).json({ message: 'You are already in this queue' });
    }

    // Add user to queue
    const position = queue.currentUsers.length + 1;
    queue.currentUsers.push({
      userId: req.user._id,
      position: position
    });

    // Update stats
    queue.stats.totalJoined += 1;

    await queue.save();

    res.json({
      message: 'Successfully joined the queue',
      position: position,
      estimatedWaitTime: calculateEstimatedWaitTime(queue)
    });
  } catch (error) {
    console.error('Join queue error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Leave a queue (requires authentication)
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    // Find the user in the queue
    const userIndex = queue.currentUsers.findIndex(user => user.userId.toString() === req.user._id.toString());
    if (userIndex === -1) {
      return res.status(400).json({ message: 'You are not in this queue' });
    }

    // Remove user from queue
    const removedUser = queue.currentUsers.splice(userIndex, 1)[0];

    // Update positions for remaining users
    queue.currentUsers.forEach((user, index) => {
      user.position = index + 1;
    });

    await queue.save();

    res.json({
      message: 'Successfully left the queue',
      previousPosition: removedUser.position
    });
  } catch (error) {
    console.error('Leave queue error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Call next user in queue (admin only)
router.post('/:id/call-next', auth, async (req, res) => {
  try {
    const queue = await Queue.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    if (queue.status !== 'active') {
      return res.status(400).json({ message: 'Queue is not active' });
    }

    if (queue.currentUsers.length === 0) {
      return res.status(400).json({ message: 'No users in queue' });
    }

    // Get the next user (first in queue)
    const nextUser = queue.currentUsers.shift();

    // Add to served users
    queue.servedUsers.push({
      userId: nextUser.userId,
      servedAt: new Date(),
      waitTime: Date.now() - nextUser.joinedAt.getTime()
    });

    // Update positions for remaining users
    queue.currentUsers.forEach((user, index) => {
      user.position = index + 1;
    });

    // Update stats
    queue.stats.totalServed += 1;
    const servedCount = queue.servedUsers.length;
    if (servedCount > 0) {
      const totalWaitTime = queue.servedUsers.reduce((sum, user) => sum + user.waitTime, 0);
      queue.stats.averageWaitTime = Math.round(totalWaitTime / servedCount / 1000 / 60); // Convert to minutes
    }

    await queue.save();

    res.json({
      message: 'Next user called successfully',
      servedUser: {
        position: nextUser.position,
        waitTime: Math.round((Date.now() - nextUser.joinedAt.getTime()) / 1000 / 60) // Wait time in minutes
      }
    });
  } catch (error) {
    console.error('Call next user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to calculate estimated wait time
function calculateEstimatedWaitTime(queue) {
  const avgWaitTime = queue.stats?.averageWaitTime || 15; // Default 15 minutes
  const position = queue.currentUsers.length + 1;
  return Math.round(avgWaitTime * position);
}

module.exports = router;