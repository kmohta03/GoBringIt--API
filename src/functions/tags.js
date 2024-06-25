const pool = require('../utils/db');

exports.createTag = async (event) => {
    try {
        const { name, icon } = JSON.parse(event.body);

        if (!name) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing required field: name must be provided." })
            };
        }

        const client = await pool.connect();
        const queryText = `
            INSERT INTO Tags (name, icon)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const result = await client.query(queryText, [name, icon || null]);
        client.release();

        if (result.rows.length > 0) {
            return {
                statusCode: 201,
                body: JSON.stringify(result.rows[0])
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Failed to create tag" })
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


exports.deleteTag = async (event) => {
    try {
        const { id } = event.pathParameters;
        const client = await pool.connect();
        const result = await client.query('DELETE FROM Tags WHERE tag_id = $1 RETURNING *;', [id]);
        client.release();

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows[0] || {})
        };
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to delete tag' })
        };
    }
};


exports.createRestaurantTag = async (event) => {
    try {
        const { restaurant_id, tag_id } = JSON.parse(event.body);

        if (!restaurant_id || !tag_id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing required fields: restaurant_id and tag_id must be provided." })
            };
        }

        const client = await pool.connect();
        const queryText = `
            INSERT INTO RestaurantTags (restaurant_id, tag_id)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const result = await client.query(queryText, [restaurant_id, tag_id]);
        client.release();

        if (result.rows.length > 0) {
            return {
                statusCode: 201,
                body: JSON.stringify(result.rows[0])
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Failed to create restaurant tag link" })
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


exports.deleteRestaurantTag = async (event) => {
    try {
        const { restaurant_id, tag_id } = event.pathParameters;
        const client = await pool.connect();
        const result = await client.query('DELETE FROM RestaurantTags WHERE restaurant_id = $1 AND tag_id = $2 RETURNING *;', [restaurant_id, tag_id]);
        client.release();

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows[0] || {})
        };
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to delete restaurant tag link' })
        };
    }
};

