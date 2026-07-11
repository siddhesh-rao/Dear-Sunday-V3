const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Participant = require('../models/Participant');

const SECRET = process.env.JWT_SECRET || 'fallback-secret';

const protectAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Not authorized' });
  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
    req.admin = await Admin.findById(decoded.id).select('-password');
    if (!req.admin) return res.status(401).json({ error: 'Admin not found' });
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const protectParticipant = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Not authorized' });
  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== 'participant') return res.status(403).json({ error: 'Participants only' });
    req.participant = await Participant.findById(decoded.id).select('-password');
    if (!req.participant) return res.status(401).json({ error: 'Participant not found' });
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const protectAny = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Not authorized' });
  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role === 'admin') {
      req.admin = await Admin.findById(decoded.id).select('-password');
      req.role = 'admin';
    } else {
      req.participant = await Participant.findById(decoded.id).select('-password');
      req.role = 'participant';
    }
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const signToken = (id, role) => jwt.sign({ id, role }, SECRET, { expiresIn: '30d' });

module.exports = { protectAdmin, protectParticipant, protectAny, signToken };
