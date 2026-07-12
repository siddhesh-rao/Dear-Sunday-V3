const router = require('express').Router();
const Admin = require('../models/Admin');
const Participant = require('../models/Participant');
const { protectAdmin, protectParticipant, signToken } = require('../middleware/auth');

// POST /api/auth/admin/setup — create first admin (once only)
router.post('/admin/setup', async (req, res) => {
  try {
    if (await Admin.countDocuments() > 0) return res.status(403).json({ error: 'Admin already exists' });
    const { email, password, name } = req.body;
    const adminEmail = email || process.env.ADMIN_EMAIL;
    const adminPassword = password || process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return res.status(400).json({ error: 'Admin email and password are required' });
    }

    const admin = await Admin.create({
      email: adminEmail,
      password: adminPassword,
      name: name || 'Sunday Admin'
    });
    res.json({ message: 'Admin created', token: signToken(admin._id, 'admin') });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/admin/login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: email?.toLowerCase() });
    if (!admin || !(await admin.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ token: signToken(admin._id, 'admin'), admin: { id: admin._id, email: admin.email, name: admin.name } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/signup — participant signup
router.post('/signup', async (req, res) => {
  try {
    const { realName, penName, email, password } = req.body;
    if (!realName || !penName || !email || !password)
      return res.status(400).json({ error: 'All fields required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const exists = await Participant.findOne({ $or: [{ email: email.toLowerCase() }, { penName }] });
    if (exists) return res.status(400).json({ error: exists.email === email.toLowerCase() ? 'Email already registered' : 'Pen name already taken' });
    const participant = await Participant.create({ realName, penName, email, password });
    res.status(201).json({
      token: signToken(participant._id, 'participant'),
      participant: { id: participant._id, penName: participant.penName, email: participant.email }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/login — participant login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const participant = await Participant.findOne({ email: email?.toLowerCase() });
    if (!participant || !(await participant.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });
    if (!participant.isActive) return res.status(403).json({ error: 'Account deactivated. Contact admin.' });
    res.json({
      token: signToken(participant._id, 'participant'),
      participant: { id: participant._id, penName: participant.penName, email: participant.email, realName: participant.realName }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id).select('-password');
      return res.json({ role: 'admin', user: admin });
    }
    const participant = await Participant.findById(decoded.id).select('-password');
    res.json({ role: 'participant', user: participant });
  } catch { res.status(401).json({ error: 'Invalid token' }); }
});

module.exports = router;
