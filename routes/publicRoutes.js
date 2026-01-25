const express = require('express')
const { searchItem } = require('../controllers/ipblcController')
const router = express.Router()

router.get('/search', searchItem)

module.exports = router