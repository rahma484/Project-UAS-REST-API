const express = require('express')
const { createReturn } = require('../controllers/returnController')
const {auth} = require('../middlewares/auth')

const router = express.Router()

router.post('/', auth, createReturn)

module.exports = router