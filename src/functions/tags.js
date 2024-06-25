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
