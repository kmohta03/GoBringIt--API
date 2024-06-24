const pool = require('../utils/db');

exports.create = async (event) => {
    try {
        const data = JSON.parse(event.body);
        const { restaurant_id, category_id, name, description, image, price, is_featured } = data;

        if (!restaurant_id || !category_id || !name || !price) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Restaurant ID, category ID, name, and price are required fields' })
            };
        }

        const client = await pool.connect();
        const result = await client.query(`
            INSERT INTO Items (restaurant_id, category_id, name, description, image, price, is_featured)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `, [restaurant_id, category_id, name, description, image, price, is_featured ?? false]);
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
            body: JSON.stringify({ error: 'Failed to create item' })
        };
    }
};



// Get all items by restaurant
exports.listByRestaurant = async (event) => {
    try {
        const restaurant_id = event.pathParameters.id;
        
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM Items WHERE restaurant_id = $1;', [restaurant_id]);
        client.release();

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows || [])
        };
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve items for the restaurant' })
        };
    }
};

// Get all items by category using the category_id from path parameters
exports.listByCategory = async (event) => {
    try {
        // Accessing the category_id from the path parameters
        const category_id = event.pathParameters.id;  // Ensure the parameter name matches the one specified in API Gateway

        const client = await pool.connect();
        const result = await client.query('SELECT * FROM Items WHERE category_id = $1;', [category_id]);
        client.release();

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows || [])
        };
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve items for the category' })
        };
    }
};



exports.update = async (event) => {
    try {
        const item_id = event.pathParameters.id;
        const data = JSON.parse(event.body);
        const { name, description, image, price, category_id, is_featured } = data;

        const setClauses = [];
        const values = [];
        let index = 1;

        if (name) {
            setClauses.push(`name = $${index}`);
            values.push(name);
            index++;
        }
        if (description) {
            setClauses.push(`description = $${index}`);
            values.push(description);
            index++;
        }
        if (image) {
            setClauses.push(`image = $${index}`);
            values.push(image);
            index++;
        }
        if (price) {
            setClauses.push(`price = $${index}`);
            values.push(price);
            index++;
        }
        if (category_id) {
            setClauses.push(`category_id = $${index}`);
            values.push(category_id);
            index++;
        }
        if (is_featured !== undefined) { // Handle boolean including if it's false explicitly
            setClauses.push(`is_featured = $${index}`);
            values.push(is_featured);
            index++;
        }

        if (setClauses.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No fields provided for update' })
            };
        }

        const client = await pool.connect();
        const query = `
            UPDATE Items
            SET ${setClauses.join(', ')}
            WHERE item_id = $${index}
            RETURNING *;
        `;
        values.push(item_id);

        const result = await client.query(query, values);
        client.release();

        if (result.rows.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Item not found' })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows[0])
        };
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to update item' })
        };
    }
};



exports.delete = async (event) => {
    try {
        const item_id = event.pathParameters.id;

        const client = await pool.connect();
        const result = await client.query('DELETE FROM Items WHERE item_id = $1 RETURNING *;', [item_id]);
        client.release();

        if (result.rows.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Item not found' })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows[0])
        };
    } catch (error) {
        // Handle errors
    }
};

