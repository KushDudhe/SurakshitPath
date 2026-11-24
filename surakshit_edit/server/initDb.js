import 'dotenv/config';
import { connect, getPool } from './models.js';

// Creates all tables from schema.sql in the database named by DATABASE_URL.
if (!process.env.DATABASE_URL) { console.error('DATABASE_URL is not set in server/.env'); process.exit(1); }
try {
  await connect(process.env.DATABASE_URL);
  const { rows } = await getPool().query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1");
  console.log('Tables ready:', rows.map((r) => r.table_name).join(', '));
  await getPool().end();
} catch (e) {
  console.error('Could not set up the database:', e.message);
  process.exit(1);
}
