const cache = require('../config/node-cache');
const invdb = require('../config/invdb');
const createItem = require('../models/ipblcModel');

const searchItem = async (req, res) => {
    const q = req.query.q;

    const endpoint = q ? '/products/search' : '/products?limit=100';

    const cacheKey = q || 'all_products';

    if (cache.has(cacheKey)) {
        console.log('Mengambil data dari cache...');
        return res.json(cache.get(cacheKey));
    }

    try {
        const response = await invdb.get(endpoint, {
            params: q ? { q } : {}
        });
        const rawResults = response.data.products || [];

        const itemResult = rawResults.map(createItem);

        console.log('🌐 Mengambil data dari API DummyJSON...');

        cache.set(cacheKey, itemResult);

        res.json({
            success: true,
            keyword: q || null,
            count: itemResult.length,
            data: itemResult
        });

    } catch (error) {
        console.error('❌ Public API Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Public API error'
        });
    }
};

module.exports = { searchItem };
