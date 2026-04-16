const express = require('express');
const router = express.Router();
const axios = require('axios');
const Scholarship = require('../models/Scholarship');

// AI Match Service Endpoint Configuration
const AI_SERVICE_URL = 'http://localhost:8000/match';

const computeFallbackScore = (userInput, scholarship) => {
  const studentClass = Number(userInput.student_class);
  const marks = Number(userInput.marks);
  const fatherOccupation = String(userInput.father_occupation || '').trim().toLowerCase();

  const minClass = Number(scholarship.min_class);
  const maxClass = Number(scholarship.max_class);
  const minMarks = Number(scholarship.min_marks_percentage || 0);
  const uplift = Number(scholarship.social_uplift_score || 0);
  const allowedOccupations = Array.isArray(scholarship.father_occupation_allowed)
    ? scholarship.father_occupation_allowed.map((x) => String(x).trim().toLowerCase())
    : [];

  let score = 0;

  if (!Number.isNaN(studentClass)) {
    if (!Number.isNaN(minClass) && !Number.isNaN(maxClass) && studentClass >= minClass && studentClass <= maxClass) {
      score += 40;
    } else if (!Number.isNaN(minClass) && !Number.isNaN(maxClass)) {
      const distance = Math.min(Math.abs(studentClass - minClass), Math.abs(studentClass - maxClass));
      score += Math.max(0, 30 - distance * 5);
    }
  }

  if (!Number.isNaN(marks)) {
    if (marks >= minMarks) {
      score += 40;
    } else {
      score += Math.max(0, 40 - (minMarks - marks) * 2);
    }
  }

  if (allowedOccupations.length === 0 || allowedOccupations.includes('any') || allowedOccupations.includes(fatherOccupation)) {
    score += 10;
  }

  score += Math.min(10, Math.max(0, uplift / 10));

  return Math.max(0, Math.min(100, Number(score.toFixed(2))));
};

// POST /api/match -> Calls Python AI Service
router.post('/match', async (req, res) => {
  try {
    const { student_class, father_occupation, marks } = req.body;
    
    // Validate
    if (student_class === undefined || !father_occupation || marks === undefined) {
      return res.status(400).json({ error: 'Missing required fields: student_class, father_occupation, marks' });
    }

    // Fetch all scholarships from DB
    const scholarships = await Scholarship.find({});
    
    // Format them for AI Service
    const formatted_scholarships = scholarships.map(sch => ({
      id: sch._id.toString(),
      min_class: sch.eligibility_criteria.min_class,
      max_class: sch.eligibility_criteria.max_class,
      father_occupation_allowed: sch.eligibility_criteria.father_occupation_allowed,
      min_marks_percentage: sch.eligibility_criteria.min_marks_percentage,
      social_uplift_score: sch.social_uplift_score
    }));

    // Call Python Service
    const aiPayload = {
      user_input: {
        student_class: parseInt(student_class),
        father_occupation: father_occupation,
        marks: parseFloat(marks)
      },
      scholarships: formatted_scholarships
    };

    let rankedIdsAndScores = [];

    try {
      const aiRes = await axios.post(AI_SERVICE_URL, aiPayload, { timeout: 5000 });
      if (!Array.isArray(aiRes.data)) {
        throw new Error('Invalid response format from AI service');
      }
      rankedIdsAndScores = aiRes.data;
    } catch (aiErr) {
      console.warn('AI service unavailable, using fallback matcher:', aiErr.message);
      rankedIdsAndScores = formatted_scholarships
        .map((sch) => ({
          scholarship_id: sch.id,
          score: computeFallbackScore(aiPayload.user_input, sch),
        }))
        .sort((a, b) => b.score - a.score);
    }
    
    // Top 3 Matches
    const topMatches = rankedIdsAndScores.slice(0, 3).map(match => {
      const schData = scholarships.find(s => s._id.toString() === match.scholarship_id);
      if (!schData) return null;
      return {
        scholarship: schData,
        eligibility_score: match.score
      };
    }).filter(Boolean);

    res.json(topMatches);
  } catch (err) {
    console.error('Match Error:', err.message, err.response?.data || '');
    res.status(500).json({ error: 'Internal Server Error during matching', details: err.message });
  }
});

