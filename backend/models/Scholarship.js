const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  scheme_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  eligibility_criteria: {
    min_class: { type: Number },
    max_class: { type: Number },
    father_occupation_allowed: [{ type: String }], // Array of allowed occupations e.g. ["Farmer", "Laborer"]
    min_marks_percentage: { type: Number, default: 0 },
  },
  amount: { type: Number, required: true },
  deadline: { type: Date, required: true },
  description: { type: String, required: true },
  application_link: { type: String },
  social_uplift_score: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Scholarship', scholarshipSchema);
