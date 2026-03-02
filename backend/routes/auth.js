const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');

// Setup memory storage instead of Cloudinary as requested
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit for base64 safety
});

// Register Route
// Expecting multiple files: aadhaarDoc, incomeCertificate, marksheet
router.post('/register', upload.fields([
  { name: 'aadhaarDoc', maxCount: 1 },
  { name: 'incomeCertificate', maxCount: 1 },
  { name: 'marksheet', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      email, password,
      // Map form field names → model field names
      fullName,
      mobileNumber,       // → phone
      lastExamMarks,      // → percentage
      annualFamilyIncome, // → familyIncome
      // remaining fields
      ...rest
    } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Email, password, and full name are required.' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists. Please login instead.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Convert Buffer files safely to base64 strings to store inside MongoDB locally
    const docs = {};
    if (req.files) {
      if (req.files.aadhaarDoc) {
         docs.aadhaarDoc = req.files.aadhaarDoc[0].buffer.toString('base64');
      }
      if (req.files.incomeCertificate) {
         docs.incomeCertificate = req.files.incomeCertificate[0].buffer.toString('base64');
      }
      if (req.files.marksheet) {
         docs.marksheet = req.files.marksheet[0].buffer.toString('base64');
      }
    }

    // Create User — map form names to model field names
    const newUser = new User({
      email,
      password: hashedPassword,
      fullName,
      phone: mobileNumber,
      percentage: lastExamMarks ? parseFloat(lastExamMarks) : undefined,
      familyIncome: annualFamilyIncome ? parseFloat(annualFamilyIncome) : undefined,
      ...rest,
      ...docs,
    });

    await newUser.save();

    // Generate token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    res.status(201).json({ message: 'User registered successfully', token, user: newUser });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    res.json({ message: 'Logged in successfully', token, user });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// Get Current User
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
