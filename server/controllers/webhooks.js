import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const stripeWebhooks = async (request, response) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"]; // ✅ fixed spelling

  let event;

  try {
    // request.body অবশ্যই raw buffer হতে হবে
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      // Checkout session success হলে এখানে আসবে
      case "checkout.session.completed": {
        const session = event.data.object;

        const { transactionId, appId } = session.metadata || {};

        if (appId === "quickgpt") {
          const transaction = await Transaction.findOne({
            _id: transactionId,
            isPaid: false,
          });

          if (!transaction) {
            console.log("⚠️ Transaction not found or already paid");
            break;
          }

          // ✅ User credits update
          await User.updateOne(
            { _id: transaction.userId },
            { $inc: { credits: transaction.credits } }
          );

          // ✅ Mark transaction as paid
          transaction.isPaid = true;
          await transaction.save();

          console.log("✅ Transaction updated:", transactionId);
        } else {
          return response.json({
            received: true,
            message: "Ignored event: Invalid app",
          });
        }
        break;
      }

      default:
        console.log("⚠️ Unhandled event type:", event.type);
        break;
    }

    response.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    response.status(500).send("Internal Server Error");
  }
};
