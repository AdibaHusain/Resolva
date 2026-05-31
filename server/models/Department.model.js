import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name:              { type: String, required: true, unique: true },
  code:              { type: String, required: true, unique: true }, // e.g. "ELEC", "IT"
  headName:          { type: String, default: '' },
  headEmail:         { type: String, default: '' },
  avgResolutionHours:{ type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Department', departmentSchema);