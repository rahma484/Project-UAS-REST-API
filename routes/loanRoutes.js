const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { auth } = require('../middlewares/auth');

router.get('/', auth, loanController.getAllLoans);
router.post('/', auth, loanController.createLoan);

module.exports = router;