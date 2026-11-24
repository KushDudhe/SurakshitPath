import pg from 'pg';
import { readFileSync } from 'node:fs';

// PostgreSQL data layer (PostgreSQL via node-postgres).
// Rows are returned in the same shape the client already expects: { _id, ...fields, createdAt, updatedAt }.

let pool = null;
export const getPool = () => pool;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SCHEMA = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');

// Per-table config: API field name -> column name, plus value coercion.
const str = (v) => (v == null ? null : String(v));
const num = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? null : Number(v));

const TABLES = {
  journeys: {
    fields: { from: ['from_place', str], to: ['to_place', str], date: ['date', str], time: ['time', str], duration: ['duration', num], score: ['score', num], status: ['status', str] },
  },
  reports: {
    fields: { type: ['type', str], location: ['location', str], description: ['description', str], image: ['image', str], date: ['date', str], status: ['status', str] },
  },
  contacts: {
    fields: { name: ['name', str], relation: ['relation', str] },
  },
};

function toApi(table, row) {
  const out = { _id: row.id };
  for (const [apiKey, [col]] of Object.entries(TABLES[table].fields)) out[apiKey] = row[col];
  out.createdAt = row.created_at;
  out.updatedAt = row.updated_at;
  return out;
}

export async function connect(connectionString) {
  const p = new pg.Pool({ connectionString, connectionTimeoutMillis: 5000, max: 5 });
  await p.query('SELECT 1');
  await p.query(SCHEMA);
  pool = p;
}

export const list = async (table) => {
  const { rows } = await pool.query(`SELECT * FROM ${table} ORDER BY created_at DESC LIMIT 200`);
  return rows.map((r) => toApi(table, r));
};

export const create = async (table, body) => {
  const cols = [];
  const vals = [];
  for (const [apiKey, [col, coerce]] of Object.entries(TABLES[table].fields)) {
    if (body[apiKey] !== undefined) { cols.push(col); vals.push(coerce(body[apiKey])); }
  }
  const sql = cols.length
    ? `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`
    : `INSERT INTO ${table} DEFAULT VALUES RETURNING *`;
  const { rows } = await pool.query(sql, vals);
  return toApi(table, rows[0]);
};

export const remove = async (table, id) => {
  if (!UUID_RE.test(id)) return; // ids that came from the client's localStorage are not UUIDs
  await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
};

// ---- users (login) ----
const publicUser = (r) => ({ _id: r.id, name: r.name, email: r.email });

export const createUser = async ({ name, email, passwordHash }) => {
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [name, email, passwordHash],
    );
    return publicUser(rows[0]);
  } catch (e) {
    if (e.code === '23505') return null; // unique violation: email already registered
    throw e;
  }
};

export const findUserByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE lower(email) = lower($1)', [email]);
  return rows[0] ? { ...publicUser(rows[0]), passwordHash: rows[0].password_hash } : null;
};
