const userModel = require('../models/userModel')

const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.getAllUsers()
        res.json({
            success: true,
            count: users.length,
            data: users
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data user'
        })
    }
}

const getUserById = async (req, res) => {
    try {
        const { id } = req.params
        
        const user = await userModel.getUserById(id)
        
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
            message: 'Gagal mengambil data user'
        })
    }
}

module.exports = {getAllUsers, getUserById}