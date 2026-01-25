const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { auth } = require('../middlewares/auth')

router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Auth API Endpoints',
        endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            profile: 'GET /api/auth/profile (protected)'
        }
    })
})

router.post('/register', authController.register)
router.post('/login', authController.login)

router.get('/profile', auth, authController.getProfile)

module.exports = router