const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  scheme_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  state: { type: String },
  category: { type: String },
  eligibility_criteria: {
    min_class: { type: Number },
    max_class: { type: Number },
    father_occupation_allowed: [{ type: String }], // Array of allowed occupations e.g. ["Farmer", "Laborer"]
    min_marks_percentage: { type: Number, default: 0 },
    income_limit: { type: Number, default: null },
    caste_eligibility: [{ type: String }],
    eligible_for: [{ type: String }],
    minority_only: { type: Boolean, default: false },
    single_girl_child_only: { type: Boolean, default: false },
    first_graduate_only: { type: Boolean, default: false },
  },
  amount: { type: Number, required: true },
  deadline: { type: Date, required: true },
  description: { type: String, required: true },
  benefits: { type: String },
  renewable: { type: Boolean, default: false },
  application_link: { type: String },
  social_uplift_score: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Scholarship', scholarshipSchema);
