import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  complaint:   { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action:      { type: String, required: true }, // 'status_change', 'assigned', 'escalated', 'resolved'
  fromStatus:  { type: String },
  toStatus:    { type: String },
  remark:      { type: String },
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);