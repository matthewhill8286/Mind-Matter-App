import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-04-10',
});

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      // One-time payment completed (lifetime)
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;

        if (!userId) {
          console.error('No user_id in session metadata');
          break;
        }

        if (session.mode === 'payment') {
          // Lifetime purchase
          await supabase
            .from('profiles')
            .update({
              subscription_type: 'lifetime',
              subscription_expiry: null,
            })
            .eq('user_id', userId);
        }

        if (session.mode === 'subscription') {
          // Monthly subscription started
          const subscriptionId = session.subscription as string;
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

          await supabase
            .from('profiles')
            .update({
              subscription_type: 'monthly',
              subscription_expiry: periodEnd,
            })
            .eq('user_id', userId);
        }

        break;
      }

      // Subscription renewed
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = sub.metadata?.user_id;

        if (!userId) {
          console.error('No user_id in subscription metadata');
          break;
        }

        const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

        await supabase
          .from('profiles')
          .update({
            subscription_type: 'monthly',
            subscription_expiry: periodEnd,
          })
          .eq('user_id', userId);

        break;
      }

      // Subscription cancelled or payment failed
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;

        if (!userId) break;

        // Mark as expired by setting expiry to now
        await supabase
          .from('profiles')
          .update({
            subscription_expiry: new Date().toISOString(),
          })
          .eq('user_id', userId);

        break;
      }

      // Payment failed on renewal
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = sub.metadata?.user_id;

        if (!userId) break;

        // Don't immediately expire — Stripe will retry.
        // The subscription.deleted event handles final cancellation.
        console.log(`Payment failed for user ${userId}, Stripe will retry.`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error('Error processing webhook:', err);
    return new Response('Webhook handler failed', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
