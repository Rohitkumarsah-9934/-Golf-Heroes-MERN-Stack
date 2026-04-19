const Charity = require('../models/Charity');
const UserCharitySelection = require('../models/UserCharitySelection');

// GET /api/charities
exports.getCharities = async (req, res, next) => {
  try {
    const { search, featured } = req.query;
    const filter = { isActive: true };
    if (featured === 'true') filter.isFeatured = true;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const charities = await Charity.find(filter).sort({ isFeatured: -1, name: 1 });
    res.json({ success: true, data: charities });
  } catch (err) { next(err); }
};

// GET /api/charities/:id
exports.getCharityById = async (req, res, next) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity || !charity.isActive) return res.status(404).json({ success: false, message: 'Charity not found' });
    res.json({ success: true, data: charity });
  } catch (err) { next(err); }
};

// POST /api/charities/select
exports.selectCharity = async (req, res, next) => {
  try {
    const { charityId, contributionPercentage = 10 } = req.body;
    if (!await Charity.findById(charityId)) return res.status(404).json({ success: false, message: 'Charity not found' });

    const selection = await UserCharitySelection.findOneAndUpdate(
      { user: req.user._id },
      { user: req.user._id, charity: charityId, contributionPercentage },
      { upsert: true, new: true }
    ).populate('charity');

    res.json({ success: true, data: selection });
  } catch (err) { next(err); }
};

// GET /api/charities/my-selection
exports.getMySelection = async (req, res, next) => {
  try {
    const selection = await UserCharitySelection.findOne({ user: req.user._id }).populate('charity');
    res.json({ success: true, data: selection });
  } catch (err) { next(err); }
};

// ADMIN CRUD
exports.createCharity = async (req, res, next) => {
  try {
    const charity = await Charity.create(req.body);
    res.status(201).json({ success: true, data: charity });
  } catch (err) { next(err); }
};

exports.updateCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!charity) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: charity });
  } catch (err) { next(err); }
};

exports.deleteCharity = async (req, res, next) => {
  try {
    await Charity.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Charity deactivated' });
  } catch (err) { next(err); }
};

// ADMIN: Add event to charity
exports.addEvent = async (req, res, next) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) return res.status(404).json({ success: false, message: 'Not found' });
    charity.events.push(req.body);
    await charity.save();
    res.status(201).json({ success: true, data: charity });
  } catch (err) { next(err); }
};
