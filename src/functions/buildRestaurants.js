const pool = require('../utils/db');

// for admin dash
exports.buildMenus = async () => {
    try {
        const client = await pool.connect();
        // TODO: Implement query
        client.release();
    } catch (error) {
        console.error('Error executing query:', error);
        throw new Error('Failed to retrieve menu items');
    }
};