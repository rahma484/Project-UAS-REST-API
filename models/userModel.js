const db = require('../config/db');
// bcryptjs tidak lagi digunakan untuk hashing, tetapi tetap di-require agar tidak error jika ada dependensi lain
const bcrypt = require('bcryptjs');

/**
 * Model untuk mengelola data pengguna (users).
 * Menggunakan gaya Object Style untuk kerapihan kode.
 */
const userModel = {
    
    // 1. Mencari user berdasarkan Email (Penting untuk proses LOGIN)
    getUserByEmail: async (email) => {
        try {
            // Mengambil semua kolom termasuk password untuk diverifikasi saat login
            const [rows] = await db.query(
                "SELECT * FROM users WHERE email = ?",
                [email]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error('Gagal mencari email: ' + error.message);
        }
    },

    // 2. Mencari user berdasarkan ID (Penting untuk PROFIL & VALIDASI TOKEN)
    getUserById: async (id) => {
        try {
            // Kolom password TIDAK ditarik demi keamanan saat penampilan profil
            const [rows] = await db.query(
                "SELECT id, name, email, role, department, position, phone, status FROM users WHERE id = ?",
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error('Gagal mengambil detail user: ' + error.message);
        }
    },

    // 3. Membuat User Baru (Penting untuk REGISTRASI)
    createUser: async (userData) => {
        try {
            const { name, email, password, department, position, phone, role, status } = userData;
            
            // CEK REDUNDANSI: Pastikan email belum dipakai orang lain
            const [existing] = await db.query(
                "SELECT id FROM users WHERE email = ?",
                [email]
            );
            
            if (existing.length > 0) {
                throw new Error('Email sudah terdaftar di sistem meow! 🐾');
            }
          
            // PERBAIKAN: Hashing password dihapus agar password disimpan sebagai Plain Text
            // Langsung menggunakan variabel 'password' dari req.body
            
            const query = `
                INSERT INTO users (
                    name, 
                    email, 
                    password, 
                    department, 
                    position, 
                    phone, 
                    role, 
                    status,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            
            const [result] = await db.query(query, [
                name, 
                email, 
                password, // Menggunakan password asli (Plain Text)
                department || null, 
                position || null, 
                phone || null, 
                role || 'staff', 
                status || 'active'
            ]);
            
            return {
                id: result.insertId,
                name,
                email,
                role: role || 'staff'
            };
        } catch (error) {
            throw new Error('Gagal registrasi user: ' + error.message);
        }
    },

    // 4. Mengambil SEMUA User (Penting untuk DASHBOARD ADMIN)
    getAllUsers: async () => {
        try {
            // Menampilkan daftar user urut dari yang terbaru bergabung
            const [rows] = await db.query(
                "SELECT id, name, email, role, department, status, created_at FROM users ORDER BY id DESC"
            );
            return rows;
        } catch (error) {
            throw new Error('Gagal menarik daftar user: ' + error.message);
        }
    },
    
    updateUserRole: async (id, role) => {
        try {
            const [result] = await db.query(
                "UPDATE users SET role = ? WHERE id = ?",
                [role, id]
            );
            return result.affectedRows;
        } catch (error) {
            throw new Error('Gagal update role: ' + error.message);
        }
    }
};

module.exports = userModel;