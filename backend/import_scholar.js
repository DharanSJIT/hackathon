const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Scholarship = require('./models/Scholarship');
require('dotenv').config();

const normalizeStringArray = (value) =>
  Array.isArray(value) ? value.filter(Boolean).map((item) => String(item).trim()) : [];

const inferAmount = (item) => {
  if (typeof item.annual_amount === 'number' && Number.isFinite(item.annual_amount)) {
    return item.annual_amount;
  }

  const benefitsText = String(item.benefits || '');
  const currencyMatch = benefitsText.match(/₹\s*([\d,]+)(?:\s*\/\s*month|\s*per\s*month|\s*monthly)?/i);

  if (!currencyMatch) return 0;

  const parsed = Number(currencyMatch[1].replace(/,/g, ''));
  if (!Number.isFinite(parsed)) return 0;

  if (/\/\s*month|per\s*month|monthly/i.test(benefitsText)) {
    return parsed * 12;
  }

  return parsed;
};

const DEADLINE_BUCKETS_2026 = [
  '2026-05-20',
  '2026-05-28',
  '2026-06-10',
  '2026-06-18',
  '2026-06-30',
  '2026-07-12',
  '2026-07-25',
  '2026-08-08',
];

const computeDeadline = (item, index) => {
  if (item.deadline) {
    const explicitDeadline = new Date(item.deadline);
    if (!Number.isNaN(explicitDeadline.getTime())) {
      return explicitDeadline;
    }
  }

  const idText = String(item.id || `scheme-${index}`);
  const hash = idText.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const category = String(item.category || '').toLowerCase();
  const levels = Array.isArray(item.education_level)
    ? item.education_level.join(' ').toLowerCase()
    : '';

  let bucketIndex = hash % DEADLINE_BUCKETS_2026.length;

  if (category.includes('central')) bucketIndex = (bucketIndex + 1) % DEADLINE_BUCKETS_2026.length;
  if (category.includes('foundation')) bucketIndex = (bucketIndex + 2) % DEADLINE_BUCKETS_2026.length;
  if (levels.includes('pg')) bucketIndex = (bucketIndex + 1) % DEADLINE_BUCKETS_2026.length;
  if (levels.includes('school') || levels.includes('class 11-12')) bucketIndex = Math.max(0, bucketIndex - 1);

  return new Date(`${DEADLINE_BUCKETS_2026[bucketIndex]}T00:00:00`);
};

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://kaviyarasi0911:kaviyarasi0911@cluster0.dntdj32.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB for bulk import...');

    const jsonPath = path.join(__dirname, '../frontend/public/data/Scholar.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const parsedData = JSON.parse(rawData);
    
    // Check if the JSON has a "schemes" array, otherwise use the array itself
    const schemesData = parsedData.schemes ? parsedData.schemes : (Array.isArray(parsedData) ? parsedData : [parsedData]);
    
    await Scholarship.deleteMany({});
    console.log('Cleared existing scholarships.');

    const formattedSchemes = schemesData.map((item, index) => {
      // Map education level to approx classes
      let min_class = 1;
      let max_class = null;
      
      const levels = Array.isArray(item.education_level) ? item.education_level.join(" ").toLowerCase() : "";
      
      if (levels.includes("school") || levels.includes("class 11-12")) {
         min_class = 1; // broad
         if (!levels.includes("ug") && !levels.includes("pg")) {
            max_class = 12;
         }
      }
      if (levels.includes("diploma")) min_class = 11;
      if (levels.includes("ug") || levels.includes("undergraduate")) min_class = 13;
      if (levels.includes("pg")) min_class = 16;
      if (levels.includes("phd")) min_class = 18;

      const eligibleFor = normalizeStringArray(item.eligible_for);
      const casteEligibility = normalizeStringArray(item.caste_eligibility);
      const benefits = String(item.benefits || '').trim();
      const castedAmount = inferAmount(item);
      const eligibleForText = eligibleFor.join(' ').toLowerCase();
      const casteText = casteEligibility.join(' ').toLowerCase();

      return {
        scheme_id: item.id || `SS${Math.floor(Math.random() * 10000)}`,
        name: item.name || "Unnamed Scholarship",
        state: item.state || 'All India',
        category: item.category || 'General',
        description: `${benefits || 'Financial Support'} | State: ${item.state || 'All India'} | For: ${eligibleFor.join(", ")}`,
        amount: castedAmount,
        deadline: computeDeadline(item, index),
        social_uplift_score: item.impact_score ? item.impact_score * 10 : 80,
        benefits,
        renewable: Boolean(item.renewable),
        application_link: "https://scholarships.gov.in/",
        eligibility_criteria: {
          min_class: min_class,
          max_class: max_class,
          father_occupation_allowed: ["Any"],
          min_marks_percentage: item.min_percentage || 50,
          income_limit: typeof item.income_limit === 'number' ? item.income_limit : null,
          caste_eligibility: casteEligibility,
          eligible_for: eligibleFor,
          minority_only: casteText.includes('minority'),
          single_girl_child_only: eligibleForText.includes('single girl'),
          first_graduate_only: eligibleForText.includes('first graduate'),
        }
      };
    });

    await Scholarship.insertMany(formattedSchemes);
    console.log(`Successfully imported ${formattedSchemes.length} scholarships from Scholar.json!`);

    process.exit(0);
  } catch (err) {
    console.error('Import Error:', err);
    process.exit(1);
  }
};

importData();
