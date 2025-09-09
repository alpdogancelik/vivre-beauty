import { init } from '../_db.js';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const readJson = req => new Promise((ok, err) => {
    const c = []; req.on('data', x => c.push(x)); req.on('end', () => { try { ok(JSON.parse(Buffer.concat(c) || '{}')); } catch (e) { err(e); } });
});

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') { res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); return res.status(200).end(); }
    await init();
    try {
        const { name, email, phone = '', password } = await readJson(req);
        if (!name || !email || !password) return res.status(400).json({ error: 'Eksik alan' });
        const hash = await bcrypt.hash(password, 10);
        const { rows } = await sql`
      INSERT INTO users(name,email,phone,password_hash)
      VALUES(${name},${email.toLowerCase()},${phone},${hash})
      ON CONFLICT (email) DO NOTHING
      RETURNING id,name,email,role;`;
        const user = rows[0] || (await sql`SELECT id,name,email,role FROM users WHERE email=${email.toLowerCase()}`).rows[0];
        const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, process.env.AUTH_SECRET, { expiresIn: '180d' });
        res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
        return res.status(201).json({ token, user });
    } catch (e) { console.error(e); return res.status(500).json({ error: 'Sunucu hatası' }); }
}
