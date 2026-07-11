const router = require('express').Router();
const Letter = require('../models/Letter');
const Prompt = require('../models/Prompt');
const Participant = require('../models/Participant');
const { protectAdmin } = require('../middleware/auth');

// GET /api/admin/analytics
router.get('/analytics', protectAdmin, async (req, res) => {
  try {
    const [totalParticipants, totalLetters, totalDelivered, totalPrompts, activePrompt] = await Promise.all([
      Participant.countDocuments({ isActive: true }),
      Letter.countDocuments(),
      Letter.countDocuments({ status: 'delivered' }),
      Prompt.countDocuments(),
      Prompt.findOne({ isActive: true })
    ]);

    const pendingPairing = await Letter.countDocuments({ status: 'submitted' });
    const pendingDelivery = await Letter.countDocuments({ status: 'paired' });

    const recentLetters = await Letter.find({ status: 'submitted' })
      .populate('author', 'penName realName')
      .populate('prompt', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalParticipants,
      totalLetters,
      totalDelivered,
      totalPrompts,
      pendingPairing,
      pendingDelivery,
      activePrompt,
      recentLetters
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
