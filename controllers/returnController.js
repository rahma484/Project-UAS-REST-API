const returnModel = require('../models/returnModel')
const db = require('../config/db')

const createReturn = async (req, res) => {
  try {
    const result = await returnModel.addReturn(req.body)

    if (result === 1) {
      await db.query(
        "UPDATE loans SET status = 'returned' WHERE id = ?",
        [req.body.loan_id]
      )

      res.status(201).json({ msg: "Return berhasil dicatat" })
    }
  } catch (error) {
    res.status(500).json({ msg: "Gagal mencatat return" })
  }
}

module.exports = { createReturn }