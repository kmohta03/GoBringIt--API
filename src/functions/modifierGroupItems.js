const pool = require('../utils/db');


exports.create = async (event) => {
    try {
        // Parse the JSON body from the event
        const { modifier_group_id, item_id, new_price } = JSON.parse(event.body);

        // Validate the required fields
        if (!modifier_group_id || !item_id ) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing required fields: modifier_group_id, item_id, must be provided." })
            };
        }

        const client = await pool.connect();

        // Insert the new ModifierGroupItem into the database
        const queryText = `
            INSERT INTO ModifierGroupItems (modifier_group_id, item_id, new_price)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const result = await client.query(queryText, [modifier_group_id, item_id, new_price ? new_price : 0]);
        client.release();

        // Check if the insert operation was successful
        if (result.rows.length > 0) {
            return {
                statusCode: 201,
                body: JSON.stringify(result.rows[0])
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Failed to create modifier group item" })
            };
        }
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Database operation failed' })
        };
    } 
};


exports.listByModifierGroup = async (event) => {
    try {
        const modifier_group_id = event.pathParameters.id;
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM ModifierGroupItems WHERE modifier_group_id = $1;', [modifier_group_id]);
        client.release();

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows || [])
        };
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve modifier group items' })
        };
    }
};

exports.listByItem = async (event) => {
    try {
        const item_id = event.pathParameters.id;
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM ModifierGroupItems WHERE item_id = $1;', [item_id]);
        client.release();

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows || [])
        };
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve modifier group items' })
        };
    }
};


exports.update = async (event) => {
    let client;
    try {
        const { modifier_group_id, item_id, new_price } = JSON.parse(event.body);

        // Validate the required identifiers
        if (!modifier_group_id || !item_id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing required identifiers: modifier_group_id and item_id must be provided." })
            };
        }

        client = await pool.connect();
        let updates = [];
        let params = [];
        let index = 1;

        // Only add new_price to the update if it's provided
        if (new_price !== undefined) {
            updates.push(`new_price = $${index}`);
            params.push(new_price);
            index++;
        }

        // Ensure there's something to update
        if (updates.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "No fields provided for update" })
            };
        }

        // Add identifiers to the parameter list
        params.push(modifier_group_id, item_id);

        // Construct the SQL query dynamically based on provided data
        const queryText = `
            UPDATE ModifierGroupItems
            SET ${updates.join(', ')}
            WHERE modifier_group_id = $${index} AND item_id = $${index + 1}
            RETURNING *; 
        `;
        const result = await client.query(queryText, params);
        client.release();

        // Check if the update operation was successful
        if (result.rows.length > 0) {
            return {
                statusCode: 200,
                body: JSON.stringify(result.rows[0])
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "Modifier group item not found or no changes made" })
            };
        }
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to update modifier group item' })
        };
    } 
};


exports.delete = async (event) => {
    try {
        const { modifier_group_id, item_id } = event.pathParameters;
        const client = await pool.connect();
        const result = await client.query('DELETE FROM ModifierGroupItems WHERE modifier_group_id = $1 AND item_id = $2 RETURNING *;', [modifier_group_id, item_id]);
        client.release();

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows[0] || {})
        };
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to delete modifier group item' })
        };
    }
};