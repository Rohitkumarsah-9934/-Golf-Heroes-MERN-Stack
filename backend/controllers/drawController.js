const Draw = require('../models/Draw');
const DrawEntry = require('../models/DrawEntry');
const Winner = require('../models/Winner');
const GolfScore = require('../models/GolfScore');
const Subscription = require('../models/Subscription');

const generateRandom = () => {
  const nums = new Set();
  while (nums.size < 5) nums.add(Math.floor(Math.random() * 45) + 1);
  return Array.from(nums).sort((a, b) => a - b);
};

const generateAlgorithmic = async () => {
  const freq = await GolfScore.aggregate([
    { $group: { _id: '$score', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  if (freq.length < 5) return generateRandom();
  const most = freq.slice(0, 3).map(d => d._id);
  const least = freq.slice(-2).map(d => d._id);
  const combined = [...new Set([...most, ...least])];
  while (combined.length < 5) combined.push(Math.floor(Math.random() * 45) + 1);
  return [...new Set(combined)].slice(0, 5).sort((a, b) => a - b);
};

const countMatches = (scores, winning) => scores.filter(s => winning.includes(s)).length;

// GET /api/draws  – published only
exports.getPublishedDraws = async (req, res, next) => {
  try {
    const draws = await Draw.find({ status: { $in: ['published','completed'] } }).sort({ drawMonth: -1 }).limit(12);
    res.json({ success: true, count: draws.length, data: draws });
  } catch (err) { next(err); }
};

// GET /api/draws/:id
exports.getDrawById = async (req, res, next) => {
  try {
    const draw = await Draw.findById(req.params.id);
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });
    res.json({ success: true, data: draw });
  } catch (err) { next(err); }
};

// GET /api/draws/:id/my-entry
exports.getMyEntry = async (req, res, next) => {
  try {
    const entry = await DrawEntry.findOne({ draw: req.params.id, user: req.user._id });
    res.json({ success: true, data: entry });
  } catch (err) { next(err); }
};

// ADMIN: GET /api/admin/draws
exports.getAllDraws = async (req, res, next) => {
  try {
    const draws = await Draw.find().sort({ drawMonth: -1 });
    res.json({ success: true, data: draws });
  } catch (err) { next(err); }
};

// ADMIN: POST /api/admin/draws
exports.createDraw = async (req, res, next) => {
  try {
    const { title, drawMonth, drawType } = req.body;
    const draw = await Draw.create({ title, drawMonth, drawType });
    res.status(201).json({ success: true, data: draw });
  } catch (err) { next(err); }
};

// ADMIN: POST /api/admin/draws/:id/simulate
exports.simulateDraw = async (req, res, next) => {
  try {
    const draw = await Draw.findById(req.params.id);
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });
    if (draw.status === 'published') return res.status(400).json({ success: false, message: 'Already published' });

    const winningNumbers = draw.drawType === 'algorithmic' ? await generateAlgorithmic() : generateRandom();

    const activeSubs = await Subscription.find({ status: 'active' }).populate('user');
    const subscribers = activeSubs.map(s => s.user).filter(Boolean);

    const lastJackpotRoll = await Draw.findOne({ jackpotRolledOver: true, status: { $in: ['published','completed'] } }).sort({ drawMonth: -1 });
    const rolledOver = lastJackpotRoll ? lastJackpotRoll.jackpotPool : 0;
    const pools = Draw.calculatePools(subscribers.length, rolledOver);

    await DrawEntry.deleteMany({ draw: draw._id });

    const entryOps = [];
    for (const user of subscribers) {
      const scores = await GolfScore.find({ user: user._id }).sort({ scoreDate: -1 }).limit(5);
      if (!scores.length) continue;
      const scoreVals = scores.map(s => s.score);
      const matchCount = countMatches(scoreVals, winningNumbers);
      const prizeTier = matchCount === 5 ? 'jackpot' : matchCount === 4 ? 'match4' : matchCount === 3 ? 'match3' : null;
      entryOps.push({ draw: draw._id, user: user._id, scores: scoreVals, matchCount, isWinner: !!prizeTier, prizeTier });
    }

    const entries = await DrawEntry.insertMany(entryOps);

    // Prize splits
    const j = entries.filter(e => e.prizeTier === 'jackpot');
    const m4 = entries.filter(e => e.prizeTier === 'match4');
    const m3 = entries.filter(e => e.prizeTier === 'match3');
    const jPrize = j.length ? pools.jackpotPool / j.length : 0;
    const m4Prize = m4.length ? pools.match4Pool / m4.length : 0;
    const m3Prize = m3.length ? pools.match3Pool / m3.length : 0;

    for (const e of entries) {
      if (e.prizeTier === 'jackpot') e.prizeAmount = jPrize;
      else if (e.prizeTier === 'match4') e.prizeAmount = m4Prize;
      else if (e.prizeTier === 'match3') e.prizeAmount = m3Prize;
      await e.save();
    }

    draw.winningNumbers = winningNumbers;
    draw.status = 'simulated';
    draw.subscriberCount = subscribers.length;
    draw.jackpotRolledOver = j.length === 0;
    draw.rolledOverAmount = j.length === 0 ? pools.jackpotPool : 0;
    Object.assign(draw, pools);
    await draw.save();

    res.json({ success: true, data: { draw, winningNumbers, totalEntries: entries.length, winners: { jackpot: j.length, match4: m4.length, match3: m3.length } } });
  } catch (err) { next(err); }
};

// ADMIN: POST /api/admin/draws/:id/publish
exports.publishDraw = async (req, res, next) => {
  try {
    const draw = await Draw.findById(req.params.id);
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });
    if (draw.status !== 'simulated') return res.status(400).json({ success: false, message: 'Must simulate first' });

    const winningEntries = await DrawEntry.find({ draw: draw._id, isWinner: true });
    if (winningEntries.length) {
      await Winner.insertMany(winningEntries.map(e => ({
        draw: draw._id, user: e.user, entry: e._id,
        prizeTier: e.prizeTier, prizeAmount: e.prizeAmount,
      })));
    }

    draw.status = 'published';
    draw.publishedAt = new Date();
    await draw.save();

    res.json({ success: true, data: draw, message: `Published. ${winningEntries.length} winner(s).` });
  } catch (err) { next(err); }
};
