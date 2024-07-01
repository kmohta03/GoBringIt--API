const pool = require('../../utils/db');
const axios = require('axios');


exports.checkNetID = async (event) => {
    try {
        
        const netID = event.pathParameters.netID;

        console.log('netID:', netID)

        // Validate required fields
        if (!netID) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'NetID is a requried field' })
            };
        }
        const userExistsQuery = `SELECT * FROM users WHERE netid = $1;`;
        const userExistsResult = await pool.query(userExistsQuery, [netID]);

        console.log('userExistsResult:', userExistsResult.rows[0])
        return {
            statusCode: 200,
            body: JSON.stringify(userExistsResult.rows[0] || {}),
            headers: {
                'Content-Type': 'application/json',
            }
        };

    } catch (error) {
        console.error('Error in checkNetID:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
            headers: {
                'Content-Type': 'application/json',
            }
        };
    }
};