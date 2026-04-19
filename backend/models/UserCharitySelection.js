const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  user:                   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  charity:                { type: mongoose.Schema.Types.ObjectId, ref: 'Charity', required: true },
  contributionPercentage: { type: Number, required: true, min: 10, max: 100, default: 10 },
  isIndependentDonation:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('UserCharitySelection', Schema);