// GET /api/scholarships -> List all for admin
router.get('/scholarships', async (req, res) => {
  try {
    const data = await Scholarship.find({});
    res.json(data);
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

// GET /api/scholarship/:id -> Details
router.get('/scholarship/:id', async (req, res) => {
  try {
    const sch = await Scholarship.findById(req.params.id);
    if (!sch) return res.status(404).json({ error: 'Not found' });
    res.json(sch);
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

// POST /api/scholarship -> Create (Admin)
router.post('/scholarship', async (req, res) => {
  try {
    const sch = new Scholarship(req.body);
    await sch.save();
    res.status(201).json(sch);
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

// DELETE /api/scholarship/:id -> Delete (Admin)
router.delete('/scholarship/:id', async (req, res) => {
  try {
    await Scholarship.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

// POST /api/voice -> Simulated Bhashini TTS
router.post('/voice', async (req, res) => {
  try {
    const { text } = req.body;
    // Pretend we called Bhashini
    res.json({
      audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Mock Audio
      translated_text: "(translated): " + text
    });
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

// POST /api/apply -> Mock Apply (via Email / Nodemailer)
router.post('/apply', async (req, res) => {
  try {
    const { scholarship_id, email, phone } = req.body; // Using email rather than just phone
    
    // In a real application, nodemailer transporter setup goes here.
    // E.g.:
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({ to: email, subject: 'Applicaton Received', text: '...' });

    console.log(`[Email Simulated via Nodemailer] Sent application confirmation to ${email} for scholarship ID: ${scholarship_id}`);

    res.json({ message: "Successfully applied! A confirmation email has been sent.", status: "Success" });
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

// GET /api/roadmap/:id -> Get Application Roadmap for a Scholarship
router.get('/roadmap/:id', async (req, res) => {
  try {
    const sch = await Scholarship.findById(req.params.id);
    if (!sch) return res.status(404).json({ error: 'Scholarship not found' });

    // Generate a generic roadmap for the scholarship application
    const roadmap = {
      title: `${sch.name} - Application Roadmap`,
      steps: [
        {
          id: 1,
          text: 'Prepare Your Profile',
          checklist: [
            'Gather personal identification documents (Aadhar, Pan)',
            'Collect academic transcripts and mark sheets',
            'Prepare proof of income/father\'s occupation',
            `Verify eligibility: Class ${sch.eligibility_criteria.min_class}-${sch.eligibility_criteria.max_class}, Marks: ${sch.eligibility_criteria.min_marks_percentage}%+`
          ]
        },
        {
          id: 2,
          text: 'Fill Application Form',
          checklist: [
            'Create account in the scholarship portal',
            'Fill personal information accurately',
            'Enter academic details and current class',
            'Upload mark sheets and certificates',
            'Enter father\'s occupation information'
          ]
        },
        {
          id: 3,
          text: 'Submit Documents',
          checklist: [
            'Prepare all required supporting documents',
            'Scan documents in PDF format (less than 5MB each)',
            'Upload documents to the portal',
            'Verify all uploads are successful'
          ]
        },
        {
          id: 4,
          text: 'Review & Submit',
          checklist: [
            'Review all entered information for accuracy',
            'Check that all required fields are completed',
            'Read terms and conditions',
            'Submit your application',
            'Save your application reference number'
          ]
        },
        {
          id: 5,
          text: 'Track Application Status',
          checklist: [
            'Monitor application status in your dashboard',
            'Check email for updates and notifications',
            'Contact support if needed with your reference number',
            'Prepare for interview (if applicable)',
            'Await final scholarship decision'
          ]
        }
      ]
    };

    res.json(roadmap);
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

module.exports = router;
