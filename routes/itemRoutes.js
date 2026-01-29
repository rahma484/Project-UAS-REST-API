const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { auth, adminOnly } = require('../middlewares/auth');

// --- RUTE STATIS (TARUH DI ATAS) ---
router.get('/search', itemController.searchItems);
router.get('/categories/all', itemController.getAllCategories); // Sekarang ini akan jalan
router.get('/stats/summary', auth, itemController.getInventoryStats);

// --- RUTE DASAR ---
router.get('/', itemController.getAllItems);

// --- RUTE PARAMETER (TARUH DI BAWAH) ---
router.get('/:kode', itemController.getItemByCode); // Biar tidak bentrok dengan rute di atas

router.post('/', auth, adminOnly, itemController.createItem);
router.put('/:kode', auth, adminOnly, itemController.updateItem);
router.delete('/:kode', auth, adminOnly, itemController.deleteItem);

module.exports = router;