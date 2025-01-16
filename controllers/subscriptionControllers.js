require('dotenv').config(); // Load environment variables from .env

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Store price IDs for plans
const PLANS = {
    basic: process.env.STRIPE_BASIC_PLAN,
    pro: process.env.STRIPE_PRO_PLAN,
};

exports.subscribe = async (req, res) => {
    const { email, planType } = req.body;

    if (!email || !planType || !PLANS[planType]) {
        return res.status(400).json({ error: 'Invalid request parameters' });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: PLANS[planType],
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: process.env.SUCCESS_URL,
            cancel_url: process.env.CANCEL_URL,
            customer_email: email,
        });

        res.status(200).json({
            paymentLink: session.url,
        });
    } catch (error) {
        console.error('Error creating checkout session:', error.message);
        res.status(400).json({ error: error.message });
    }
};


exports.updateSubscription = async (req, res) => {
    const { subscriptionId, newPlan } = req.body;

    if (!subscriptionId || !newPlan || !PLANS[newPlan]) {
        return res.status(400).json({ error: 'Invalid request parameters' });
    }

    try {
        // Retrieve the subscription
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        // Check if subscription is in an active state
        if (subscription.status !== 'active') {
            return res.status(400).json({ error: 'Cannot update a subscription that is not active' });
        }

        // Update the subscription with the new plan
        const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
            items: subscription.items.data.map((item) => ({
                id: item.id, // Existing subscription item ID
                price: PLANS[newPlan], // New plan's price ID
            })),
            proration_behavior: 'none',  // No proration if you want to handle payments separately
        });

        // Create a checkout session if the user needs to make a payment (for proration, etc.)
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: PLANS[newPlan],  // New plan's price ID
                    quantity: 1,
                },
            ],
            mode: 'subscription',  
            success_url: process.env.SUCCESS_URL,
            cancel_url: process.env.CANCEL_URL,
            customer_email: updatedSubscription.customer_email,
         });

        // Return the checkout session URL
        res.status(200).json({
            message: 'Subscription updated successfully',
            // subscription: updatedSubscription,
            paymentLink: session.url,  // Provide the link to the checkout page
        });
    } catch (error) {
        console.error('Error updating subscription:', error.message);
        res.status(400).json({ error: error.message });
    }
};