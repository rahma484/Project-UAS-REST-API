const express = require('express')
const { createReturn, getAllReturns } = require('../controllers/returnController')
const { auth } = require('../middlewares/auth')

const router = express.Router()

router.post('/', auth, createReturn)
router.get('/', auth, getAllReturns);

module.exports = router