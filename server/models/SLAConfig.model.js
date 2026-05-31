import mongoose from 'mongoose';

const slaConfigSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['electrical','plumbing','wifi','hostel','academic','food','safety','event','other'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['low','medium','high','critical'],
    required: true,
  },
  resolutionHours: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Ek category + priority ka sirf ek hi config ho
slaConfigSchema.index({ category: 1, priority: 1 }, { unique: true });

export default mongoose.model('SLAConfig', slaConfigSchema);