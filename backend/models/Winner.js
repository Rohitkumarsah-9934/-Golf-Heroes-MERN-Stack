const mongoose = require('mongoose');

const WinnerSchema = new mongoose.Schema({
  draw:               { type: mongoose.Schema.Types.ObjectId, ref: 'Draw', required: true },
  user:               { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entry:              { type: mongoose.Schema.Types.ObjectId, ref: 'DrawEntry', required: true },
  prizeTier:          { type: String, enum: ['jackpot','match4','match3'], required: true },
  prizeAmount:        { type: Number, required: true },
  verificationStatus: { type: String, enum: ['pending','submitted','approved','rejected'], default: 'pending' },
  proofUrl:           String,
  proofSubmittedAt:   Date,
  paymentStatus:      { type: String, enum: ['pending','paid'], default: 'pending' },
  paidAt:             Date,
  adminNotes:         String,
}, { timestamps: true });

module.exports = mongoose.model('Winner', WinnerSchema);
