const db = require('../config/db');
const createReturn = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { loan_id, condition, note } = req.body;
        const [loans] = await connection.query(
            "SELECT item_id, quantity, status FROM loans WHERE Id = ?",
            [loan_id]
        );

        if (loans.length === 0) {
            throw new Error("ID Peminjaman tidak ditemukan di database!");
        }

        const loan = loans[0];
        if (loan.status === 'returned') {
            throw new Error("Barang ini sudah pernah dikembalikan!");
        }
        const returnQuery = `
            INSERT INTO returns (loan_id, return_date, \`condition\`, note)
            VALUES (?, NOW(), ?, ?)
        `;
        await connection.query(returnQuery, [
            loan_id,
            condition || 'good',
            note || 'Kembali via sistem'
        ]);
        await connection.query(
            "UPDATE loans SET status = 'returned' WHERE Id = ?",
            [loan_id]
        );

        const updateStockQuery = "UPDATE items SET available = available + ? WHERE Id = ?";
        await connection.query(updateStockQuery, [loan.quantity, loan.item_id]);
        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Barang kembali! Stok di database otomatis bertambah 😺✨",
            data: {
                loanId: loan_id,
                quantityReturned: loan.quantity,
                status: 'returned'
            }
        });

    } catch (error) {
        await connection.rollback();

        console.error("RETURN_ERROR:", error.message);

        res.status(400).json({
            success: false,
            message: error.message || "Gagal mencatat pengembalian"
        });
    } finally {
        connection.release();
    }
};
const getAllReturns = async (req, res) => {
    try {
        const query = `
            SELECT r.*, i.name as item_name, u.name as user_name 
            FROM returns r
            JOIN loans l ON r.loan_id = l.Id
            JOIN items i ON l.item_id = i.Id
            JOIN users u ON l.user_id = u.id
            ORDER BY r.return_date DESC
        `;
        const [rows] = await db.query(query);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createReturn, getAllReturns }; 