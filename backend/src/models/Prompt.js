const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 200 },
  body: { type: String, maxlength: 1000 },
  weekOf: { type: Date, required: true },
  isActive: { type: Boolean, default: false },
  submissionDeadline: { type: Date },
  totalSubmissions: { type: Number, default: 0 },
  totalPairings: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Prompt', promptSchema);
