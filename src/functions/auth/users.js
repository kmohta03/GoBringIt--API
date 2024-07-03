const pool = require('../../utils/db');

exports.create = async (event) => {
    try {
        const { netID, givenname, display_name, email, home_address, phone_number, stripe_id, admin } = JSON.parse(event.body);

        const checkAdmin = admin ? admin : false;

        // Validate input fields
        if (!netID || !givenname || !display_name || !email) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields' })
            };
        }

        // Check if the email already exists
        const existingUser = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);

        if (existingUser.rows.length > 0) {
            return {
                statusCode: 409,
                body: JSON.stringify({ message: 'User with this email already exists' })
            };
        }

        // Create user in the database
        await pool.query('INSERT INTO Users (netID, givenname, display_name, email, home_address, phone_number, stripe_id, admin) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [netID, givenname, display_name, email, home_address, phone_number, stripe_id, checkAdmin]);

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'User created successfully' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};

// Update other queries in your code similarly

exports.get = async (event) => {
    try {
        console.log("Received event:", event);
        const netID = event.pathParameters.id;
        console.log("netID extracted:", netID);

        const user = await pool.query('SELECT * FROM Users WHERE netID = $1', [netID]);
        console.log("Query executed, user found:", user.rows);

        if (user.rows.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found' })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(user.rows[0])
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error', error: error.toString() })
        };
    }
};

