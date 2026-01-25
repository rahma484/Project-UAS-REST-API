const db = require('../config/db');

const getAllItems = async () => {
    const [rows] = await db.query("SELECT * FROM items");
    return rows;
}

const getItemByCode = async (code) => {
    const [row] = await db.query(
        "SELECT * FROM items WHERE item_code = ?", 
        [code]
    );
    return row[0];
}

const createItem = async (item) => {
    const { 
        item_code, name, category_id, brand, model, serial_number, 
        quantity, available, minimum_stock, unit, purchase_price, 
        current_value, location, supplier, purchase_date, warranty_until, 
        condition, description, image_url, created_by 
    } = item;

    const query = `
        INSERT INTO items (
            item_code, name, category_id, brand, model, serial_number, 
            quantity, available, minimum_stock, unit, purchase_price, 
            current_value, location, supplier, purchase_date, warranty_until, 
            \`condition\`, description, image_url, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
        item_code, name, category_id, brand, model, serial_number, 
        quantity || 0, available || 0, minimum_stock || 5, unit || 'pcs', 
        purchase_price, current_value, location, supplier, purchase_date, 
        warranty_until, condition || 'good', description, image_url, created_by
    ]);
    return result.insertId;
}

const updateItem = async (kode, data) => {
    const { name, category_id, quantity, brand, model, condition } = data;
    const query = `
        UPDATE items 
        SET name = ?, category_id = ?, quantity = ?, brand = ?, model = ?, \`condition\` = ?
        WHERE item_code = ?
    `;
    const [result] = await db.query(query, [
        name, category_id, quantity, brand, model, condition, kode
    ]);
    return result.affectedRows;
}

const deleteItem = async (kode) => {
    const [result] = await db.query(
        "DELETE FROM items WHERE item_code = ?", 
        [kode]
    );
    return result.affectedRows;
}

const searchItems = async (keyword) => {
    const [rows] = await db.query(
        "SELECT * FROM items WHERE name LIKE ? OR item_code LIKE ?",
        [`%${keyword}%`, `%${keyword}%`]
    );
    return rows;
}

const getLowStockItems = async (threshold = 5) => {
    const [rows] = await db.query(
        "SELECT * FROM items WHERE quantity <= ?",
        [threshold]
    );
    return rows;
}

const getItemsWithPagination = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
        "SELECT * FROM items ORDER BY id DESC LIMIT ? OFFSET ?",
        [parseInt(limit), offset]
    );
    const [countRow] = await db.query("SELECT COUNT(*) as total FROM items");
    const total = countRow[0].total;
    return {
        items: rows,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    };
}

const getAllCategories = async () => {
    const [rows] = await db.query("SELECT * FROM categories");
    return rows;
}

const createCategory = async (category) => {
    const { code, name, description, parent_id } = category;
    const query = "INSERT INTO categories (code, name, description, parent_id) VALUES (?, ?, ?, ?)";
    const [result] = await db.query(query, [code, name, description, parent_id]);
    return result.insertId;
}

module.exports = {
    getAllItems,
    getItemByCode,
    createItem,
    deleteItem,
    updateItem,
    searchItems,
    getLowStockItems,
    getItemsWithPagination,
    getAllCategories,
    createCategory
};