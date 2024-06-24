const pool = require('../utils/db');

exports.list = async (event) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM Restaurants;');
        client.release();

        return {
        statusCode: 200,
            body: JSON.stringify(result.rows || [])
        };
    } catch (error) {
        if (error.code === 'ETIMEDOUT') {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Function timed out, try reconnecting RDS with associated lambda in AWS Lambda interface' })
            }
        }  else {
        console.error('Error executing query:', error);
                return {
                    statusCode: 500,
                    body: JSON.stringify({ error: 'Failed to retrieve items' })
                }
        };
    }
}

exports.get = async (event) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM Restaurants WHERE restaurant_id = $1;', [event.pathParameters.id]);
        client.release();

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows[0] || {})
        };
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve items' })
        };
    }
}


exports.create = async (event) => {
    try {
        const data = JSON.parse(event.body);
        const {
            name, cuisine, description, image, link, email, phone, icon,
            minimumorderamount, deliveryfee, indefinitelyclosed,
            mondayopen, mondayclose, tuesdayopen, tuesdayclose, 
            wednesdayopen, wednesdayclose, thursdayopen, thursdayclose, 
            fridayopen, fridayclose, saturdayopen, saturdayclose, 
            sundayopen, sundayclose
        } = data;

        // Validate required fields
        if (!name || !cuisine) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Name and cuisine are required fields' })
            };
        }

        const client = await pool.connect();
        const result = await client.query(`
            INSERT INTO Restaurants (
                name, cuisine, description, image, link, email, phone, icon,
                minimumorderamount, deliveryfee, indefinitelyclosed,
                mondayopen, mondayclose, tuesdayopen, tuesdayclose,
                wednesdayopen, wednesdayclose, thursdayopen, thursdayclose,
                fridayopen, fridayclose, saturdayopen, saturdayclose,
                sundayopen, sundayclose
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, 
                $19, $20, $21, $22, $23, $24, $25
            )
            RETURNING *;
        `, [
            name, cuisine, description, image, link, email, phone, icon,
            minimumorderamount, deliveryfee, indefinitelyclosed,
            mondayopen, mondayclose, tuesdayopen, tuesdayclose,
            wednesdayopen, wednesdayclose, thursdayopen, thursdayclose,
            fridayopen, fridayclose, saturdayopen, saturdayclose,
            sundayopen, sundayclose
        ]);
        client.release();
        return {
            statusCode: 201,
            body: JSON.stringify(result.rows[0] || {}),
            headers: {
                'Content-Type': 'application/json',
            }
        };
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to create restaurant' })
        };
    }
};



exports.delete = async (event) => {
    try {
        const id = event.pathParameters.id;
        const client = await pool.connect();
        const result = await client.query('DELETE FROM Restaurants WHERE restaurant_id = $1', [id]);
        client.release();
        return {
            statusCode: 204,
            body: JSON.stringify({ message: "Restaurant deleted" })
        };
    } catch (error) {
        if (error.code === 'ETIMEDOUT') {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Function timed out, try reconnecting RDS with associated lambda in AWS Lambda interface' })
            };
        } else {
            console.error('Error executing query:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to delete restaurant' })
            };
        }
    }
};


exports.update = async (event) => {
    try {
        const id = event.pathParameters.id;
        const data = JSON.parse(event.body);
        const {
            name, cuisine, description, image, link, email, phone, icon,
            minimumOrderAmount, deliveryFee, indefinitelyClosed,
            mondayOpen, mondayClose, tuesdayOpen, tuesdayClose,
            wednesdayOpen, wednesdayClose, thursdayOpen, thursdayClose,
            fridayOpen, fridayClose, saturdayOpen, saturdayClose,
            sundayOpen, sundayClose
        } = data;

        const client = await pool.connect();

        // Construct the SET clause dynamically based on provided data
        let setClause = '';
        const updateParams = [];
        let paramIndex = 1;

        const fieldsToUpdate = {
            name, cuisine, description, image, link, email, phone, icon,
            minimumOrderAmount, deliveryFee, indefinitelyClosed,
            mondayOpen, mondayClose, tuesdayOpen, tuesdayClose,
            wednesdayOpen, wednesdayClose, thursdayOpen, thursdayClose,
            fridayOpen, fridayClose, saturdayOpen, saturdayClose,
            sundayOpen, sundayClose
        };

        for (const [key, value] of Object.entries(fieldsToUpdate)) {
            if (value !== undefined) {  // Ensure only defined fields are included
                setClause += `${key} = $${paramIndex}, `;
                updateParams.push(value);
                paramIndex++;
            }
        }

        // Remove trailing comma and space
        if (updateParams.length > 0) {
            setClause = setClause.slice(0, -2);
        }

        // Execute the update query only if there are fields to update
        if (updateParams.length > 0) {
            const result = await client.query(
                `UPDATE Restaurants
                SET ${setClause}
                WHERE restaurant_id = $${paramIndex}
                RETURNING *;`,
                [...updateParams, id]
            );

            client.release();

            if (result.rows.length === 0) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: "Restaurant not found" })
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(result.rows[0])
            };
        } else {
            // No fields to update
            client.release();
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "No fields to update" })
            };
        }
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to update restaurant' })
        };
    }
};

