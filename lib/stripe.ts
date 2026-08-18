import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add your Stripe test secret key to .env to enable checkout."
    );
  }
  if (!_stripe) {
    _stripe = new Stripe(key);
  }
  return _stripe;
}
