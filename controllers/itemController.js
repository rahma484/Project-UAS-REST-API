const itemModel = require('../models/itemModel')

const getAllItems = async (req, res) => {
    try {
        const items = await itemModel.getAllItems()
        res.json({
            success: true,
            count: items.length,
            data: items
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data items: ' + error.message
        })
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
        const { 
            item_code, name, category_id, brand, model, serial_number, 
            quantity, available, minimum_stock, unit, purchase_price, 
            current_value, location, supplier, purchase_date, 
            warranty_until, condition, description 
        } = req.body

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
        const { name, category_id, quantity, condition } = req.body
        
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

module.exports = { 
    getAllItems, 
    getItemByCode, 
    createItem, 
    updateItem, 
    deleteItem, 
    searchItems, 
    getItemsByCategory 
}