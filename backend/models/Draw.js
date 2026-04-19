const mongoose = require('mongoose');

const DrawSchema = new mongoose.Schema({
  title:            { type: String, required: true },
  drawMonth:        { type: Date, required: true },
  status:           { type: String, enum: ['pending','simulated','published','completed'], default: 'pending' },
  drawType:         { type: String, enum: ['random','algorithmic'], default: 'random' },
  winningNumbers:   { type: [Number], default: [] },
  totalPool:        { type: Number, default: 0 },
  jackpotPool:      { type: Number, default: 0 },
  match4Pool:       { type: Number, default: 0 },
  match3Pool:       { type: Number, default: 0 },
  jackpotRolledOver: { type: Boolean, default: false },
  rolledOverAmount: { type: Number, default: 0 },
  subscriberCount:  { type: Number, default: 0 },
  publishedAt:      Date,
}, { timestamps: true });

DrawSchema.statics.calculatePools = function(subscriberCount, rolledOver = 0) {
  const total = parseFloat(((subscriberCount * 10 * 0.5) + rolledOver).toFixed(2));
  return {
    totalPool:   total,
    jackpotPool: parseFloat((total * 0.40).toFixed(2)),
    match4Pool:  parseFloat((total * 0.35).toFixed(2)),
    match3Pool:  parseFloat((total * 0.25).toFixed(2)),
  };
};

module.exports = mongoose.model('Draw', DrawSchema);
