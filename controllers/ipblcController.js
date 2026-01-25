const cache = require('../config/node-cache') 
const invdb = require('../config/invdb') 
const createItem = require('../models/ipblcModel')

const searchItem = async(req,res)=>{
    const query = req.query.query
  
    const endpoint = query ? '/products/search' : '/products?limit=100' 
    const cacheKey = query || 'all_products'

    if(cache.has(cacheKey)){
        console.log("Mengambil data dari cache...") 
        return res.json(cache.get(cacheKey))
    }

    try{
        const response = await invdb.get(endpoint, {
            params: query ? { q: query } : {} 
        })
      
        const rawResults = response.data.products || [] 
        const itemResult = rawResults.map(createItem)

        console.log("Mengambil data dari API DummyJSON...")
        cache.set(cacheKey, itemResult)
        res.json(itemResult)
        
    }
    catch(error){
        console.error(error)
        res.status(500).json({ msg: "Public API error" })
    }
}

module.exports = { searchItem }