const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheme_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship', required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Submitted'], default: 'Pending' },
  reminder_sent: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
