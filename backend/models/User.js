const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Auth
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Profile Form Page Data
  fullName: { type: String, required: true },
  age: { type: Number },
  state: { type: String },
  district: { type: String },
  educationLevel: { type: String }, // High School, Undergraduate, Postgraduate
  percentage: { type: Number },
  casteCategory: { type: String }, // General, OBC, SC, ST
  minorityStatus: { type: Boolean, default: false },
  familyIncome: { type: Number },
  firstGraduate: { type: Boolean, default: false },
  singleGirlChild: { type: Boolean, default: false },
  disabilityStatus: { type: Boolean, default: false },
  locationType: { type: String, enum: ['Rural', 'Urban'] },
  phone: { type: String },
  
  // Document base64 strings
  aadhaarDoc: { type: String },
  incomeCertificate: { type: String },
  marksheet: { type: String },

  // Added Logic fields
  dropout_risk_score: { type: Number, default: 0 },
  applied_schemes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
