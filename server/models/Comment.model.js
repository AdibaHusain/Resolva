import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  complaint:   { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
  author:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',      required: true },
  text:        { type: String, required: true, maxlength: 1000 },
  isInternal:  { type: Boolean, default: false }, // true = sirf admin/staff dekh sakta hai
  attachments: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('Comment', commentSchema);