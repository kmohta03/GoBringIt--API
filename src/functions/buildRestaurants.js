const pool = require('../utils/db');

// for admin dash
exports.buildMenus = async () => {
    try {
        const client = await pool.connect();

        const query = `
        SELECT json_agg(
            json_build_object(
                'id', r.restaurant_id,
                'name', r.name,
                'image', r.image,
                'cuisine', r.cuisine,
                'description', r.description,
                'indefinitelyClosed', r.indefinitelyClosed,
                'email', r.email,
                'phone', r.phone,
                'icon', r.icon,
                'minimumOrderAmount', r.minimumOrderAmount,
                'deliveryFee', r.deliveryFee,
                'hours', json_build_object(
                    'mondayOpen', r.mondayOpen,
                    'mondayClose', r.mondayClose,
                    'tuesdayOpen', r.tuesdayOpen,
                    'tuesdayClose', r.tuesdayClose,
                    'wednesdayOpen', r.wednesdayOpen,
                    'wednesdayClose', r.wednesdayClose,
                    'thursdayOpen', r.thursdayOpen,
                    'thursdayClose', r.thursdayClose,
                    'fridayOpen', r.fridayOpen,
                    'fridayClose', r.fridayClose,
                    'saturdayOpen', r.saturdayOpen,
                    'saturdayClose', r.saturdayClose,
                    'sundayOpen', r.sundayOpen,
                    'sundayClose', r.sundayClose
                )
                'categories', (
                    SELECT json_agg(
                        json_build_object(
                            'id', c.category_id,
                            'name', c.name,
                            'display_category', c.display_category,
                            'items', (
                                SELECT json_agg(
                                    json_build_object(
                                        'id', i.item_id,
                                        'name', i.name,
                                        'description', i.description,
                                        'price', i.price,
                                        'is_featured', i.is_featured,
                                        'image', i.image
                                        // TODO: Add modifier groups
                                    )
                                )
                                FROM Items i
                                WHERE i.category_id = c.category_id
                            )
                        )
                    )
                    FROM Categories c
                    WHERE c.restaurant_id = r.restaurant_id
                )
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