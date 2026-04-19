const GolfScore = require('../models/GolfScore');
const { validationResult } = require('express-validator');

// GET /api/scores
exports.getMyScores = async (req, res, next) => {
  try {
    const scores = await GolfScore.find({ user: req.user._id }).sort({ scoreDate: -1 }).limit(5);
    res.json({ success: true, count: scores.length, data: scores });
  } catch (err) { next(err); }
};

// POST /api/scores
exports.addScore = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { score, scoreDate, notes } = req.body;
    const dateOnly = new Date(scoreDate);
    dateOnly.setUTCHours(0, 0, 0, 0);

    const existing = await GolfScore.findOne({ user: req.user._id, scoreDate: dateOnly });
    if (existing) return res.status(400).json({ success: false, message: 'Score for this date already exists. Edit or delete it.' });

    const newScore = await GolfScore.create({ user: req.user._id, score, scoreDate: dateOnly, notes });
    await GolfScore.enforceRollingLimit(req.user._id);
    res.status(201).json({ success: true, data: newScore });
  } catch (err) { next(err); }
};

// PUT /api/scores/:id
exports.updateScore = async (req, res, next) => {
  try {
    const doc = await GolfScore.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ success: false, message: 'Score not found' });

    const { score, notes } = req.body;
    if (score !== undefined) {
      if (score < 1 || score > 45) return res.status(400).json({ success: false, message: 'Score must be 1–45' });
      doc.score = score;
    }
    if (notes !== undefined) doc.notes = notes;
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// DELETE /api/scores/:id
exports.deleteScore = async (req, res, next) => {
  try {
    const doc = await GolfScore.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ success: false, message: 'Score not found' });
    await doc.deleteOne();
    res.json({ success: true, message: 'Score deleted' });
  } catch (err) { next(err); }
};
