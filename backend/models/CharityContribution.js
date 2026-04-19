const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  user:              { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  charity:           { type: mongoose.Schema.Types.ObjectId, ref: 'Charity', required: true },
  subscription:      { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  amount:            { type: Number, required: true },
  contributionMonth: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('CharityContribution', Schema);
