const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Scholarship = require('./models/Scholarship');
require('dotenv').config();

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

    const formattedSchemes = schemesData.map(item => {
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

      let castedAmount = item.annual_amount;
      if (typeof castedAmount !== 'number') castedAmount = 0;

      return {
        scheme_id: item.id || `SS${Math.floor(Math.random() * 10000)}`,
        name: item.name || "Unnamed Scholarship",
        description: `${item.benefits || 'Financial Support'} | State: ${item.state || 'All India'} | For: ${(item.eligible_for || []).join(", ")}`,
        amount: castedAmount,
        deadline: new Date(new Date().getTime() + (30 * 24 * 60 * 60 * 1000)), // 30 days from now defaults
        social_uplift_score: item.impact_score ? item.impact_score * 10 : 80,
        application_link: "https://scholarships.gov.in/",
        eligibility_criteria: {
          min_class: min_class,
          max_class: max_class,
          father_occupation_allowed: ["Any"],
          min_marks_percentage: item.min_percentage || 50
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
