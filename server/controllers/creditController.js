import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ================== Plans ==================
const plans = [
  {
    _id: "basic",
    name: "Basic",
    price: 10,
    credits: 100,
    features: [
      "100 text generations",
      "50 image generations",
      "Standard support",
      "Access to basic models",
    ],
  },
  {
    _id: "pro",
    name: "Pro",
    price: 20,
    credits: 500,
    features: [
      "500 text generations",
      "200 image generations",
      "Priority support",
      "Access to pro models",
      "Faster response time",
    ],
  },
  {
    _id: "premium",
    name: "Premium",
    price: 30,
    credits: 1000,
    features: [
      "1000 text generations",
      "500 image generations",
      "24/7 VIP support",
      "Access to premium models",
      "Dedicated account manager",
    ],
  },
];

// ================== Get All Plans ==================
export const getPlans = async (req, res) => {
  try {
    res.json({ success: true, plans });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ================== Purchase Plan ==================
export const purchasePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;
    const plan = plans.find((plan) => plan._id === planId);

    if (!plan) {
      return res.json({ success: false, message: "Invalid plan" });
    }

    // Create new transaction with isPaid: false (pending)
    const transaction = await Transaction.create({
      userId: userId,
      planId: plan._id,
      amount: plan.price,
      credits: plan.credits,
      isPaid: false,
    });

    const { origin } = req.headers;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: plan.price * 100,
            product_data: {
              name: plan.name,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/success`, // frontend route after payment
      cancel_url: `${origin}/cancel`,
      metadata: { transactionId: transaction._id.toString(), appId: "quickgpt" },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min expiry
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Purchase Error:", error);
    res.json({ success: false, message: error.message });
  }
};

// ================== Stripe Webhook ==================
export const stripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody, // make sure raw body middleware is used
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const transactionId = session.metadata?.transactionId;
      const transaction = await Transaction.findById(transactionId);

      if (transaction && !transaction.isPaid) {
        // ✅ mark transaction as paid
        transaction.isPaid = true;
        await transaction.save();

        // ✅ add credits to user
        const user = await User.findById(transaction.userId);
        if (user) {
          user.credits = (user.credits || 0) + transaction.credits;
          await user.save();
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).send("Internal Server Error");
  }
};
