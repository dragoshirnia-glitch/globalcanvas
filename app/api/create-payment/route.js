import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { blockX, blockY } = await request.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100,
      currency: 'eur',
      metadata: {
        blockX: blockX.toString(),
        blockY: blockY.toString(),
      },
    });

    return Response.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}