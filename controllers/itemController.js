const itemModel = require('../models/itemModel')

const getAllItems = async (req, res) => {
    try {
        // Ambil parameter page dan limit dari URL (jika ada)
        const { page, limit } = req.query;

        // LOGIKA CERDAS: 
        // Jika ada parameter page/limit, gunakan pagination (untuk Dashboard)
        // Jika TIDAK ADA, ambil semua data (untuk Lihat Semua Aset)
        if (page && limit) {
            const result = await itemModel.getItemsWithPagination(parseInt(page), parseInt(limit));
            return res.json({
                success: true,
                data: result // result biasanya berisi { items, pagination }
            });
        } else {
            // Mengambil semua data tanpa batas (untuk fitur Lihat Semua)
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

        // Pastikan created_by diambil dari token user yang login
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

        const affectedRows = await itemModel.updateItem(kode, req.body)
        
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Item tidak ditemukan' })
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
        // Mencari ke database (biasanya mengambil semua yang cocok tanpa limit paging)
        const items = await itemModel.searchItems(q)
        res.json({ success: true, count: items.length, data: items })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mencari items' })
    }
}

const getItemsByCategory = async (req, res) => {
    try {
        const { kategori_id } = req.params
        const items = await itemModel.getItemsByCategory(kategori_id)
        res.json({ success: true, count: items.length, data: items })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil items' })
    }
}

const getInventoryStats = async (req, res) => {
    try {
        const stats = await itemModel.getInventoryStats(); // Kita buat fungsinya di model nanti
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