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
                ),
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
                                        'image', i.image,
                                        'modifierGroups', (
                                            SELECT json_agg(
                                                json_build_object(
                                                    'id', mg.modifier_group_id,
                                                    'name', mg.name,
                                                    'minNeeded', mg.min_needed,
                                                    'maxNeeded', mg.max_needed,
                                                    'modifiers', (
                                                        SELECT json_agg(
                                                            json_build_object(
                                                                'id', mgi.item_id,
                                                                'name', mi.name,
                                                                'price', mgi.new_price
                                                            )
                                                        )
                                                        FROM ModifierGroupItems mgi
                                                        JOIN Items mi ON mgi.item_id = mi.item_id
                                                        WHERE mgi.modifier_group_id = mg.modifier_group_id
                                                    )
                                                )
                                            )
                                            FROM ModifierGroups mg
                                            JOIN ItemModifierGroups img ON mg.modifier_group_id = img.modifier_group_id
                                            WHERE img.item_id = i.item_id
                                        )
                                    )
                                )
                                FROM Items i
                                WHERE i.category_id = c.category_id
                            )
                        )
                    )
                    FROM Categories c
                    WHERE c.restaurant_id = r.restaurant_id
                ),
                'modifierGroups', (
                    SELECT json_agg(
                        json_build_object(
                            'id', mg.modifier_group_id,
                            'name', mg.name,
                            'minNeeded', mg.min_needed,
                            'maxNeeded', mg.max_needed,
                            'modifiers', (
                                SELECT json_agg(
                                    json_build_object(
                                        'id', mgi.item_id,
                                        'name', mi.name,
                                        'price', mgi.new_price
                                    )
                                )
                                FROM ModifierGroupItems mgi
                                JOIN Items mi ON mgi.item_id = mi.item_id
                                WHERE mgi.modifier_group_id = mg.modifier_group_id
                            )
                        )
                    )
                    FROM ModifierGroups mg
                    WHERE mg.restaurant_id = r.restaurant_id
                )
            )
        )
        FROM Restaurants r;
        `;

        const result = await client.query(query);
        client.release();

        return result.rows[0].json_agg.map(restaurant => {
            restaurant.categories = restaurant.categories || [];
            restaurant.modifierGroups = restaurant.modifierGroups || [];
            restaurant.categories.forEach(category => {
                category.items = category.items || [];
                category.items.forEach(item => {
                    item.modifierGroups = item.modifierGroups || [];
                    item.modifierGroups.forEach(modGroup => {
                        modGroup.modifiers = modGroup.modifiers || [];
                    });
                });
            });
            return restaurant;
        });

    } catch (error) {
        console.error('Error executing query:', error);
        throw new Error('Failed to retrieve menu items');
    }
};

//menus for client side app

exports.buildClientMenus = async () => {
    try {
        const client = await pool.connect();
        // TODO: Implement query
        client.release();
    } catch (error) {
        console.error('Error executing query:', error);
        throw new Error('Failed to retrieve menu items for client');
    }
};