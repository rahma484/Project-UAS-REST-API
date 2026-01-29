const jwt = require('jsonwebtoken')
// bcrypt tidak lagi digunakan untuk login, tapi tetap di-require agar tidak error di bagian lain jika ada
const bcrypt = require('bcryptjs') 
const userModel = require('../models/userModel')

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body
        
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nama, email, dan password harus diisi'
            })
        }
     
        const userRole = role || 'staff'
        
        // Pastikan di userModel.js, fungsi createUser juga sudah tidak memakai bcrypt.hash
        const user = await userModel.createUser({
            name,
            email,
            password,
            role: userRole
        })
    
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )
        
        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email dan password harus diisi'
            })
        }
        
        const user = await userModel.getUserByEmail(email)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah'
            })
        }
       
        // PERBAIKAN: Menggunakan perbandingan string langsung (Plain Text)
        // Tanpa await bcrypt.compare
        const isValidPassword = (password === user.password)
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah'
            })
        }
       
        const token = jwt.sign(
            { 
                id: user.id, 
                name: user.name,
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )
        
        res.json({
            success: true,
            message: 'Login berhasil',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        })
    }
}

const getProfile = async (req, res) => {
    try {
        const user = await userModel.getUserById(req.user.id)
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            })
        }
        
        res.json({
            success: true,
            data: user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        })
    }
}

module.exports = { register, login, getProfile }