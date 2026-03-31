const mongoose = require('mongoose');

const queueEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    queueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Queue', required: true },
    joinedAt: { type: Date, required: true, default: () => new Date() },
    status: { type: String, enum: ['joined', 'completed'], default: 'joined', index: true },
    completedAt: { type: Date },
    name: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, default: '' },
    subject: { type: String, default: '' }
  },
  { timestamps: false }
);

// Keep insertion order fast for "next in queue" operations.
queueEntrySchema.index({ queueId: 1, joinedAt: 1 });
queueEntrySchema.index({ userId: 1, status: 1 });
// Prevent joining the same queue multiple times.
queueEntrySchema.index({ userId: 1, queueId: 1 }, { unique: true });

module.exports = mongoose.model('QueueEntry', queueEntrySchema);

