const pool = require('../utils/db');

exports.list = async (event) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM Categories;');
        client.release();

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows || [])
        };
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve categories' })
        };
    }
};


// fix below

exports.listByRestaurant = async (event) => {
    try {
        const  restaurant_id  = event.pathParameters.id;
        
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM Categories WHERE restaurant_id = $1;', [restaurant_id]);
        client.release();

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows || [])
        };
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to retrieve categories for the restaurant' })
        };
    }
};


exports.create = async (event) => {
    try {
        const data = JSON.parse(event.body);
        const { restaurant_id, name, display_category } = data;

        // Validate required fields
        if (!restaurant_id || !name) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Restaurant ID and name are required fields' })
            };
        }

        display = display_category == undefined ? true : display_category;

        const client = await pool.connect();
        const result = await client.query(`
            INSERT INTO Categories (restaurant_id, name, display_category)
            VALUES ($1, $2, $3)
            RETURNING *;
        `, [restaurant_id, name, display]);
        client.release();

        return {
            statusCode: 201,
            body: JSON.stringify(result.rows[0] || {}),
            headers: {
                'Content-Type': 'application/json',
            }
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
                body: JSON.stringify({ error: 'Failed to create category' })
            };
        }
    }
};



exports.update = async (event) => {
    const categoryId = event.pathParameters.id;
    const data = JSON.parse(event.body);
    const { name, display_category } = data;

    // Build the SET clause dynamically based on the provided fields
    const setClauses = [];
    const values = [];
    let index = 1;

    if (name !== undefined) {  // Check explicitly for undefined to allow falsy values like empty strings
        setClauses.push(`name = $${index}`);
        values.push(name);
        index++;
    }

    if (display_category !== undefined) {
        setClauses.push(`display_category = $${index}`);
        values.push(display_category);
        index++;
    }

    if (setClauses.length === 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'No fields provided for update' })
        };
    }

    const client = await pool.connect();

    try {
        const query = `
            UPDATE Categories
            SET ${setClauses.join(', ')}
            WHERE category_id = $${index}
            RETURNING *;
        `;
        values.push(categoryId);

        const result = await client.query(query, values);
        if (result.rows.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Category not found' })
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
            body: JSON.stringify({ error: 'Failed to update category' })
        };
    } finally {
        client.release();  // Ensure the client is released back to the pool
    }
};


exports.delete = async (event) => {
    try {
        const categoryId = event.pathParameters.id;

        const client = await pool.connect();
        const result = await client.query('DELETE FROM Categories WHERE category_id = $1;', [categoryId]);
        client.release();

        if (result.rows.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Category not found' })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows[0])
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
                body: JSON.stringify({ error: 'Failed to delete category' })
            };
        }
    }
};