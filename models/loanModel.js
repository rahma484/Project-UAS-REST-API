const db = require('../config/db');

const loanModel = {
    // Fungsi untuk membuat data peminjaman baru
    create: async (loanData) => {
        const { item_id, user_id, quantity, return_date, purpose } = loanData;
        const query = `
            INSERT INTO loans (item_id, user_id, quantity, loan_date, return_date, status, purpose) 
            VALUES (?, ?, ?, NOW(), ?, 'borrowed', ?)
        `;
        const [result] = await db.query(query, [item_id, user_id, quantity, return_date, purpose]);
        return result.insertId;
    },

    // Fungsi untuk melihat semua riwayat pinjam (buat pamer ke dosen)
    getAll: async () => {
        const query = `
            SELECT loans.*, items.name as item_name, users.name as user_name 
            FROM loans 
            JOIN items ON loans.item_id = items.id 
            JOIN users ON loans.user_id = users.id
            ORDER BY loans.loan_date DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    // Fungsi untuk mencari data pinjam berdasarkan ID (penting buat fitur Return)
    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM loans WHERE id = ?', [id]);
        return rows[0];
    }
};

module.exports = loanModel;