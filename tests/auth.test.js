const request = require('supertest');
const app = require('../app'); 
const db = require('../config/db');

describe('RA Inventory - Integrated Unit Testing', () => {
    
    let adminToken = '';
    afterAll(async () => {
        await db.end(); 
    });

    test('1. [Auth] Harus berhasil login dengan data admin', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: "rahmaaulia@example.com", 
                password: "password123" 
            });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('token');
        adminToken = res.body.data.token;
    });

    test('2. [Auth] Harus menolak akses ke profil jika tidak ada token', async () => {
        const res = await request(app).get('/api/auth/profile');
        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
    });

    test('3. [Public] Harus bisa mencari barang tanpa login', async () => {
        const res = await request(app).get('/api/public/search?q=Asus');
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('4. [Admin] Harus menolak akses hapus barang jika tanpa token admin', async () => {
        const res = await request(app).delete('/api/items/BRG-001');
        
        expect(res.statusCode).toBe(401); 
        expect(res.body.message).toContain('Token diperlukan');
    });

    test('5. [Loan] Harus gagal meminjam jika stok tidak mencukupi', async () => {
        const res = await request(app)
            .post('/api/loans')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                item_id: 1,
                quantity: 99999, 
                return_date: '2026-12-31',
                purpose: 'Testing UAS'
            });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Stok tidak cukup!');
    });
});