const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user:                 { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  stripeCustomerId:     String,
  stripeSubscriptionId: String,
  plan:                 { type: String, enum: ['monthly','yearly'], required: true },
  status:               { type: String, enum: ['active','inactive','cancelled','past_due','trialing'], default: 'inactive' },
  amountPence:          { type: Number, default: 0 },
  currency:             { type: String, default: 'gbp' },
  currentPeriodStart:   Date,
  currentPeriodEnd:     Date,
  cancelAtPeriodEnd:    { type: Boolean, default: false },
  cancelledAt:          Date,
}, { timestamps: true });

SubscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && (!this.currentPeriodEnd || this.currentPeriodEnd > new Date());
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
