const db = require('../config/db');
const bcrypt = require('bcryptjs');
const userModel = {
    
    getUserByEmail: async (email) => {
        try {
            const [rows] = await db.query(
                "SELECT * FROM users WHERE email = ?",
                [email]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error('Gagal mencari email: ' + error.message);
        }
    },
    getUserById: async (id) => {
        try {
            const [rows] = await db.query(
                "SELECT id, name, email, role, department, position, phone, status FROM users WHERE id = ?",
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error('Gagal mengambil detail user: ' + error.message);
        }
    },
    createUser: async (userData) => {
        try {
            const { name, email, password, department, position, phone, role, status } = userData;
            
            const [existing] = await db.query(
                "SELECT id FROM users WHERE email = ?",
                [email]
            );
            
            if (existing.length > 0) {
                throw new Error('Email sudah terdaftar di sistem !');
            }
            
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
                password, 
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

    getAllUsers: async () => {
        try {
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
    },
    deleteUser: async (id) => {
        try {
            const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
            return result.affectedRows;
        } catch (error) {
            throw new Error('Gagal menghapus user: ' + error.message);
        }
    }
};

module.exports = userModel;