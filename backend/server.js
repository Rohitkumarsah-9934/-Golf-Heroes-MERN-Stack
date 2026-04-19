const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));

// ⚡ IMPORTANT: Stripe webhook MUST be registered BEFORE express.json()
// and BEFORE rate limiter — raw body required for signature verification
app.use('/api/webhook', express.raw({ type: 'application/json' }), require('./routes/webhook'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limit (applied AFTER webhook so Stripe isn't rate-limited)
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/scores',        require('./routes/scores'));
app.use('/api/draws',         require('./routes/draws'));
app.use('/api/charities',     require('./routes/charities'));
app.use('/api/winners',       require('./routes/winners'));
app.use('/api/admin',         require('./routes/admin'));

// Remove duplicate webhook — already registered above before rate limiter
app.get('/api/health', (req, res) => res.json({ success: true, message: 'Golf Heroes API Running 🏌️' }));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => { console.log(' MongoDB Connected'); app.listen(PORT, () => console.log(` Server on port ${PORT}`)); })
  .catch(err => { console.error(' DB Error:', err.message); process.exit(1); });

module.exports = app;
