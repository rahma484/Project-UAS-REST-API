const db = require('../config/db')

const addReturn = async (data) => {
  const { loan_id, return_date, condition, note } = data

  const query = `
    INSERT INTO returns (loan_id, return_date, \`condition\`, note)
    VALUES (?, ?, ?, ?)
  `

  const [result] = await db.query(query, [
    loan_id,
    return_date,
    condition,
    note
  ])

  return result.affectedRows
}

module.exports = { addReturn }