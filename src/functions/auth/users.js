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




exports.update = async (event) => {
    try {
        const netID = event.pathParameters.id;
        const userData = JSON.parse(event.body);

        // Fetch the current user data to check existence
        const existingUser = await pool.query('SELECT * FROM Users WHERE netID = $1', [netID]);
        if (existingUser.rows.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found' })
            };
        }

        // Prepare dynamic SQL query for updating only provided fields
        let query = 'UPDATE Users SET ';
        let fieldValues = [];
        let count = 1;

        Object.keys(userData).forEach(field => {
            if (field !== 'netID' && userData[field] !== undefined) { // ensure the field is not the identifier and is provided
                query += `${field} = $${count}, `;
                fieldValues.push(userData[field]);
                count++;
            }
        });

        if (fieldValues.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'No valid fields provided for update' })
            };
        }

        query = query.slice(0, -2); // remove the last comma and space
        query += ` WHERE netID = $${count}`;
        fieldValues.push(netID);

        // Execute the update query
        await pool.query(query, fieldValues);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User updated successfully' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};



exports.delete = async (event) => {
    try {
        const netID = event.pathParameters.id;

        // Delete user
        await pool.query('DELETE FROM Users WHERE netID = $1', [netID]);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User deleted successfully' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};

