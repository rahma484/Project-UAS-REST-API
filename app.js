const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(require('./middlewares/logger'));

// Import database pool
const poolPromise = require('./config/db');

// --- Registrasi Rute API ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/returns', require('./routes/returnRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// --- Endpoint Seeder: Generate 100 Data Full (No Null) ---
app.post('/api/generate-data', async (req, res) => {
    try {
        // 1. Cek apakah tabel sudah ada isinya agar tidak duplikat
        const [rows] = await poolPromise.query("SELECT COUNT(*) as total FROM items");
        if (rows[0].total > 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Tabel sudah terisi! 🐾 Kosongkan tabel dulu di phpMyAdmin." 
            });
        }

        // 2. Siapkan Data Dummy (Variabel didefinisikan di dalam rute agar tidak ReferenceError)
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
                `BRG-${String(i).padStart(3, '0')}`,             // item_code
                `${brand} ${type} Pro-X${i}`,                    // name
                brand,                                           // brand
                `Model-${i}Z`,                                   // model
                `SN-${Math.random().toString(36).toUpperCase().substring(2, 10)}`, // serial_number
                qty,                                             // quantity
                qty,                                             // available
                5,                                               // minimum_stock
                'Unit',                                          // unit
                price,                                           // purchase_price
                price * 0.9,                                     // current_value
                locs[i % locs.length],                           // location
                'PT. Supplier Maju Jaya',                        // supplier
                '2025-01-01',                                    // purchase_date
                'good',                                          // condition
                `Aset operasional ${type}`,                      // description
                1,                                               // created_by
                new Date(),                                      // created_at
                `https://placehold.co/600x400?text=${brand}+${type}`, // image_url
                (i % 5) + 1                                      // category_id
            ]);
        }

        // 3. Eksekusi Query dengan 20 Kolom Lengkap
        const query = `
            INSERT INTO items 
            (item_code, name, brand, model, serial_number, quantity, available, minimum_stock, 
            unit, purchase_price, current_value, location, supplier, purchase_date, \`condition\`, 
            description, created_by, created_at, image_url, category_id) 
            VALUES ?
        `;

        await poolPromise.query(query, [values]);
        res.json({ success: true, message: "100 Data Full (Tanpa Null) Berhasil Dibuat! 🚀" });

    } catch (error) {
        console.error("Error Seeder:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- Sajikan Frontend ---
app.use(express.static(path.join(__dirname, 'frontend')));
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/', (req, res) => {
    res.json({ success: true, message: 'RA Inventory API 🚀', author: 'RA' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server Aktif di http://localhost:${PORT}`);
    console.log(`📊 Seeder Ready di POST /api/generate-data`);
});