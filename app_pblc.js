const express = require('express')
const cors = require('cors')
const publicRoute = require('./routes/publicRoutes')
const app = express()
require('dotenv').config()

app.use(cors())
app.use(express.json())

app.use('/api/public', publicRoute)

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}/api/public/search`)
})
