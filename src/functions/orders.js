// const authenticateToken = require('../utils/authenticate');
const pool = require('../utils/db'); 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticateToken } = require('../utils/authenticate');
const AWS = require('aws-sdk');
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


exports.orderByUser = async (event) => {
    // Extract user ID from the event, assuming it's passed as a path parameter
    const userId = event.pathParameters.userId;

    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'User ID is required' })
        };
    }

    try {
        const client = await pool.connect();
        // Query to select orders by customer_id and sort them by the 'time' field in the JSONB 'order_data'
        const queryText = 'SELECT order_data FROM orders WHERE customer_id = $1 ORDER BY (order_data ->> \'time\')::bigint DESC;';
        const result = await client.query(queryText, [userId]);
        client.release();

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows.map(row => row.order_data))
        };
    } catch (error) {
        console.error('Error executing query:', error);
        if (client) client.release(); // Ensure the client is released in case of an error
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve orders' })
        };
    }
};



// Check restaurant open
// gobringitserverless-dev-getRestaurant 


exports.create = async (event) => {
    const authEvent = await authenticateToken(event);
    console.log("Authentication event:", authEvent);
    if (authEvent.statusCode === 401) {
        return authEvent;
    }

    const userId = event.pathParameters.userId;
    const { orderData, payWithCard, totalPayment, stripeID, cardLastFour, emailList } = JSON.parse(event.body);

    if (!userId || !orderData) {
        console.error("Missing user ID or order data");
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'User ID and order data are required' })
        };
    }

    // Invoke addOrderToUser Lambda function asynchronously
    const lambda = new AWS.Lambda();
    const params = {
        FunctionName: 'gobringitserverless-dev-addOrderToUser', // Name of your Lambda function
        InvocationType: 'Event', // Asynchronous invocation
        Payload: JSON.stringify({ userId, orderData }) // Data to pass to the function
    };

    let paymentIntent;
    console.log(payWithCard, stripeID, cardLastFour, totalPayment, orderData)
    if (payWithCard) {
        try {
            console.log("Attempting to retrieve customer from Stripe:", stripeID);
            const customer = await stripe.customers.retrieve(stripeID);
            console.log("Customer retrieved:", customer);

            const paymentMethods = await stripe.paymentMethods.list({
                customer: stripeID,
                type: 'card'
            });


            const selectedPaymentMethod = paymentMethods.data.find(pm => pm.card.last4 === cardLastFour);
            if (!selectedPaymentMethod) {
                console.error("No matching card found for last four digits:", cardLastFour);
                throw new Error("No matching card found");
            }

            const amountInCents = Math.round(totalPayment * 100);
            console.log("Creating payment intent for amount (in cents):", amountInCents);
            paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: 'usd',
                customer: stripeID,
                payment_method: selectedPaymentMethod.id,
                confirm: true,
                automatic_payment_methods: {
                    enabled: true,
                    allow_redirects: 'never'
                }
            });
            console.log("Payment intent created:", paymentIntent);
        } catch (error) {
            console.error('Error executing payment:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to process payment', details: error.message })
            };
        }
    }

    // send email
 
    // get all restaurants in order and send each an email with their respective order
    emailList.forEach(async (email) => {
        console.log(email.order, email)
        const splitEmails = email.email.split(',').map(e => e.trim());
        const msg = {
            to: [ `${email.customer}@duke.edu`, ...splitEmails],
            from: {
                email: 'info@campusenterprises.com',
                name :email.order[0].restaurantName
            },
            templateId: 'd-98449f3672524fe2b1e65d9296650545',
            dynamic_template_data: {
                order: email.order,
                customer: email.customer,
                home_address: email.home_address,
                subtotal: email.subtotal,
                deliveryFee: email.delivery_fee,
                total: email.total,
                phone_number: email.phone,
                paymentMethod: payWithCard ? `Card ending in ${last4}` : 'Food points at dropoff'
            }
        };
        sgMail.send(msg);
    }
    )
    
    try {
        console.log("Invoking addOrderToUser function with params:", params);
        const response = await lambda.invoke(params).promise();
        console.log("Lambda invocation response:", response);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Order created', response, paymentIntent })
        };
    } catch (error) {
        console.error('Error invoking addOrderToUser Lambda function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to initiate order creation', details: error.message })
        };
    }
};



exports.addOrderToUser = async (event) => {
    console.log('Event:', event)
    const { userId, orderData } = event;
    
    console.log('Adding order to user:', userId, orderData);

    if (!userId || !orderData) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'User ID and order data are required' })
        };
    }


    try {
        const client = await pool.connect();
        // Insert the new order data into the orders table
        const queryText = 'INSERT INTO orders (customer_id, order_data) VALUES ($1, $2) RETURNING *;';
        const result = await client.query(queryText, [userId, orderData]);
        client.release();

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Order created successfully', order: result.rows[0].order_data })
        };
    } catch (error) {
        console.error('Error executing query:', error);
        if (client) client.release(); // Ensure the client is released in case of an error
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to create order' })
        };
    }
}