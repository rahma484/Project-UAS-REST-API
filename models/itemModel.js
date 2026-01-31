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
            available !== undefined ? available : (quantity || 0),
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
        const currentItem = await getItemByCode(kode);
        if (!currentItem) return 0;

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
            name || currentItem.name,
            category_id || currentItem.category_id,
            brand || currentItem.brand,
            model || currentItem.model,
            serial_number || currentItem.serial_number,
            quantity !== undefined ? quantity : currentItem.quantity,
            available !== undefined ? available : currentItem.available,
            minimum_stock !== undefined ? minimum_stock : currentItem.minimum_stock,
            unit || currentItem.unit,
            purchase_price || currentItem.purchase_price,
            current_value || currentItem.current_value,
            location || currentItem.location,
            supplier || currentItem.supplier,
            purchase_date || currentItem.purchase_date,
            warranty_until || currentItem.warranty_until,
            condition || currentItem.condition,
            description || currentItem.description,
            image_url || currentItem.image_url,
            kode
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

const getInventoryStats = async () => {
    const [rows] = await db.query(`
        SELECT 
            (SELECT COUNT(*) FROM items) as total_items,
            (SELECT SUM(available) FROM items) as total_stock,
            (SELECT COUNT(*) FROM items WHERE available <= minimum_stock) as low_stock_count,
            /* PERBAIKAN DI BAWAH INI: Ganti 'dipinjam' jadi 'borrowed' */
            (SELECT COUNT(*) FROM loans WHERE status = 'borrowed') as active_loans,
            /* Pastikan juga status kembali sesuai, misal 'returned' */
            (SELECT COUNT(*) FROM loans WHERE status = 'returned') as total_returned
    `);
    return rows[0];
};

const getItemsByCategory = async (categoryId) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM items WHERE category_id = ? ORDER BY Id DESC",
            [categoryId]
        );
        return rows;
    } catch (error) {
        throw new Error('Gagal mengambil items berdasarkan kategori: ' + error.message);
    }
};


module.exports = {
    getAllItems,
    getItemByCode,
    createItem,
    deleteItem,
    updateItem,
    searchItems,
    getItemsWithPagination,
    getAllCategories,
    getInventoryStats,
    getItemsByCategory
};