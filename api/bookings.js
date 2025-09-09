import { init, upsertByName, overlapExists } from './_db.js';
import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';

const readJson = req => new Promise((ok, err) => {
    const c = []; req.on('data', x => c.push(x)); req.on('end', () => { try { ok(JSON.parse(Buffer.concat(c) || '{}')); } catch (e) { err(e); } });
});
const origin = process.env.CORS_ORIGIN || '*';
const allow = res => {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Admin-Token');
};

function getUser(req) {
    const h = req.headers['authorization'];
    if (!h) return null;
    const [, token] = h.split(' ');
    try { return jwt.verify(token, process.env.AUTH_SECRET); } catch { return null; }
}

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') { allow(res); return res.status(200).end(); }
    await init(); allow(res);

    if (req.method === 'POST') {
        try {
            const me = getUser(req); // null olabilir
            const body = await readJson(req);
            const { serviceName, durationMin = 60, price = 0, staffName, customer, date, time, notes = '' } = body;
            if (!serviceName || !staffName || !date || !time) return res.status(400).json({ error: 'Eksik alan' });

            const startAt = new Date(`${date}T${time}:00`);
            const endAt = new Date(startAt.getTime() + durationMin * 60000);

            const serviceId = await upsertByName('services', serviceName, { duration_min: durationMin, price });
            const staffId = await upsertByName('staff', staffName);

            let customerId = null;
            if (!me) {
                const { rows: r } = await sql`
          INSERT INTO customers(name, phone, email) VALUES(${customer?.name || 'Anonim'}, ${customer?.phone || ''}, ${customer?.email || ''})
          RETURNING id;`;
                customerId = r[0].id;
            }

            if (await overlapExists(staffId, startAt, endAt)) return res.status(409).json({ error: 'Bu saat personelde dolu' });

            const { rows } = await sql`
        INSERT INTO bookings(service_id, staff_id, customer_id, user_id, start_at, end_at, status, notes)
        VALUES(${serviceId}, ${staffId}, ${customerId}, ${me?.sub || null}, ${startAt}, ${endAt}, 'pending', ${notes})
        RETURNING id;`;
            return res.status(201).json({ ok: true, id: rows[0].id });
        } catch (e) { console.error(e); return res.status(500).json({ error: 'Sunucu hatası' }); }
    }

    if (req.method === 'GET') {
        // Admin listesi: X-Admin-Token veya JWT role=admin
        const me = getUser(req);
        const byJwtAdmin = me?.role === 'admin';
        const byHeader = req.headers['x-admin-token'] === process.env.ADMIN_TOKEN;
        if (!byJwtAdmin && !byHeader) return res.status(401).json({ error: 'unauthorized' });

        const { from, to, status = 'all' } = req.query ?? {};
        const where = []; if (from) where.push(`start_at>='${from}'`); if (to) where.push(`start_at<'${to}'`); if (status !== 'all') where.push(`status='${status}'`);
        const sqlWhere = where.length ? `WHERE ${where.join(' AND ')}` : '';
        const { rows } = await sql.unsafe(`
      SELECT b.id,b.start_at,b.end_at,b.status,b.notes,
             s.name service, st.name staff,
             COALESCE(u.name,c.name,'-') customer,
             COALESCE(u.email,c.email,'') email,
             COALESCE(u.phone,c.phone,'') phone
      FROM bookings b
      JOIN services s ON s.id=b.service_id
      JOIN staff st ON st.id=b.staff_id
      LEFT JOIN users u ON u.id=b.user_id
      LEFT JOIN customers c ON c.id=b.customer_id
      ${sqlWhere}
      ORDER BY b.start_at DESC
      LIMIT 500;`);
        return res.status(200).json(rows);
    }

    return res.status(405).json({ error: 'method not allowed' });
}
