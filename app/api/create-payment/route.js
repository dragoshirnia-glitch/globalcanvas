import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { blockX, blockY } = await request.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `GlobalCanvas Block [${blockX}, ${blockY}]`,
              description: 'Own your permanent piece of the world largest collaborative artwork',
            },
            unit_amount: 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}?success=true&block=${blockX}_${blockY}`,
      cancel_url: `${request.headers.get('origin')}?canceled=true`,
      metadata: {
        blockX: blockX.toString(),
        blockY: blockY.toString(),
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
