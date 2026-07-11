const router = require('express').Router();
const Participant = require('../models/Participant');
const { protectAdmin, protectParticipant } = require('../middleware/auth');

// GET /api/participants/me — participant: own profile
router.get('/me', protectParticipant, async (req, res) => {
  try {
    const p = await Participant.findById(req.participant._id).select('-password');
    res.json({ participant: p });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/participants/me — participant: update bio
router.patch('/me', protectParticipant, async (req, res) => {
  try {
    const { bio } = req.body;
    const p = await Participant.findByIdAndUpdate(req.participant._id, { bio }, { new: true }).select('-password');
    res.json({ participant: p });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/participants — admin: list all participants
router.get('/', protectAdmin, async (req, res) => {
  try {
    const participants = await Participant.find().select('-password').sort({ joinedAt: -1 });
    res.json({ participants });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/participants/:id/toggle — admin: activate/deactivate
router.patch('/:id/toggle', protectAdmin, async (req, res) => {
  try {
    const p = await Participant.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Participant not found' });
    p.isActive = !p.isActive;
    await p.save();
    res.json({ isActive: p.isActive });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/participants/:id — admin
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    await Participant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Participant removed' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
