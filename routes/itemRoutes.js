const express = require('express')
const router = express.Router()
const itemController = require('../controllers/itemController')
const { auth, adminOnly } = require('../middlewares/auth')

router.get('/', itemController.getAllItems)
router.get('/search', itemController.searchItems)
router.get('/category/:kategori', itemController.getItemsByCategory)
router.get('/:kode', itemController.getItemByCode)

router.post('/', auth, adminOnly, itemController.createItem)
router.put('/:kode', auth, adminOnly, itemController.updateItem)
router.delete('/:kode', auth, adminOnly, itemController.deleteItem)

module.exports = router