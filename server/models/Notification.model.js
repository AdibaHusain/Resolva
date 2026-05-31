import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User',      required: true },
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', default: null },
  type:      {
    type: String,
    enum: ['complaint_assigned','status_updated','new_complaint','ai_analyzed','sla_breach'],
    required: true,
  },
  message:  { type: String, required: true },
  isRead:   { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1 });

export default mongoose.model('Notification', notificationSchema);