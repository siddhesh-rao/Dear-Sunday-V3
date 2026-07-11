const router = require('express').Router();
const Letter = require('../models/Letter');
const Prompt = require('../models/Prompt');
const Participant = require('../models/Participant');
const { protectAdmin, protectParticipant } = require('../middleware/auth');

// POST /api/letters — participant submits a letter
router.post('/', protectParticipant, async (req, res) => {
  try {
    const { promptId, content } = req.body;
    if (!promptId || !content) return res.status(400).json({ error: 'Prompt and content required' });
    if (content.length < 50) return res.status(400).json({ error: 'Write at least 50 characters' });
    if (content.length > 5000) return res.status(400).json({ error: 'Max 5000 characters' });

    const prompt = await Prompt.findById(promptId);
    if (!prompt || !prompt.isActive) return res.status(400).json({ error: 'This prompt is not active' });

    // Check deadline
    if (prompt.submissionDeadline && new Date() > prompt.submissionDeadline)
      return res.status(400).json({ error: 'Submission deadline has passed' });

    // One letter per prompt per participant
    const existing = await Letter.findOne({ prompt: promptId, author: req.participant._id });
    if (existing) return res.status(400).json({ error: 'You already submitted a letter for this prompt' });

    const letter = await Letter.create({
      prompt: promptId,
      author: req.participant._id,
      authorPenName: req.participant.penName,
      content,
      status: 'submitted'
    });

    await Prompt.findByIdAndUpdate(promptId, { $inc: { totalSubmissions: 1 } });
    await Participant.findByIdAndUpdate(req.participant._id, { $inc: { lettersWritten: 1 } });

    res.status(201).json({ letter: { _id: letter._id, status: letter.status, createdAt: letter.createdAt } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/letters/my — participant: see their sent letters (no recipient revealed)
router.get('/my', protectParticipant, async (req, res) => {
  try {
    const letters = await Letter.find({ author: req.participant._id })
      .populate('prompt', 'title weekOf')
      .select('-recipient -authorPenName')
      .sort({ createdAt: -1 });
    res.json({ letters });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/letters/mailbox — participant: received letters
router.get('/mailbox', protectParticipant, async (req, res) => {
  try {
    const letters = await Letter.find({ recipient: req.participant._id, status: 'delivered' })
      .populate('prompt', 'title weekOf')
      .select('content authorPenName prompt status isRead readAt deliveredAt adminNote createdAt')
      .sort({ deliveredAt: -1 });
    res.json({ letters });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/letters/:id/read — participant marks letter as read
router.patch('/:id/read', protectParticipant, async (req, res) => {
  try {
    const letter = await Letter.findOne({ _id: req.params.id, recipient: req.participant._id });
    if (!letter) return res.status(404).json({ error: 'Letter not found' });
    letter.isRead = true;
    letter.readAt = new Date();
    await letter.save();
    res.json({ message: 'Marked as read' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ADMIN ROUTES ---

// GET /api/letters/admin/all — admin: all letters for a prompt
router.get('/admin/all', protectAdmin, async (req, res) => {
  try {
    const { promptId, status } = req.query;
    const query = {};
    if (promptId) query.prompt = promptId;
    if (status) query.status = status;
    const letters = await Letter.find(query)
      .populate('author', 'realName penName email')
      .populate('recipient', 'realName penName email')
      .populate('prompt', 'title weekOf')
      .sort({ createdAt: -1 });
    res.json({ letters });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/letters/admin/pair — admin pairs two letters
router.post('/admin/pair', protectAdmin, async (req, res) => {
  try {
    const { letterId, recipientId } = req.body;
    if (!letterId || !recipientId) return res.status(400).json({ error: 'letterId and recipientId required' });

    const letter = await Letter.findById(letterId).populate('author');
    if (!letter) return res.status(404).json({ error: 'Letter not found' });

    const recipient = await Participant.findById(recipientId);
    if (!recipient) return res.status(404).json({ error: 'Recipient not found' });

    if (letter.author._id.toString() === recipientId)
      return res.status(400).json({ error: 'Cannot pair someone with their own letter' });

    letter.recipient = recipientId;
    letter.recipientPenName = recipient.penName;
    letter.status = 'paired';
    letter.pairedAt = new Date();
    await letter.save();

    res.json({ message: 'Paired successfully', letter });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/letters/admin/deliver/:id — admin delivers a paired letter
router.post('/admin/deliver/:id', protectAdmin, async (req, res) => {
  try {
    const { adminNote } = req.body;
    const letter = await Letter.findById(req.params.id);
    if (!letter) return res.status(404).json({ error: 'Letter not found' });
    if (letter.status !== 'paired') return res.status(400).json({ error: 'Letter must be paired before delivery' });

    letter.status = 'delivered';
    letter.deliveredAt = new Date();
    if (adminNote) letter.adminNote = adminNote;
    await letter.save();

    await Participant.findByIdAndUpdate(letter.recipient, { $inc: { lettersReceived: 1 } });
    await Prompt.findByIdAndUpdate(letter.prompt, { $inc: { totalPairings: 1 } });

    res.json({ message: 'Letter delivered ✨', letter });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/letters/admin/:id — admin deletes a letter
router.delete('/admin/:id', protectAdmin, async (req, res) => {
  try {
    await Letter.findByIdAndDelete(req.params.id);
    res.json({ message: 'Letter deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
