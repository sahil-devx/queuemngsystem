const mongoose = require('mongoose');
const Queue = require('./models/Queue');

async function checkQueues() {
  try {
    await mongoose.connect('mongodb://localhost:27017/smartqueue');
    console.log('Connected to MongoDB');

    const queues = await Queue.find({});
    console.log('Found', queues.length, 'queues in database:');
    queues.forEach((q, i) => {
      console.log(`${i+1}. ${q.name} - Status: ${q.status} - ID: ${q._id} - Created by: ${q.createdBy}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkQueues();