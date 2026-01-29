const mysql = require('mysql2')
const dotenv = require('dotenv')
dotenv.config()

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'inventaris_db',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
})

pool.on('connection', (connection) => {
    console.log('Database connected, threadId:', connection.threadId)
})

pool.on('acquire', (connection) => {
    console.log('Connection acquired, threadId:', connection.threadId)
})

pool.on('release', (connection) => {
    console.log('Connection released, threadId:', connection.threadId)
})

pool.on('error', (error) => {
    console.error('Database pool error:', error.message)
    console.error('Error code:', error.code)
    console.error('Error stack:', error.stack)
})

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to database:', err.message)
        return
    }
    console.log('Database connection successful!')
    connection.release()
})

const poolPromise = pool.promise()

module.exports = poolPromise