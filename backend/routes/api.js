const express = require('express');
const router = express.Router();
const axios = require('axios');
const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');

// AI Match Service Endpoint Configuration
const AI_SERVICE_URL = 'http://localhost:8000/match';

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const normalizeArray = (value) =>
  Array.isArray(value) ? value.map((item) => normalizeText(item)).filter(Boolean) : [];

const isStateEligible = (userState, scholarshipState) => {
  const normalizedScholarshipState = normalizeText(scholarshipState);
  if (!normalizedScholarshipState || normalizedScholarshipState === 'all india') return true;

  const normalizedUserState = normalizeText(userState);
  return normalizedUserState === normalizedScholarshipState;
};

const isCasteEligible = (userInput, scholarship) => {
  const casteCategory = normalizeText(userInput.casteCategory);
  const minorityStatus = Boolean(userInput.minorityStatus);
  const casteEligibility = normalizeArray(scholarship.caste_eligibility);

  if (casteEligibility.length === 0 || casteEligibility.includes('all')) return true;
  if (casteEligibility.includes(casteCategory)) return true;
  if (casteCategory === 'obc' && (casteEligibility.includes('bc') || casteEligibility.includes('mbc') || casteEligibility.includes('obc'))) return true;
  if (minorityStatus && casteEligibility.includes('minority')) return true;

  return false;
};

const requiresKeyword = (eligibleForText, keywords) =>
  keywords.some((keyword) => eligibleForText.includes(keyword));

const isScholarshipEligible = (userInput, scholarshipDoc) => {
  const scholarship = {
    ...scholarshipDoc.eligibility_criteria,
    state: scholarshipDoc.state,
    deadline: scholarshipDoc.deadline,
  };

  const studentClass = Number(userInput.student_class);
  const marks = Number(userInput.marks);
  const familyIncome = Number(userInput.familyIncome);
  const minClass = Number(scholarship.min_class);
  const maxClass = scholarship.max_class === null || scholarship.max_class === undefined
    ? null
    : Number(scholarship.max_class);
  const minMarks = Number(scholarship.min_marks_percentage || 0);
  const incomeLimit = scholarship.income_limit === null || scholarship.income_limit === undefined
    ? null
    : Number(scholarship.income_limit);
  const eligibleFor = normalizeArray(scholarship.eligible_for);
  const eligibleForText = eligibleFor.join(' ');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(scholarship.deadline);
  deadline.setHours(0, 0, 0, 0);

  if (deadline < today) return false;
  if (!Number.isNaN(minClass) && studentClass < minClass) return false;
  if (maxClass !== null && !Number.isNaN(maxClass) && studentClass > maxClass) return false;
  if (!Number.isNaN(minMarks) && marks < minMarks) return false;
  if (incomeLimit !== null && !Number.isNaN(familyIncome) && familyIncome > incomeLimit) return false;
  if (!isStateEligible(userInput.state, scholarship.state)) return false;
  if (!isCasteEligible(userInput, scholarship)) return false;
  if (scholarship.minority_only && !userInput.minorityStatus) return false;
  if (scholarship.single_girl_child_only && !userInput.singleGirlChild) return false;
  if (scholarship.first_graduate_only && !userInput.firstGraduate) return false;
  if (requiresKeyword(eligibleForText, ['single girl']) && !userInput.singleGirlChild) return false;
  if (requiresKeyword(eligibleForText, ['minority']) && !userInput.minorityStatus) return false;
  if (requiresKeyword(eligibleForText, ['first graduate']) && !userInput.firstGraduate) return false;
  if (requiresKeyword(eligibleForText, ['differently abled', 'disabled', 'pwd']) && !userInput.disabilityStatus) return false;
  if (requiresKeyword(eligibleForText, ['rural']) && normalizeText(userInput.locationType) !== 'rural') return false;

  return true;
};

