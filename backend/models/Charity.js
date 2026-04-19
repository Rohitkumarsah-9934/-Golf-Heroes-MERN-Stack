const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  eventDate: { type: Date, required: true },
  location: String,
  imageUrl: String,
}, { timestamps: true });

const CharitySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, required: true },
  logoUrl:     String,
  websiteUrl:  String,
  isFeatured:  { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  totalRaised: { type: Number, default: 0 },
  events:      [EventSchema],
}, { timestamps: true });

module.exports = mongoose.model('Charity', CharitySchema);
