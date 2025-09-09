import { sql } from '@vercel/postgres';

let booted = false;
export async function init() {
    if (booted) return; booted = true;

    await sql`CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`;

    await sql`CREATE TABLE IF NOT EXISTS services(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    duration_min INT NOT NULL DEFAULT 60,
    price NUMERIC DEFAULT 0
  );`;

    await sql`CREATE TABLE IF NOT EXISTS staff(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    phone TEXT
  );`;

    await sql`CREATE TABLE IF NOT EXISTS customers(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT
  );`;

    await sql`CREATE TABLE IF NOT EXISTS bookings(
    id SERIAL PRIMARY KEY,
    service_id INT REFERENCES services(id),
    staff_id   INT REFERENCES staff(id),
    customer_id INT REFERENCES customers(id),
    user_id INT REFERENCES users(id),
    start_at TIMESTAMPTZ NOT NULL,
    end_at   TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );`;

    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_staff_start ON bookings(staff_id, start_at);`;
}

export async function upsertByName(table, name, extras = {}) {
    const cols = ['name', ...Object.keys(extras)];
    const vals = [name, ...Object.values(extras)];
    const placeholders = vals.map((_, i) => `$${i + 1}`).join(',');
    const updates = cols.map(c => `${c}=EXCLUDED.${c}`).join(',');
    const { rows } = await sql.unsafe(
        `INSERT INTO ${table} (${cols.join(',')})
     VALUES (${placeholders})
     ON CONFLICT (name) DO UPDATE SET ${updates}
     RETURNING id;`, vals
    );
    return rows[0].id;
}

export async function overlapExists(staffId, startAt, endAt) {
    const { rows } = await sql`
    SELECT 1 FROM bookings
    WHERE staff_id=${staffId}
      AND NOT (end_at <= ${startAt} OR start_at >= ${endAt})
    LIMIT 1;`;
    return rows.length > 0;
}
