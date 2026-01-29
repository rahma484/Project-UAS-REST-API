const db = require('../config/db');

const getAllItems = async () => {
    try {
        const [rows] = await db.query("SELECT * FROM items ORDER BY Id DESC");
        return rows;
    } catch (error) {
        throw new Error('Gagal mengambil data items: ' + error.message);
    }
}

const getItemByCode = async (code) => {
    try {
        const [row] = await db.query(
            "SELECT * FROM items WHERE item_code = ?", 
            [code]
        );
        return row[0];
    } catch (error) {
        throw new Error('Gagal mengambil item: ' + error.message);
    }
}

const createItem = async (item) => {
    try {
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
                \`condition\`, description, image_url, created_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const [result] = await db.query(query, [
            item_code, 
            name, 
            category_id || null, 
            brand || null, 
            model || null, 
            serial_number || null, 
            quantity || 0, 
            available || 0, 
            minimum_stock || 0, 
            unit || 'pcs', 
            purchase_price || 0, 
            current_value || 0, 
            location || 'Gudang', 
            supplier || null, 
            purchase_date || null, 
            warranty_until || null, 
            condition || 'good', 
            description || null, 
            image_url || null, 
            created_by
        ]);
        return result.insertId;
    } catch (error) {
        throw new Error('Gagal membuat item: ' + error.message);
    }
}

const updateItem = async (kode, data) => {
    try {
        const { 
            name, category_id, brand, model, serial_number,
            quantity, available, minimum_stock, unit, purchase_price,
            current_value, location, supplier, purchase_date, warranty_until,
            condition, description, image_url
        } = data;
        
        const query = `
            UPDATE items 
            SET name = ?, category_id = ?, brand = ?, model = ?, serial_number = ?,
                quantity = ?, available = ?, minimum_stock = ?, unit = ?, 
                purchase_price = ?, current_value = ?, location = ?, supplier = ?, 
                purchase_date = ?, warranty_until = ?, \`condition\` = ?, 
                description = ?, image_url = ?, updated_at = NOW()
            WHERE item_code = ?
        `;
                
        const [result] = await db.query(query, [
            name, category_id, brand, model, serial_number,
            quantity, available, minimum_stock, unit, purchase_price,
            current_value, location, supplier, purchase_date, warranty_until,
            condition, description, image_url, kode
        ]);
        return result.affectedRows;
    } catch (error) {
        throw new Error('Gagal mengupdate item: ' + error.message);
    }
}

const deleteItem = async (kode) => {
    try {
        const [result] = await db.query(
            "DELETE FROM items WHERE item_code = ?", 
            [kode]
        );
        return result.affectedRows;
    } catch (error) {
        throw new Error('Gagal menghapus item: ' + error.message);
    }
}

const searchItems = async (keyword) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM items WHERE name LIKE ? OR item_code LIKE ? OR brand LIKE ? OR model LIKE ?",
            [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
        );
        return rows;
    } catch (error) {
        throw new Error('Gagal mencari items: ' + error.message);
    }
}

const getItemsWithPagination = async (page = 1, limit = 10) => {
    try {
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        // Perhatikan 'Id' (I besar) sesuai XAMPP kamu
        const [rows] = await db.query(
            "SELECT * FROM items ORDER BY Id DESC LIMIT ? OFFSET ?",
            [parseInt(limit), offset]
        );
        
        const [[countRow]] = await db.query("SELECT COUNT(*) as total FROM items");
        const total = countRow.total;
        
        return {
            items: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        throw new Error('Gagal mengambil items dengan pagination: ' + error.message);
    }
}

const getAllCategories = async () => {
    try {
        const [rows] = await db.query("SELECT * FROM categories ORDER BY name ASC");
        return rows;
    } catch (error) {
        throw new Error('Gagal mengambil kategori: ' + error.message);
    }
}

// Menghitung statistik untuk Dashboard
const getInventoryStats = async () => {
    try {
        const [rows] = await db.query(`
            SELECT 
                COUNT(*) as total_items,
                SUM(quantity) as total_stock,
                SUM(CASE WHEN available < minimum_stock THEN 1 ELSE 0 END) as low_stock_count
            FROM items
        `);
        return rows[0];
    } catch (error) {
        throw new Error('Gagal mengambil statistik: ' + error.message);
    }
};

// Fungsi getAllCategories sudah ada di file kamu sebelumnya

module.exports = {
    getAllItems,
    getItemByCode,
    createItem,
    deleteItem,
    updateItem,
    searchItems,
    getItemsWithPagination,
    getAllCategories,
    getInventoryStats
};