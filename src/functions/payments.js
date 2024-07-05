const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPaymentMethod = async (event, context) => {
    try {
        const requestBody = JSON.parse(event.body);
        const { email } = requestBody;

        // Optionally create or lookup the customer to attach the Setup Intent to
        let customer = await stripe.customers.list({ email: email, limit: 1 });
        if (customer.data.length === 0) {
            customer = await stripe.customers.create({
                email: email,
            });
        } else {
            customer = customer.data[0];
        }

        // Create the Setup Intent
        const setupIntent = await stripe.setupIntents.create({
            customer: customer.id,
            usage: 'off_session',
        });

        // Create an Ephemeral Key for the customer (adjust the API version as needed)
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: '2020-08-27' } // Use the Stripe API version that matches your client-side integration
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Setup Intent and Ephemeral Key created successfully',
                clientSecret: setupIntent.client_secret, // Important: Send clientSecret to the frontend
                customerId: customer.id,
                ephemeralKey: ephemeralKey.secret // Send the ephemeral key to the frontend
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message
            })
        };
    }
};


exports.confirmPaymentMethod = async (event, context) => {
    try {
        const requestBody = JSON.parse(event.body);
        const { setupIntentId, customerId } = requestBody;

        // Confirm the Setup Intent on the server side
        const setupIntent = await stripe.setupIntents.confirm(setupIntentId, {
            customer: customerId
        });

        // Attach the payment method to the customer and set as default
        const paymentMethod = setupIntent.payment_method;
        await stripe.paymentMethods.attach(paymentMethod, { customer: customerId });
        await stripe.customers.update(customerId, {
            invoice_settings: {
                default_payment_method: paymentMethod
            }
        });

        // Detach all other payment methods to ensure only one remains
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card'
        });

        const promises = paymentMethods.data
            .filter(pm => pm.id !== paymentMethod) // Filter out the current default payment method
            .map(pm => stripe.paymentMethods.detach(pm.id)); // Detach each of the old payment methods

        await Promise.all(promises);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Setup Intent confirmed and payment method updated successfully',
                setupIntent,
                customer: customerId
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message
            })
        };
    }
};
