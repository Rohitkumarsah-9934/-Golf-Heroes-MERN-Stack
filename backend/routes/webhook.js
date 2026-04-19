const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const CharityContribution = require('../models/CharityContribution');
const UserCharitySelection = require('../models/UserCharitySelection');

router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data.object;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        if (data.mode !== 'subscription') break;
        const userId = data.metadata.userId;
        const plan = data.metadata.plan;
        const stripeSub = await stripe.subscriptions.retrieve(data.subscription);

        await Subscription.findOneAndUpdate(
          { user: userId },
          {
            user: userId,
            stripeCustomerId: data.customer,
            stripeSubscriptionId: data.subscription,
            plan,
            status: 'active',
            amountPence: stripeSub.items.data[0].price.unit_amount,
            currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          },
          { upsert: true, new: true }
        );

        // Record charity contribution
        const charitySelection = await UserCharitySelection.findOne({ user: userId });
        if (charitySelection) {
          const subAmount = stripeSub.items.data[0].price.unit_amount / 100;
          const contribution = (subAmount * charitySelection.contributionPercentage) / 100;
          await CharityContribution.create({
            user: userId,
            charity: charitySelection.charity,
            amount: contribution,
            contributionMonth: new Date(),
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const user = await User.findOne({ stripeCustomerId: data.customer });
        if (!user) break;
        await Subscription.findOneAndUpdate(
          { user: user._id },
          {
            status: data.status,
            currentPeriodStart: new Date(data.current_period_start * 1000),
            currentPeriodEnd: new Date(data.current_period_end * 1000),
            cancelAtPeriodEnd: data.cancel_at_period_end,
          }
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const user = await User.findOne({ stripeCustomerId: data.customer });
        if (!user) break;
        await Subscription.findOneAndUpdate(
          { user: user._id },
          { status: 'cancelled', cancelledAt: new Date() }
        );
        break;
      }

      case 'invoice.payment_failed': {
        const user = await User.findOne({ stripeCustomerId: data.customer });
        if (!user) break;
        await Subscription.findOneAndUpdate({ user: user._id }, { status: 'past_due' });
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

module.exports = router;
