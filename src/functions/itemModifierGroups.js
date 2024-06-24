const pool = require('../utils/db');


exports.createAssociation = async (event) => {
    try {
        const { item_id, modifier_group_id } = JSON.parse(event.body);

        if (!item_id || !modifier_group_id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing required fields: item_id and modifier_group_id must be provided." })
            };
        }

        const client = await pool.connect();
        const queryText = `
            INSERT INTO ItemModifierGroups (item_id, modifier_group_id)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const result = await client.query(queryText, [item_id, modifier_group_id]);
        client.release();

        return {
            statusCode: 201,
            body: JSON.stringify(result.rows[0])
        };
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Database operation failed' })
        };
    }
};


exports.getAssociations = async (event) => {
    try {
        const { item_id, modifier_group_id } = event.queryStringParameters;
        const client = await pool.connect();
        let queryText = 'SELECT * FROM ItemModifierGroups';
        let queryParams = [];

        if (item_id) {
            queryText += ' WHERE item_id = $1';
            queryParams.push(item_id);
        } else if (modifier_group_id) {
            queryText += ' WHERE modifier_group_id = $1';
            queryParams.push(modifier_group_id);
        }

        const result = await client.query(queryText, queryParams);
        client.release();

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows)
        };
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve associations' })
        };
    }
};


exports.deleteAssociation = async (event) => {
    try {
        const { item_id, modifier_group_id } = event.pathParameters;
        console.log('item_id:', item_id, 'modifier_group_id:', modifier_group_id); // Add this line

        const client = await pool.connect();
        const queryText = `
            DELETE FROM ItemModifierGroups
            WHERE item_id = $1 AND modifier_group_id = $2
            RETURNING *;
        `;
        const result = await client.query(queryText, [item_id, modifier_group_id]);
        client.release();

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows[0] || {})
        };
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to delete association' })
        };
    }
};

