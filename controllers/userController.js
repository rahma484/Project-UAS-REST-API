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

const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({ success: false, message: 'Role harus ditentukan' });
        }

        const affectedRows = await userModel.updateUserRole(id, role);
        
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        res.json({ success: true, message: `Role user berhasil diubah menjadi ${role}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await userModel.deleteUser(id);
        if (affectedRows === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        res.json({ success: true, message: 'User berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {getAllUsers, getUserById, updateRole, deleteUser}