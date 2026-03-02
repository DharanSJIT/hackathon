const mongoose = require('mongoose');
const Scholarship = require('./models/Scholarship');
// Load environment variables if not loaded
require('dotenv').config();

const schemes = [
  {
    scheme_id: "SCH_001",
    name: "Pragati Scholarship for Girls (Technical Ed)",
    description: "AICTE scheme providing financial assistance for advancement of girls pursuing Technical Education.",
    eligibility_criteria: {
      min_class: 12,
      max_class: 16, // Assuming UG mapping
      father_occupation_allowed: ["Any"],
      min_marks_percentage: 60,
    },
    amount: 50000,
    social_uplift_score: 95,
    deadline: new Date(new Date().getTime() + (10 * 24 * 60 * 60 * 1000)),
    apply_link: "https://scholarships.gov.in/",
  },
  {
    scheme_id: "SCH_002",
    name: "Udaan - CBSE Scholarship for Girl Students",
    description: "Designed to address the low enrollment of girl students in prestigious engineering institutions.",
    eligibility_criteria: {
      min_class: 10,
      max_class: 12,
      father_occupation_allowed: ["Any"],
      min_marks_percentage: 70,
    },
    amount: 30000,
    social_uplift_score: 85,
    deadline: new Date(new Date().getTime() + (5 * 24 * 60 * 60 * 1000)),
    apply_link: "https://cbseacademic.nic.in/",
  },
  {
    scheme_id: "SCH_003",
    name: "Post-Matric Scholarship for Girl Students",
    description: "Financial assistance to girls studying at post-matriculation stages.",
    eligibility_criteria: {
      min_class: 11,
      father_occupation_allowed: ["Farmer", "Laborer", "Driver", "Any"],
      min_marks_percentage: 50,
    },
    amount: 15000,
    social_uplift_score: 98,
    deadline: new Date(new Date().getTime() + (20 * 24 * 60 * 60 * 1000)),
    apply_link: "https://scholarships.gov.in/",
  },
  {
    scheme_id: "SCH_004",
    name: "Begum Hazrat Mahal National Scholarship",
    description: "For meritorious girl students belonging to various communities to empower them.",
    eligibility_criteria: {
      min_class: 9,
      max_class: 12,
      father_occupation_allowed: ["Any"],
      min_marks_percentage: 50,
    },
    amount: 10000,
    social_uplift_score: 90,
    deadline: new Date(new Date().getTime() + (30 * 24 * 60 * 60 * 1000)),
    apply_link: "https://scholarships.gov.in/",
  },
  {
    scheme_id: "SCH_005",
    name: "Swami Vivekananda Single Girl Child Scholarship",
    description: "UGC scheme strictly meant for single girl children promoting post-graduate higher education.",
    eligibility_criteria: {
      min_class: 15, // UG/PG mapping
      father_occupation_allowed: ["Any"],
      min_marks_percentage: 60,
    },
    amount: 36200,
    social_uplift_score: 80,
    deadline: new Date(new Date().getTime() + (15 * 24 * 60 * 60 * 1000)),
    apply_link: "https://ugc.ac.in/",
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://kaviyarasi0911:kaviyarasi0911@cluster0.dntdj32.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB for Seeding...');
    
    // Clear Existing
    await Scholarship.deleteMany({});
    console.log('Existing scholarships removed.');
    
    // Insert new
    await Scholarship.insertMany(schemes);
    console.log('Dummy Scholarships Seeded successfully!');
    
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seedDB();
