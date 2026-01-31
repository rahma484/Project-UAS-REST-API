const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { auth, adminOnly } = require('../middlewares/auth');

router.get('/search', itemController.searchItems);
router.get('/categories/all', itemController.getAllCategories); 
router.get('/stats/summary', auth, itemController.getInventoryStats);

router.get('/categories/:id', itemController.getItemsByCategory);
router.get('/', itemController.getAllItems);

router.get('/:kode', itemController.getItemByCode); 

router.post('/', auth, adminOnly, itemController.createItem);
router.put('/:kode', auth, adminOnly, itemController.updateItem);
router.delete('/:kode', auth, adminOnly, itemController.deleteItem);

module.exports = router;