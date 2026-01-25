const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const logger = require('./middlewares/logger') 

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use(logger) 

const authRoutes = require('./routes/authRoutes')
const itemRoutes = require('./routes/itemRoutes')
const userRoutes = require('./routes/userRoutes')
const returnRoutes = require('./routes/returnRoutes')
const publicRoutes = require('./routes/publicRoutes')

app.use('/api/auth', authRoutes)
app.use('/api/items', itemRoutes)
app.use('/api/users', userRoutes)
app.use('/api/returns', returnRoutes)
app.use('/api/public', publicRoutes)

const itemModel = require('./models/itemModel')
const { auth, adminOnly } = require('./middlewares/auth')

app.get('/api/categories', auth, async (req, res) => {
    try {
        const categories = await itemModel.getAllCategories()
        res.json({ success: true, data: categories })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

app.post('/api/categories', auth, adminOnly, async (req, res) => {
    try {
        const categoryId = await itemModel.createCategory(req.body)
        res.status(201).json({ 
            success: true, 
            message: 'Kategori berhasil dibuat', 
            id: categoryId 
        })
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
})

app.get('/', (req, res) => {
    res.json({ 
        message: 'API Sistem Inventaris Berjalan!',
        status: 'Ready for Deployment',
        modules: ['Auth', 'Items', 'Users', 'Returns', 'Public API', 'Categories'],
        total_endpoints: '22 Endpoint Aktif' 
    })
})
const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log('==============================================')
    console.log(`server running on: http://localhost:${PORT}`)
    console.log(`Total Endpoints Terdaftar: 22`)
    console.log('==============================================')
})