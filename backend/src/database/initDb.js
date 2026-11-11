import { initializeDatabase, query, getDatabaseType } from '../config/db.js';

async function run() {
  console.log('🚀 Running database initialization script...');
  await initializeDatabase();
  const dbType = getDatabaseType();
  console.log(`📌 Active database engine: ${dbType}`);

  const res = await query('SELECT COUNT(*) AS total FROM employees');
  const total = res.rows[0]?.total ?? res.rows[0]?.count ?? 0;
  console.log(`📊 Total employee records currently in database: ${total}`);

  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Database initialization error:', err);
  process.exit(1);
});

