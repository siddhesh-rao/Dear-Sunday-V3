const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const participantSchema = new mongoose.Schema({
  realName: { type: String, required: true },
  penName: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  bio: { type: String, maxlength: 300, default: '' },
  lettersWritten: { type: Number, default: 0 },
  lettersReceived: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

participantSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

participantSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Participant', participantSchema);
