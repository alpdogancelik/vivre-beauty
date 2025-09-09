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
        const { email, password } = await readJson(req);
        const { rows } = await sql`SELECT id,name,email,role,password_hash FROM users WHERE email=${email.toLowerCase()} LIMIT 1;`;
        const u = rows[0];
        if (!u || !(await bcrypt.compare(password, u.password_hash))) return res.status(401).json({ error: 'Geçersiz bilgiler' });
        const token = jwt.sign({ sub: u.id, email: u.email, role: u.role }, process.env.AUTH_SECRET, { expiresIn: '180d' });
        res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
        return res.status(200).json({ token, user: { id: u.id, name: u.name, email: u.email, role: u.role } });
    } catch (e) { console.error(e); return res.status(500).json({ error: 'Sunucu hatası' }); }
}
