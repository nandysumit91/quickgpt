import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const stripeWebhooks = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // must be raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { transactionId, appId } = session.metadata || {};

      if (appId === "quickgpt") {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction || transaction.isPaid) {
          console.warn("Transaction not found or already paid");
          return res.status(404).send("Transaction not found");
        }

        transaction.isPaid = true;
        await transaction.save();

        const user = await User.findById(transaction.userId);
        if (user) {
          user.credits = (user.credits || 0) + transaction.credits;
          await user.save();
        }

        console.log("✅ Transaction completed & credits added:", transactionId);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).send("Internal Server Error");
  }
};
