const itemModel = require('../models/itemModel')

const getAllItems = async (req, res) => {
    try {
        const { page, limit } = req.query;
        if (page && limit) {
            const result = await itemModel.getItemsWithPagination(parseInt(page), parseInt(limit));
            return res.json({
                success: true,
                data: result
            });
        } else {
            const items = await itemModel.getAllItems();
            return res.json({
                success: true,
                count: items.length,
                data: items
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data items: ' + error.message
        });
    }
}

const getItemByCode = async (req, res) => {
    try {
        const { kode } = req.params
        if (!kode) {
            return res.status(400).json({
                success: false,
                message: 'Kode item harus diisi'
            })
        }
        const item = await itemModel.getItemByCode(kode)
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item tidak ditemukan'
            })
        }
        res.json({ success: true, data: item })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil data item' })
    }
}

const createItem = async (req, res) => {
    try {
        const { item_code, name } = req.body

        if (!item_code || !name) {
            return res.status(400).json({
                success: false,
                message: 'item_code dan name harus diisi'
            })
        }

        const newItemId = await itemModel.createItem({
            ...req.body,
            created_by: req.user.id 
        })

        res.status(201).json({
            success: true,
            message: 'Item berhasil ditambahkan',
            id: newItemId
        })
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
}

const updateItem = async (req, res) => {
    try {
        const { kode } = req.params
        if (!kode) {
            return res.status(400).json({ success: false, message: 'Kode item harus diisi' })
        }

        const oldData = await itemModel.getItemByCode(kode);
        if (!oldData) {
            return res.status(404).json({ success: false, message: 'Item tidak ditemukan' });
        }
        
        const newQty = req.body.quantity !== "" && req.body.quantity !== undefined ? parseInt(req.body.quantity) : oldData.quantity;
        
        const newAvailable = req.body.available !== "" && req.body.available !== undefined ? parseInt(req.body.available) : newQty;

        const mergedData = {
            name: req.body.name || oldData.name,
            category_id: req.body.category_id || oldData.category_id,
            brand: req.body.brand || oldData.brand,
            model: req.body.model || oldData.model,
            serial_number: req.body.serial_number || oldData.serial_number,
            quantity: req.body.quantity !== undefined ? req.body.quantity : oldData.quantity,
            available: req.body.available !== undefined ? req.body.available : oldData.available,
            minimum_stock: req.body.minimum_stock !== undefined ? req.body.minimum_stock : oldData.minimum_stock,
            unit: req.body.unit || oldData.unit,
            purchase_price: req.body.purchase_price || oldData.purchase_price,
            current_value: req.body.current_value || oldData.current_value,
            location: req.body.location || oldData.location,
            supplier: req.body.supplier || oldData.supplier,
            purchase_date: req.body.purchase_date || oldData.purchase_date,
            warranty_until: req.body.warranty_until || oldData.warranty_until,
            condition: req.body.condition || oldData.condition,
            description: req.body.description || oldData.description,
            image_url: req.body.image_url || oldData.image_url
        };

        const affectedRows = await itemModel.updateItem(kode, mergedData)
        
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Gagal memperbarui: Item tidak ditemukan' })
        }
        
        res.json({ success: true, message: 'Item berhasil diperbarui' })
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
}

const deleteItem = async (req, res) => {
    try {
        const { kode } = req.params
        if (!kode) {
            return res.status(400).json({ success: false, message: 'Kode item harus diisi' })
        }
        const affectedRows = await itemModel.deleteItem(kode)
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Item tidak ditemukan' })
        }
        res.json({ success: true, message: 'Item berhasil dihapus' })
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
}

const searchItems = async (req, res) => {
    try {
        const { q } = req.query
        if (!q) {
            return res.status(400).json({ success: false, message: 'Query pencarian harus diisi' })
        }
        const items = await itemModel.searchItems(q)
        res.json({ success: true, count: items.length, data: items })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mencari items' })
    }
}

const getItemsByCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const items = await itemModel.getItemsByCategory(id);
        res.json({ success: true, count: items.length, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil items' });
    }
};

const getInventoryStats = async (req, res) => {
    try {
        const stats = await itemModel.getInventoryStats(); 
        res.json({
            success: true,
            data: stats 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const categories = await itemModel.getAllCategories();
        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { 
    getAllItems, 
    getItemByCode, 
    createItem, 
    updateItem, 
    deleteItem, 
    searchItems, 
    getItemsByCategory,
    getInventoryStats,
    getAllCategories
}