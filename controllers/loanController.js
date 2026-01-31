const db = require('../config/db');

const getAllLoans = async (req, res) => {
    try {
        const query = `
            SELECT 
                l.Id, l.quantity, l.loan_date, l.due_date, l.status, l.purpose,
                i.name as item_name,
                u.name as user_name 
            FROM loans l
            JOIN items i ON l.item_id = i.Id
            JOIN users u ON l.user_id = u.id
            ORDER BY l.loan_date DESC
        `;

        const [rows] = await db.query(query);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal mengambil data: " + error.message });
    }
};

const createLoan = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { item_id, quantity, return_date, purpose } = req.body;
        const user_id = req.user.id;

        const [items] = await connection.query('SELECT name, available FROM items WHERE Id = ? FOR UPDATE', [item_id]);
        if (items.length === 0) throw new Error('Barang tidak ditemukan!');
        if (items[0].available < quantity) throw new Error('Stok tidak cukup!');

        const loanQuery = `INSERT INTO loans (item_id, user_id, quantity, loan_date, due_date, status, purpose) VALUES (?, ?, ?, NOW(), ?, 'borrowed', ?)`;
        await connection.query(loanQuery, [item_id, user_id, quantity, return_date, purpose]);

        await connection.query('UPDATE items SET available = available - ? WHERE Id = ?', [quantity, item_id]);
        
        await connection.commit();
        res.status(201).json({ success: true, message: 'Berhasil meminjam barang! 🐾' });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

module.exports = { createLoan, getAllLoans };