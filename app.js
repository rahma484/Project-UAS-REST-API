const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(require('./middlewares/logger'));

const poolPromise = require('./config/db');

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/returns', require('./routes/returnRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));

app.post('/api/generate-data', async (req, res) => {
    try {
        await poolPromise.query("SET FOREIGN_KEY_CHECKS = 0"); 
        await poolPromise.query("TRUNCATE TABLE items");      
        await poolPromise.query("SET FOREIGN_KEY_CHECKS = 1"); 
        const values = [];
        const brands = ['Asus', 'Logitech', 'HP', 'Samsung', 'Dell', 'Lenovo', 'Apple', 'Sony'];
        const types = ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Printer', 'Scanner', 'Tablet'];
        const locs = ['Gudang A', 'Gudang B', 'Ruang IT', 'Lab Utama'];

        for (let i = 1; i <= 100; i++) {
            const brand = brands[i % brands.length];
            const type = types[i % types.length];
            const qty = Math.floor(Math.random() * 50) + 10;
            const price = (Math.floor(Math.random() * 10) + 1) * 1000000;

            values.push([
                `BRG-${String(i).padStart(3, '0')}`,
                `${brand} ${type} Pro-X${i}`,
                brand,
                `Model-${i}Z`,
                `SN-${Math.random().toString(36).toUpperCase().substring(2, 10)}`,
                qty,
                qty,
                5,
                'Unit',
                price,
                price * 0.9,
                locs[i % locs.length],
                'PT. Supplier Maju Jaya',
                '2025-01-01',
                'good',
                `Aset operasional ${type}`,
                1,
                new Date(),
                `https://placehold.co/600x400?text=${brand}+${type}`,
                (i % 5) + 1
            ]);
        }

        const query = `
            INSERT INTO items 
            (item_code, name, brand, model, serial_number, quantity, available, minimum_stock, 
            unit, purchase_price, current_value, location, supplier, purchase_date, \`condition\`, 
            description, created_by, created_at, image_url, category_id) 
            VALUES ?
        `;

        await poolPromise.query(query, [values]);
        res.json({ success: true, message: "Tabel dibersihkan & 100 Data Baru Berhasil Dibuat! " });

    } catch (error) {
        console.error("Error Seeder:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.use(express.static(path.join(__dirname, 'frontend')));
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/', (req, res) => {
    res.json({ success: true, message: 'RA Inventory API ', author: 'RA' });
});

module.exports = app;
if (require.main === module) {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`Server Aktif di http://localhost:${PORT}`);
        console.log(`Seeder Ready di POST /api/generate-data`);
    });
}