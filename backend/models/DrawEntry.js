const mongoose = require('mongoose');

const DrawEntrySchema = new mongoose.Schema({
  draw:        { type: mongoose.Schema.Types.ObjectId, ref: 'Draw', required: true },
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scores:      { type: [Number], required: true },
  matchCount:  { type: Number, default: 0 },
  isWinner:    { type: Boolean, default: false },
  prizeTier:   { type: String, enum: ['jackpot','match4','match3',null], default: null },
  prizeAmount: { type: Number, default: 0 },
}, { timestamps: true });

DrawEntrySchema.index({ draw: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('DrawEntry', DrawEntrySchema);
