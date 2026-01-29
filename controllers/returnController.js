const db = require('../config/db');

/**
 * Controller untuk menangani pengembalian barang.
 * Alur: Cek Data Pinjam -> Catat Return -> Update Status Loans -> Tambah Stok Items (Atomic)
 */
const createReturn = async (req, res) => {
    // Menggunakan getConnection agar transaksi berjalan di satu koneksi yang sama
    const connection = await db.getConnection();

    try {
        // Memulai transaksi database
        await connection.beginTransaction();

        const { loan_id, condition, note } = req.body;

        // 1. CEK DATA PEMINJAMAN
        // DISESUAIKAN: Menggunakan 'Id' (I besar) sesuai struktur tabel loans di XAMPP
        const [loans] = await connection.query(
            "SELECT item_id, quantity, status FROM loans WHERE Id = ?",
            [loan_id]
        );

        if (loans.length === 0) {
            throw new Error("ID Peminjaman tidak ditemukan di database! 😿");
        }

        const loan = loans[0];

        // Validasi: Jangan sampai barang yang sudah kembali, dikembalikan lagi
        if (loan.status === 'returned') {
            throw new Error("Barang ini sudah pernah dikembalikan meow! 🐾");
        }

        // 2. CATAT KE TABEL RETURNS
        // DISESUAIKAN: Kolom 'Id' pada tabel returns otomatis (Auto Increment)
        const returnQuery = `
            INSERT INTO returns (loan_id, return_date, \`condition\`, note)
            VALUES (?, NOW(), ?, ?)
        `;
        await connection.query(returnQuery, [
            loan_id,
            condition || 'good',
            note || 'Kembali via sistem'
        ]);

        // 3. UPDATE STATUS DI TABEL LOANS
        // DISESUAIKAN: Menggunakan 'Id' (I besar) agar cocok dengan primary key loans
        await connection.query(
            "UPDATE loans SET status = 'returned' WHERE Id = ?",
            [loan_id]
        );

        // 4. TAMBAH STOK KEMBALI DI TABEL ITEMS
        // DISESUAIKAN: Menggunakan 'Id' (I besar) sesuai primary key items
        const updateStockQuery = "UPDATE items SET available = available + ? WHERE Id = ?";
        await connection.query(updateStockQuery, [loan.quantity, loan.item_id]);

        // Jika semua langkah di atas berhasil, simpan permanen ke database
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
        // Rollback jika ada error untuk menjaga integritas data
        await connection.rollback();

        console.error("RETURN_ERROR:", error.message);

        res.status(400).json({
            success: false,
            message: error.message || "Gagal mencatat pengembalian"
        });
    } finally {
        // Selalu kembalikan koneksi ke pool
        connection.release();
    }
};

module.exports = { createReturn };