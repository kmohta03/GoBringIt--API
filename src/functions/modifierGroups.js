const pool = require('../utils/db');

exports.listByRestaurant = async (event) => {
    try {
        const restaurant_id = event.pathParameters.id;
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM ModifierGroups WHERE restaurant_id = $1;', [restaurant_id]);
        client.release();

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows || [])
        };
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve modifier groups' })
        };
    }
}

exports.create = async (event) => {
    let client;  // Declare client outside the try block to ensure it's accessible in the catch block
    try {
        // Parse the request body
        const { restaurant_id, name, min_needed, max_needed } = JSON.parse(event.body);

        // Validate the input
        if (!restaurant_id || !name ) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        client = await pool.connect();  

        // Insert the new ModifierGroup into the database
        const queryText = `
            INSERT INTO ModifierGroups (restaurant_id, name, min_needed, max_needed)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await client.query(queryText, [
            restaurant_id,
            name,
            min_needed !== undefined ? min_needed : 0,
            max_needed !== undefined ? max_needed : 0
        ]);
                client.release();

        // Check if result contains rows and handle accordingly
        if (result.rows.length > 0) {
            return {
                statusCode: 201,
                body: JSON.stringify(result.rows[0])
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'No modifier group was created' })
            };
        }
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to create modifier group' })
        };
    } 
};

exports.update = async (event) => {
    try {
        const modifier_group_id = event.pathParameters.id;  // ID from path parameter
        const data = JSON.parse(event.body);
        const { name, min_needed, max_needed } = data;

        const client = await pool.connect();
        let setClause = '';
        const updateParams = [];
        let paramIndex = 1;

        if (name) {
            setClause += `name = $${paramIndex}, `;
            updateParams.push(name);
            paramIndex++;
        }
        if (min_needed !== undefined) {  // Correct check
            setClause += `min_needed = $${paramIndex}, `;
            updateParams.push(min_needed);
            paramIndex++;
        }
        if (max_needed !== undefined) {  // Correct check
            setClause += `max_needed = $${paramIndex}, `;
            updateParams.push(max_needed);
            paramIndex++;
        }
        

        // Remove trailing comma and space from the set clause
        setClause = setClause.slice(0, -2);

        if (updateParams.length > 0) {
            const queryText = `
                UPDATE ModifierGroups
                SET ${setClause}
                WHERE modifier_group_id = $${paramIndex}
                RETURNING *;
            `;
            const result = await client.query(queryText, [...updateParams, modifier_group_id]);

            client.release();

            if (result.rows.length === 0) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: "Modifier group not found" })
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(result.rows[0])
            };
        } else {
            client.release();
            // No fields to update
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "No fields provided for update" })
            };
        }
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to update modifier group' })
        };
    }
};


exports.delete = async (event) => {
    try {
        const id = event.pathParameters.id;

        const client = await pool.connect();
        const result = await client.query('DELETE FROM ModifierGroups WHERE modifier_group_id = $1 RETURNING *;', [id]);
        client.release();

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows[0] || {})
        };
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to delete modifier group' })
        };
    }
}



