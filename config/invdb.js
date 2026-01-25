require('dotenv').config()
const axios = require ('axios')

const invdb = axios.create({
    baseURL : 'https://dummyjson.com',
    headers :{
        Authorization : `Bearer ${process.env.INVENTARIS_API_KEY}`,
        Accept : 'application/json'
    }
})

module.exports = invdb