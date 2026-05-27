import mongoose from 'mongoose';

const CATEGORIES = ['electrical','plumbing','wifi','hostel','academic','food','safety','event','other'];
const STATUSES   = ['open','assigned','in_progress','resolved','verified','rejected'];
const PRIORITIES = ['low','medium','high','critical'];

const complaintSchema = new mongoose.Schema({
  title:         { type: String, required: true, trim: true },
  description:   { type: String, required: true },
  category:      { type: String, enum: CATEGORIES, required: true },
  status:        { type: String, enum: STATUSES, default: 'open' },
  priority:      { type: String, enum: PRIORITIES, default: 'medium' },
  severityScore: { type: Number, min: 1, max: 10, default: 5 }, // AI-assigned
  raisedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // null if anonymous
  isAnonymous:   { type: Boolean, default: false },
  assignedTo:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  department:    { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  mediaUrls:     [{ type: String }],
  location:      { type: String },
  voteCount:     { type: Number, default: 0 },
  slaDeadline:   { type: Date },
  slaBreach:     { type: Boolean, default: false },
  resolvedAt:    { type: Date },
  closedRemark:  { type: String },
}, { timestamps: true });

// Text index for search
complaintSchema.index({ title: 'text', description: 'text' });
complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ raisedBy: 1 });
complaintSchema.index({ assignedTo: 1 });

export default mongoose.model('Complaint', complaintSchema);