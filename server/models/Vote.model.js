import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',      required: true },
  type:      { type: String, enum: ['upvote'], default: 'upvote' },
}, { timestamps: true });

// Ek user ek complaint pe sirf ek hi vote de sakta hai
voteSchema.index({ complaint: 1, user: 1 }, { unique: true });

export default mongoose.model('Vote', voteSchema);