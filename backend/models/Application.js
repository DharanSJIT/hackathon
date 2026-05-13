const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user_email: { type: String, required: true, index: true },
  scheme_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship', required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Submitted'], default: 'Pending' },
  reminder_sent: { type: Boolean, default: false },
}, { timestamps: true });

applicationSchema.index({ user_email: 1, scheme_id: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
