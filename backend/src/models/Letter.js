const mongoose = require('mongoose');

const letterSchema = new mongoose.Schema({
  prompt: { type: mongoose.Schema.Types.ObjectId, ref: 'Prompt', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', default: null },
  content: { type: String, required: true, minlength: 50, maxlength: 5000 },
  adminNote: { type: String, maxlength: 500, default: '' },

  // Status flow: draft → submitted → paired → delivered
  status: {
    type: String,
    enum: ['draft', 'submitted', 'paired', 'delivered'],
    default: 'submitted'
  },

  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  deliveredAt: { type: Date },
  pairedAt: { type: Date },

  // Only admin can see real author — recipient only sees pen name
  authorPenName: { type: String },
  recipientPenName: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('Letter', letterSchema);
