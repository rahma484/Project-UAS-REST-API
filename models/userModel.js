const db = require('../config/db')
const bcrypt = require('bcryptjs')

const getUserByEmail = async (email) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        )
        return rows[0] || null
    } catch (error) {
        throw new Error('Database error: ' + error.message)
    }
}

const getUserById = async (id) => {
    try {
        const [rows] = await db.query(
            "SELECT id, name, email, role, department, position, phone, status FROM users WHERE id = ?",
            [id]
        )
        return rows[0] || null
    } catch (error) {
        throw new Error('Database error: ' + error.message)
    }
}

const createUser = async (userData) => {
    try {
        const { name, email, password, department, position, phone, role, status } = userData;
       
        const [existing] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        )
        
        if (existing.length > 0) {
            throw new Error('Email sudah terdaftar')
        }
      
        const hashedPassword = await bcrypt.hash(password, 10)
        
        const query = `
            INSERT INTO users (name, email, password, department, position, phone, role, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.query(query, [
            name, 
            email, 
            hashedPassword, 
            department || null, 
            position || null, 
            phone || null, 
            role || 'staff', 
            status || 'active'
        ])
        
        return {
            id: result.insertId,
            name,
            email,
            role: role || 'staff'
        }
    } catch (error) {
        throw new Error('Gagal membuat user: ' + error.message)
    }
}

const getAllUsers = async () => {
    try {
        const [rows] = await db.query(
            "SELECT id, name, email, role, department, status FROM users ORDER BY id DESC"
        )
        return rows
    } catch (error) {
        throw new Error('Database error: ' + error.message)
    }
}

module.exports = {
    getUserByEmail,
    getUserById,
    createUser,
    getAllUsers
}