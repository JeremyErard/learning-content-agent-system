import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    console.log('');
    console.log('To set up the database:');
    console.log('1. Create a PostgreSQL database (e.g., on Neon)');
    console.log('2. Set DATABASE_URL in your .env file');
    console.log('3. Run: npm run db:migrate');
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    console.log('Connected to database');

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../src/db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Executing schema...');
    await client.query(schema);

    console.log('Database schema created successfully');
  } catch (error) {
    console.error('Failed to migrate database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
