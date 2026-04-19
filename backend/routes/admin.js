const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
  getAllDraws, createDraw, simulateDraw, publishDraw,
} = require('../controllers/drawController');
const {
  createCharity, updateCharity, deleteCharity, addEvent,
} = require('../controllers/charityController');
const {
  getAllWinners, verifyWinner, markAsPaid,
} = require('../controllers/winnerController');

const User = require('../models/User');
const Subscription = require('../models/Subscription');
const GolfScore = require('../models/GolfScore');
const Draw = require('../models/Draw');
const Winner = require('../models/Winner');
const CharityContribution = require('../models/CharityContribution');

router.use(protect, authorize('admin'));

// ── Analytics ────────────────────────────────────────────────
router.get('/analytics', async (req, res, next) => {
  try {
    const [totalUsers, activeSubscriptions, totalDraws, totalWinners] = await Promise.all([
      User.countDocuments(),
      Subscription.countDocuments({ status: 'active' }),
      Draw.countDocuments(),
      Winner.countDocuments({ paymentStatus: 'paid' }),
    ]);
    const prizeData = await Winner.aggregate([
      { $group: { _id: null, totalPaid: { $sum: '$prizeAmount' } } },
    ]);
    const charityData = await CharityContribution.aggregate([
      { $group: { _id: null, totalDonated: { $sum: '$amount' } } },
    ]);
    res.json({
      success: true,
      data: {
        totalUsers,
        activeSubscriptions,
        totalDraws,
        totalWinners,
        totalPrizePaid: prizeData[0]?.totalPaid || 0,
        totalCharityDonated: charityData[0]?.totalDonated || 0,
      },
    });
  } catch (err) { next(err); }
});

// ── Users ────────────────────────────────────────────────────
router.get('/users', async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const users = await User.find(filter)
      .populate('subscription')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await User.countDocuments(filter);
    res.json({ success: true, data: users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('subscription')
      .populate({ path: 'charitySelection', populate: { path: 'charity' } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const scores = await GolfScore.find({ user: req.params.id }).sort({ scoreDate: -1 });
    res.json({ success: true, data: { ...user.toObject(), scores } });
  } catch (err) { next(err); }
});

router.put('/users/:id', async (req, res, next) => {
  try {
    const { fullName, email, role, phone, handicap } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { fullName, email, role, phone, handicap }, { new: true });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
});

// Admin edit user scores
router.put('/users/:id/scores/:scoreId', async (req, res, next) => {
  try {
    const score = await GolfScore.findOneAndUpdate(
      { _id: req.params.scoreId, user: req.params.id },
      { score: req.body.score, notes: req.body.notes },
      { new: true }
    );
    res.json({ success: true, data: score });
  } catch (err) { next(err); }
});

// ── Draws ─────────────────────────────────────────────────────
router.get('/draws', getAllDraws);
router.post('/draws', createDraw);
router.post('/draws/:id/simulate', simulateDraw);
router.post('/draws/:id/publish', publishDraw);

// ── Charities ─────────────────────────────────────────────────
router.post('/charities', createCharity);
router.put('/charities/:id', updateCharity);
router.delete('/charities/:id', deleteCharity);
router.post('/charities/:id/events', addEvent);

// ── Winners ──────────────────────────────────────────────────
router.get('/winners', getAllWinners);
router.put('/winners/:id/verify', verifyWinner);
router.put('/winners/:id/pay', markAsPaid);

module.exports = router;
