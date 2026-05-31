import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const userSchema = new mongoose.Schema({
    name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String, required: true, minlength: 6 },
  role:         { type: String, enum: ['student', 'admin', 'staff'], default: 'student' },
  rollNumber:   { type: String },           // students
  department:   { type: String },           // staff/admin context
  hostelBlock:  { type: String },           // students
  profileImage: { type: String, default: '' },
  isVerified:   { type: Boolean, default: false },
  isActive:     { type: Boolean, default: true },
  refreshToken: { type: String },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

export default mongoose.model('User', userSchema);