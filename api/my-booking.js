import { init } from './_db.js';
import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    const h = req.headers.authorization || ''; const t = h.split(' ')[1];
    let me; try { me = jwt.verify(t, process.env.AUTH_SECRET); } catch { return res.status(401).json({ error: 'unauthorized' }); }
    await init();
    const { rows } = await sql`
    SELECT b.id,b.start_at,b.end_at,b.status,
           s.name as service, st.name as staff
    FROM bookings b
    JOIN services s ON s.id=b.service_id
    JOIN staff st ON st.id=b.staff_id
    WHERE b.user_id=${me.sub}
    ORDER BY b.start_at DESC;`;
    return res.status(200).json(rows);
}
