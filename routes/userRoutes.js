const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { auth, adminOnly } = require('../middlewares/auth')

router.get('/', auth, adminOnly, userController.getAllUsers)
router.get('/:id', auth, adminOnly, userController.getUserById)
router.put('/role/:id', auth, adminOnly, userController.updateRole)

module.exports = router