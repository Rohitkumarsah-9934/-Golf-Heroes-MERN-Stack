const mongoose = require('mongoose');

const GolfScoreSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score:     { type: Number, required: true, min: 1, max: 45 },
  scoreDate: { type: Date, required: true },
  notes:     String,
}, { timestamps: true });

GolfScoreSchema.index({ user: 1, scoreDate: 1 }, { unique: true });

GolfScoreSchema.statics.getLatestFive = function(userId) {
  return this.find({ user: userId }).sort({ scoreDate: -1 }).limit(5);
};

GolfScoreSchema.statics.enforceRollingLimit = async function(userId) {
  const all = await this.find({ user: userId }).sort({ scoreDate: -1 });
  if (all.length > 5) {
    const toDelete = all.slice(5).map(s => s._id);
    await this.deleteMany({ _id: { $in: toDelete } });
  }
};

module.exports = mongoose.model('GolfScore', GolfScoreSchema);
