const pool = require('../utils/db');

// for admin dash
exports.buildMenus = async () => {
    try {
        const client = await pool.connect();

        const query = `
        SELECT json_agg(
            json_build_object(
                'id', r.restaurant_id,
                'name', r.name
                // TODO: Add more restaurant details
            )
        )
        FROM Restaurants r;
        `;

        const result = await client.query(query);
        client.release();

        return result.rows[0].json_agg;
    } catch (error) {
        console.error('Error executing query:', error);
        throw new Error('Failed to retrieve menu items');
    }
};