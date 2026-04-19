const Winner = require('../models/Winner');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload dir exists
const uploadDir = path.join(__dirname, '../uploads/proofs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `proof_${req.user._id}_${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    /jpeg|jpg|png|pdf/.test(path.extname(file.originalname).toLowerCase()) ? cb(null, true) : cb(new Error('Only images/PDF'));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

exports.uploadMiddleware = upload.single('proof');

// GET /api/winners/my-winnings
exports.getMyWinnings = async (req, res, next) => {
  try {
    const winners = await Winner.find({ user: req.user._id })
      .populate('draw', 'title drawMonth winningNumbers')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: winners });
  } catch (err) { next(err); }
};

// POST /api/winners/:id/submit-proof
exports.submitProof = async (req, res, next) => {
  try {
    const winner = await Winner.findOne({ _id: req.params.id, user: req.user._id });
    if (!winner) return res.status(404).json({ success: false, message: 'Winner record not found' });
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload proof' });

    winner.proofUrl = `/uploads/proofs/${req.file.filename}`;
    winner.verificationStatus = 'submitted';
    winner.proofSubmittedAt = new Date();
    await winner.save();
    res.json({ success: true, data: winner });
  } catch (err) { next(err); }
};

// ADMIN: GET /api/admin/winners
exports.getAllWinners = async (req, res, next) => {
  try {
    const { verificationStatus, paymentStatus } = req.query;
    const filter = {};
    if (verificationStatus) filter.verificationStatus = verificationStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const winners = await Winner.find(filter)
      .populate('user', 'fullName email')
      .populate('draw', 'title drawMonth')
      .populate('entry', 'scores matchCount')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: winners });
  } catch (err) { next(err); }
};

// ADMIN: PUT /api/admin/winners/:id/verify
exports.verifyWinner = async (req, res, next) => {
  try {
    const { verificationStatus, adminNotes } = req.body;
    if (!['approved','rejected'].includes(verificationStatus)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }
    const winner = await Winner.findByIdAndUpdate(req.params.id, { verificationStatus, adminNotes }, { new: true })
      .populate('user', 'fullName email');
    res.json({ success: true, data: winner });
  } catch (err) { next(err); }
};

// ADMIN: PUT /api/admin/winners/:id/pay
exports.markAsPaid = async (req, res, next) => {
  try {
    const winner = await Winner.findByIdAndUpdate(req.params.id, { paymentStatus: 'paid', paidAt: new Date() }, { new: true })
      .populate('user', 'fullName email');
    if (!winner) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: winner });
  } catch (err) { next(err); }
};
