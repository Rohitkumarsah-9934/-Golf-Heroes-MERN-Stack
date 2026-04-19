const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Subscription = require('../models/Subscription');
const User = require('../models/User');

// POST /api/subscriptions/create-checkout
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { plan } = req.body;
    const priceId = plan === 'yearly'
      ? process.env.STRIPE_YEARLY_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID;

    let customerId = req.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.fullName,
        metadata: { userId: req.user._id.toString() },
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(req.user._id, { stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscribe?cancelled=true`,
      metadata: { userId: req.user._id.toString(), plan },
    });

    res.json({ success: true, url: session.url });
  } catch (err) { next(err); }
};

// GET /api/subscriptions/verify-session?session_id=xxx
exports.verifySession = async (req, res, next) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ success: false, message: 'session_id required' });

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription'],
    });

    if (session.payment_status !== 'paid') {
      return res.json({ success: false, message: 'Payment not completed' });
    }

    const userId = session.metadata.userId;
    const plan = session.metadata.plan;
    const stripeSub = session.subscription;

    const sub = await Subscription.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: stripeSub.id,
        plan,
        status: 'active',
        amountPence: stripeSub.items.data[0].price.unit_amount,
        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: sub });
  } catch (err) { next(err); }
};

// POST /api/subscriptions/cancel
exports.cancelSubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id });
    if (!sub?.stripeSubscriptionId) {
      return res.status(404).json({ success: false, message: 'No active subscription' });
    }
    await stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true });
    sub.cancelAtPeriodEnd = true;
    await sub.save();
    res.json({ success: true, data: sub });
  } catch (err) { next(err); }
};

// GET /api/subscriptions/my-subscription
exports.getMySubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id });
    res.json({ success: true, data: sub });
  } catch (err) { next(err); }
};

// POST /api/subscriptions/portal
exports.createPortalSession = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.stripeCustomerId) {
      return res.status(400).json({ success: false, message: 'No billing account found' });
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/dashboard`,
    });
    res.json({ success: true, url: session.url });
  } catch (err) { next(err); }
};
