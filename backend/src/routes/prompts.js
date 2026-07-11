const router = require('express').Router();
const Prompt = require('../models/Prompt');
const { protectAdmin, protectParticipant } = require('../middleware/auth');

// GET /api/prompts/active — public: get current active prompt
router.get('/active', async (req, res) => {
  try {
    const prompt = await Prompt.findOne({ isActive: true }).sort({ weekOf: -1 });
    res.json({ prompt });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/prompts — admin: all prompts
router.get('/', protectAdmin, async (req, res) => {
  try {
    const prompts = await Prompt.find().sort({ weekOf: -1 });
    res.json({ prompts });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/prompts — admin: create prompt
router.post('/', protectAdmin, async (req, res) => {
  try {
    const { title, body, weekOf, isActive, submissionDeadline } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    if (isActive) await Prompt.updateMany({}, { isActive: false });
    const prompt = await Prompt.create({ title, body, weekOf: weekOf || new Date(), isActive: isActive || false, submissionDeadline });
    res.status(201).json({ prompt });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/prompts/:id — admin: update prompt
router.put('/:id', protectAdmin, async (req, res) => {
  try {
    if (req.body.isActive) await Prompt.updateMany({ _id: { $ne: req.params.id } }, { isActive: false });
    const prompt = await Prompt.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!prompt) return res.status(404).json({ error: 'Prompt not found' });
    res.json({ prompt });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/prompts/:id — admin
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    await Prompt.findByIdAndDelete(req.params.id);
    res.json({ message: 'Prompt deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
