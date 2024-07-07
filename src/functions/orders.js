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