const computeFallbackScore = (userInput, scholarship) => {
  const studentClass = Number(userInput.student_class);
  const marks = Number(userInput.marks);
  const fatherOccupation = String(userInput.father_occupation || '').trim().toLowerCase();
  const familyIncome = Number(userInput.familyIncome);
  const casteCategory = String(userInput.casteCategory || '').trim().toLowerCase();
  const educationLevel = String(userInput.educationLevel || '').trim().toLowerCase();
  const minorityStatus = Boolean(userInput.minorityStatus);
  const firstGraduate = Boolean(userInput.firstGraduate);
  const singleGirlChild = Boolean(userInput.singleGirlChild);

  const minClass = Number(scholarship.min_class);
  const maxClass = Number(scholarship.max_class);
  const minMarks = Number(scholarship.min_marks_percentage || 0);
  const uplift = Number(scholarship.social_uplift_score || 0);
  const allowedOccupations = Array.isArray(scholarship.father_occupation_allowed)
    ? scholarship.father_occupation_allowed.map((x) => String(x).trim().toLowerCase())
    : [];
  const casteEligibility = Array.isArray(scholarship.caste_eligibility)
    ? scholarship.caste_eligibility.map((x) => String(x).trim().toLowerCase())
    : [];
  const eligibleFor = Array.isArray(scholarship.eligible_for)
    ? scholarship.eligible_for.map((x) => String(x).trim().toLowerCase())
    : [];
  const incomeLimit = scholarship.income_limit === null || scholarship.income_limit === undefined
    ? null
    : Number(scholarship.income_limit);

  let score = 0;

  if (!Number.isNaN(studentClass)) {
    if (!Number.isNaN(minClass) && !Number.isNaN(maxClass) && studentClass >= minClass && studentClass <= maxClass) {
      score += 25;
    } else if (!Number.isNaN(minClass) && !Number.isNaN(maxClass)) {
      const distance = Math.min(Math.abs(studentClass - minClass), Math.abs(studentClass - maxClass));
      score += Math.max(0, 18 - distance * 4);
    }
  }

  if (!Number.isNaN(marks)) {
    if (marks >= minMarks) {
      score += 25;
    } else {
      score += Math.max(0, 25 - (minMarks - marks) * 1.5);
    }
  }

  if (allowedOccupations.length === 0 || allowedOccupations.includes('any') || allowedOccupations.includes(fatherOccupation)) {
    score += 8;
  }

  if (casteEligibility.length === 0 || casteEligibility.includes('all') || casteEligibility.includes(casteCategory)) {
    score += 12;
  }

  if (incomeLimit === null || Number.isNaN(familyIncome)) {
    score += 8;
  } else if (familyIncome <= incomeLimit) {
    score += 12;
  } else {
    const overflow = familyIncome - incomeLimit;
    score += Math.max(0, 12 - overflow / 50000);
  }

  if (!scholarship.minority_only || minorityStatus) {
    score += scholarship.minority_only ? 5 : 2;
  }

  if (!scholarship.single_girl_child_only || singleGirlChild) {
    score += scholarship.single_girl_child_only ? 5 : 2;
  }

  if (!scholarship.first_graduate_only || firstGraduate) {
    score += scholarship.first_graduate_only ? 5 : 2;
  }

  const eligibleForText = eligibleFor.join(' ');
  if (
    eligibleForText.includes('ug') ||
    eligibleForText.includes('undergraduate') ||
    eligibleForText.includes('pg') ||
    eligibleForText.includes('school')
  ) {
    const matchesEducation =
      (educationLevel.includes('undergraduate') && eligibleForText.includes('ug')) ||
      (educationLevel.includes('postgraduate') && eligibleForText.includes('pg')) ||
      (educationLevel.includes('high school') && eligibleForText.includes('school'));

    score += matchesEducation ? 4 : 0;
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
    const eligibleScholarships = scholarships.filter((scholarship) => isScholarshipEligible(req.body, scholarship));

    if (eligibleScholarships.length === 0) {
      return res.json([]);
    }
    
    // Format them for AI Service
    const formatted_scholarships = eligibleScholarships.map(sch => ({
      id: sch._id.toString(),
      min_class: sch.eligibility_criteria.min_class,
      max_class: sch.eligibility_criteria.max_class,
      father_occupation_allowed: sch.eligibility_criteria.father_occupation_allowed,
      min_marks_percentage: sch.eligibility_criteria.min_marks_percentage,
      social_uplift_score: sch.social_uplift_score,
      income_limit: sch.eligibility_criteria.income_limit,
      caste_eligibility: sch.eligibility_criteria.caste_eligibility,
      eligible_for: sch.eligibility_criteria.eligible_for,
      minority_only: sch.eligibility_criteria.minority_only,
      single_girl_child_only: sch.eligibility_criteria.single_girl_child_only,
      first_graduate_only: sch.eligibility_criteria.first_graduate_only,
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
      const schData = eligibleScholarships.find(s => s._id.toString() === match.scholarship_id);
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

    if (!scholarship_id || !email) {
      return res.status(400).json({ error: 'scholarship_id and email are required' });
    }

    const scholarship = await Scholarship.findById(scholarship_id);
    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }
    
    // In a real application, nodemailer transporter setup goes here.
    // E.g.:
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({ to: email, subject: 'Applicaton Received', text: '...' });

    const reminder_sent = (() => {
      const deadlineDate = new Date(scholarship.deadline);
      const msPerDay = 24 * 60 * 60 * 1000;
      const daysLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / msPerDay);
      return daysLeft <= 7;
    })();

    const application = await Application.findOneAndUpdate(
      { user_email: email, scheme_id: scholarship_id },
      {
        $set: {
          user_email: email,
          scheme_id: scholarship_id,
          reminder_sent,
        },
        $setOnInsert: {
          status: 'Pending',
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    console.log(`[Email Simulated via Nodemailer] Sent application confirmation to ${email} for scholarship ID: ${scholarship_id}`);

    res.json({
      message: "Successfully applied! A confirmation email has been sent.",
      status: "Success",
      application,
    });
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

// GET /api/applications?email=x -> Get saved applications for current user
router.get('/applications', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'email query parameter is required' });
    }

    const applications = await Application.find({ user_email: email })
      .populate('scheme_id')
      .sort({ updatedAt: -1, createdAt: -1 });

    res.json(applications);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/application/:id -> Update application status
router.patch('/application/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'In Progress', 'Submitted'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { status, reminder_sent: status !== 'Submitted' },
      { new: true }
    ).populate('scheme_id');

    if (!updated) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
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
