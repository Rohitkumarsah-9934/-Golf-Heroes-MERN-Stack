const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  verifySession,
  cancelSubscription,
  getMySubscription,
  createPortalSession,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/my-subscription', getMySubscription);
router.get('/verify-session', verifySession);   // ← NEW: frontend calls this after redirect
router.post('/create-checkout', createCheckoutSession);
router.post('/cancel', cancelSubscription);
router.post('/portal', createPortalSession);

module.exports = router;
