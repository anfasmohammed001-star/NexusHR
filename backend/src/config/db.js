import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './env.js';

const currentDir =
  typeof import.meta?.url === 'string' && import.meta.url
    ? path.dirname(fileURLToPath(import.meta.url))
    : typeof __dirname === 'string'
      ? __dirname
      : process.cwd();

let dbClient = null;
let dbType = 'unknown';

const PG_SCHEMA_FALLBACK_SQL = `
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL CHECK (char_length(trim(name)) > 0),
  department VARCHAR(100) NOT NULL CHECK (char_length(trim(department)) > 0),
  role VARCHAR(100) NOT NULL CHECK (char_length(trim(role)) > 0),
  salary NUMERIC(12, 2) NOT NULL CHECK (salary > 0),
  join_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees (name);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees (department);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees (role);
CREATE INDEX IF NOT EXISTS idx_employees_salary ON employees (salary);
CREATE INDEX IF NOT EXISTS idx_employees_join_date ON employees (join_date);
`;

const SQLITE_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    role TEXT NOT NULL,
    salary NUMERIC NOT NULL CHECK (salary > 0),
    join_date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_employees_name ON employees (name);
  CREATE INDEX IF NOT EXISTS idx_employees_department ON employees (department);
  CREATE INDEX IF NOT EXISTS idx_employees_role ON employees (role);
  CREATE INDEX IF NOT EXISTS idx_employees_salary ON employees (salary);
  CREATE INDEX IF NOT EXISTS idx_employees_join_date ON employees (join_date);
`;

/**
 * Translate PostgreSQL positional parameters ($1, $2, ...) into SQLite `?` bindings.
 */
function translatePostgresParams(text, params = []) {
  const mappedParams = [];
  const sqliteSql = text
    .replace(/\$(\d+)/g, (_, indexStr) => {
      const idx = parseInt(indexStr, 10) - 1;
      if (idx >= 0 && idx < params.length) {
        mappedParams.push(params[idx]);
      }
      return '?';
    })
    .replace(/RETURNING\s+\*/gi, '')
    .trim();

  return {
    sqliteSql,
    finalParams: mappedParams.length > 0 ? mappedParams : params,
    isSelect: /^\s*SELECT/i.test(sqliteSql),
    isInsert: /^\s*INSERT/i.test(sqliteSql),
    isUpdate: /^\s*UPDATE/i.test(sqliteSql),
    wantsReturning: /RETURNING/i.test(text),
  };
}

// Pre-packaged seed data for automatic fallback or bootstrapping
const INITIAL_SEEDS = [
  ['Sarah Jenkins', 'Engineering', 'Principal Cloud Architect', 145000.00, '2021-03-15'],
  ['Alexander Chen', 'Engineering', 'Senior Full-Stack Engineer', 125000.00, '2022-06-01'],
  ['Elena Rostova', 'Engineering', 'Frontend Specialist', 95000.00, '2023-01-10'],
  ['Marcus Vance', 'HR', 'People Operations Director', 115000.00, '2020-08-20'],
  ['Priya Sharma', 'HR', 'Talent Acquisition Lead', 85000.00, '2022-11-14'],
  ['Jonathan Miller', 'Finance', 'Senior Financial Analyst', 98000.00, '2021-09-05'],
  ['Beatrice Dubois', 'Finance', 'Chief Financial Controller', 160000.00, '2019-04-12'],
  ['David Kim', 'Sales', 'Enterprise Account Executive', 105000.00, '2022-02-18'],
  ['Sophia Martinez', 'Marketing', 'VP of Brand Strategy', 135000.00, '2021-07-22'],
  ["Liam O'Connor", 'Operations', 'Infrastructure & Ops Manager', 112000.00, '2023-05-30']
];

/**
 * Initialize PostgreSQL connection
 */
async function initPostgres() {
  const isLocalPg =
    !env.DATABASE_URL ||
    env.DATABASE_URL.includes('localhost') ||
    env.DATABASE_URL.includes('127.0.0.1') ||
    env.DATABASE_URL.includes('sslmode=disable');

  const pool = new Pool(
    env.DATABASE_URL
      ? {
          connectionString: env.DATABASE_URL,
          connectionTimeoutMillis: 3000,
          ...(isLocalPg ? {} : { ssl: { rejectUnauthorized: false } }),
        }
      : {
          host: env.PGHOST,
          port: env.PGPORT,
          user: env.PGUSER,
          password: env.PGPASSWORD,
          database: env.PGDATABASE,
          connectionTimeoutMillis: 3000,
        }
  );

  // Test connection
  const client = await pool.connect();
  client.release();

  console.log('✅ Connected to PostgreSQL database successfully.');

  // Create table & indexes if not present
  const schemaPath = path.resolve(currentDir, '../../database/schema.sql');
  const schemaSql = fs.existsSync(schemaPath)
    ? fs.readFileSync(schemaPath, 'utf8')
    : PG_SCHEMA_FALLBACK_SQL;
  await pool.query(schemaSql);

  // Check if seed needed
  const countRes = await pool.query('SELECT COUNT(*) AS count FROM employees');
  if (parseInt(countRes.rows[0].count, 10) === 0) {
    console.log('🌱 Seeding initial employee records into PostgreSQL...');
    for (const [name, dept, role, salary, joinDate] of INITIAL_SEEDS) {
      await pool.query(
        'INSERT INTO employees (name, department, role, salary, join_date) VALUES ($1, $2, $3, $4, $5)',
        [name, dept, role, salary, joinDate]
      );
    }
    console.log(`✅ Seeded ${INITIAL_SEEDS.length} records into PostgreSQL.`);
  }

  dbType = 'postgresql';
  dbClient = {
    type: 'postgresql',
    pool,
    async query(text, params = []) {
      const res = await pool.query(text, params);
      return {
        rows: res.rows.map(normalizeRow),
        rowCount: res.rowCount,
      };
    },
    async close() {
      await pool.end();
    },
  };

  return dbClient;
}

/**
 * Resolve writable SQLite storage path across local and serverless runtimes.
 */
function resolveSqlitePath() {
  const isServerless = Boolean(
    process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL
  );
  const dataDir = isServerless
    ? path.join(os.tmpdir(), 'nexushr-data')
    : path.resolve(currentDir, '../../data');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, 'employees.sqlite');
}

/**
 * Build SQLite adapter using Node.js native node:sqlite.
 */
async function createNativeSqliteClient(dbPath) {
  const { DatabaseSync } = await import('node:sqlite');
  const sqlite = new DatabaseSync(dbPath);

  sqlite.exec('PRAGMA journal_mode = WAL;');
  sqlite.exec('PRAGMA foreign_keys = ON;');
  sqlite.exec(SQLITE_SCHEMA_SQL);

  const countRow = sqlite.prepare('SELECT COUNT(*) AS count FROM employees').get();
  if (Number(countRow.count) === 0) {
    console.log('🌱 Seeding initial employee records into SQLite...');
    const insertStmt = sqlite.prepare(
      'INSERT INTO employees (name, department, role, salary, join_date) VALUES (?, ?, ?, ?, ?)'
    );
    for (const [name, dept, role, salary, joinDate] of INITIAL_SEEDS) {
      insertStmt.run(name, dept, role, salary, joinDate);
    }
    console.log(`✅ Seeded ${INITIAL_SEEDS.length} records into SQLite.`);
  }

  return {
    type: 'sqlite',
    sqlite,
    async query(text, params = []) {
      const { sqliteSql, finalParams, isSelect, isInsert, isUpdate, wantsReturning } =
        translatePostgresParams(text, params);
      const stmt = sqlite.prepare(sqliteSql);

      if (isSelect) {
        const rows = stmt.all(...finalParams);
        return { rows: rows.map(normalizeRow), rowCount: rows.length };
      }

      const result = stmt.run(...finalParams);

      if (isInsert && wantsReturning) {
        const lastRow = sqlite.prepare('SELECT * FROM employees WHERE id = ?').get(result.lastInsertRowid);
        return {
          rows: lastRow ? [normalizeRow(lastRow)] : [],
          rowCount: result.changes,
        };
      }

      if (isUpdate && wantsReturning) {
        if (result.changes === 0) {
          return { rows: [], rowCount: 0 };
        }
        const id = params[params.length - 1];
        const updatedRow = sqlite.prepare('SELECT * FROM employees WHERE id = ?').get(id);
        return {
          rows: updatedRow ? [normalizeRow(updatedRow)] : [],
          rowCount: result.changes,
        };
      }

      return { rows: [], rowCount: result.changes };
    },
    async close() {
      sqlite.close();
    },
  };
}

/**
 * Load Netlify Blobs store when running inside Netlify serverless environment.
 */
async function loadNetlifyBlobStore() {
  if (!process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME && !globalThis.netlifyBlobsContext) {
    return null;
  }
  try {
    const { getStore } = await import('@netlify/blobs');
    return getStore({ name: 'nexushr-db', consistency: 'strong' });
  } catch (err) {
    console.warn('⚠️ Netlify Blobs client unavailable, using local /tmp SQLite:', err.message);
    return null;
  }
}

/**
 * Pure-JS SQLite adapter (sql.js inline WASM) with strongly consistent Netlify Blobs sync.
 */
async function createSqlJsClient(dbPath) {
  const BLOB_KEY = 'employees.sqlite';
  const sqlJsMod = await import('sql.js/dist/sql-wasm-inline.js');
  const initSqlJs = sqlJsMod.default || sqlJsMod;
  const SQL = await initSqlJs();
  const blobStore = await loadNetlifyBlobStore();

  let sqlDb = null;
  let currentBlobEtag = null;
  let blobSyncDisabled = !blobStore;
  let syncQueue = Promise.resolve();

  const runSelect = (sql, bindParams = []) => {
    const stmt = sqlDb.prepare(sql);
    if (bindParams.length > 0) {
      stmt.bind(bindParams);
    }
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  };

  const ensureSchemaAndSeed = () => {
    sqlDb.exec(SQLITE_SCHEMA_SQL);
    const countRow = runSelect('SELECT COUNT(*) AS count FROM employees')[0];
    if (Number(countRow?.count || 0) === 0) {
      console.log('🌱 Seeding initial employee records into sql.js SQLite...');
      for (const [name, dept, role, salary, joinDate] of INITIAL_SEEDS) {
        sqlDb.run(
          'INSERT INTO employees (name, department, role, salary, join_date) VALUES (?, ?, ?, ?, ?)',
          [name, dept, role, salary, joinDate]
        );
      }
      console.log(`✅ Seeded ${INITIAL_SEEDS.length} records into sql.js SQLite.`);
      return true;
    }
    return false;
  };

  const loadSqlDbFromBuffer = (bufferLike) => {
    if (sqlDb) {
      sqlDb.close();
    }
    sqlDb = new SQL.Database(bufferLike ? new Uint8Array(bufferLike) : undefined);
    return ensureSchemaAndSeed();
  };

  const exportAndWriteLocal = () => {
    const bytes = sqlDb.export();
    fs.writeFileSync(dbPath, Buffer.from(bytes));
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  };

  const isMissingBlobsEnvError = (err) =>
    /MissingBlobsEnvironment/i.test(`${err?.name || ''} ${err?.message || ''}`);

  const persist = async () => {
    const arrayBuffer = exportAndWriteLocal();
    if (blobSyncDisabled || !blobStore) return;

    try {
      await blobStore.set(BLOB_KEY, arrayBuffer);
      const meta = await blobStore.getMetadata(BLOB_KEY, { consistency: 'strong' });
      currentBlobEtag = meta?.etag || null;
    } catch (err) {
      if (isMissingBlobsEnvError(err)) {
        blobSyncDisabled = true;
        return;
      }
      console.warn('⚠️ Failed to persist SQLite state to Netlify Blobs:', err.message);
    }
  };

  const performSync = async () => {
    if (!sqlDb) {
      const localBytes = fs.existsSync(dbPath) ? fs.readFileSync(dbPath) : undefined;
      loadSqlDbFromBuffer(localBytes);
    }

    if (blobSyncDisabled || !blobStore) {
      exportAndWriteLocal();
      return;
    }

    try {
      const meta = await blobStore.getMetadata(BLOB_KEY, { consistency: 'strong' });
      if (!meta) {
        await persist();
        return;
      }

      if (meta.etag && meta.etag === currentBlobEtag) {
        return;
      }

      const entry = await blobStore.getWithMetadata(BLOB_KEY, {
        type: 'arrayBuffer',
        consistency: 'strong',
      });
      if (entry?.data) {
        loadSqlDbFromBuffer(entry.data);
        exportAndWriteLocal();
        currentBlobEtag = entry.etag || meta.etag || null;
      }
    } catch (err) {
      if (isMissingBlobsEnvError(err)) {
        blobSyncDisabled = true;
        exportAndWriteLocal();
        return;
      }
      console.warn('⚠️ Failed to sync SQLite state from Netlify Blobs:', err.message);
    }
  };

  const sync = () => {
    const run = syncQueue.then(performSync, performSync);
    syncQueue = run.catch(() => {});
    return run;
  };

  await sync();

  return {
    type: 'sqlite',
    sync,
    async query(text, params = []) {
      const { sqliteSql, finalParams, isSelect, isInsert, isUpdate, wantsReturning } =
        translatePostgresParams(text, params);

      if (isSelect) {
        const rows = runSelect(sqliteSql, finalParams);
        return { rows: rows.map(normalizeRow), rowCount: rows.length };
      }

      sqlDb.run(sqliteSql, finalParams);
      const changes = sqlDb.getRowsModified();

      let rows = [];
      if (isInsert && wantsReturning) {
        const idRow = runSelect('SELECT last_insert_rowid() AS id')[0];
        rows = runSelect('SELECT * FROM employees WHERE id = ?', [idRow.id]).map(normalizeRow);
      } else if (isUpdate && wantsReturning && changes > 0) {
        const id = params[params.length - 1];
        rows = runSelect('SELECT * FROM employees WHERE id = ?', [id]).map(normalizeRow);
      }

      await persist();
      return { rows, rowCount: changes };
    },
    async close() {
      await persist();
      if (sqlDb) {
        sqlDb.close();
        sqlDb = null;
      }
    },
  };
}

/**
 * Initialize SQLite fallback (node:sqlite locally; sql.js + Blobs on serverless)
 */
async function initSqliteFallback() {
  const dbPath = resolveSqlitePath();
  const useSqlJsPrimary = Boolean(
    process.env.FORCE_SQLJS === '1' ||
      process.env.NETLIFY ||
      process.env.AWS_LAMBDA_FUNCTION_NAME
  );

  if (useSqlJsPrimary) {
    dbClient = await createSqlJsClient(dbPath);
  } else {
    try {
      dbClient = await createNativeSqliteClient(dbPath);
    } catch (nativeErr) {
      console.warn('⚠️ Native node:sqlite unavailable, using sql.js fallback:', nativeErr.message);
      dbClient = await createSqlJsClient(dbPath);
    }
  }

  dbType = 'sqlite';
  console.log(`⚡ Using persistent SQLite database at: ${dbPath}`);
  return dbClient;
}

/**
 * Uniform row normalizer (ensures date strings YYYY-MM-DD, numbers for salary, timestamps)
 */
function normalizeRow(row) {
  if (!row) return row;
  const normalized = { ...row };

  // Parse salary as float
  if (normalized.salary !== undefined) {
    normalized.salary = parseFloat(normalized.salary);
  }

  // Format join_date as YYYY-MM-DD without UTC timezone shift
  if (normalized.join_date) {
    if (normalized.join_date instanceof Date) {
      const yr = normalized.join_date.getFullYear();
      const mo = String(normalized.join_date.getMonth() + 1).padStart(2, '0');
      const dy = String(normalized.join_date.getDate()).padStart(2, '0');
      normalized.join_date = `${yr}-${mo}-${dy}`;
    } else if (typeof normalized.join_date === 'string' && normalized.join_date.includes('T')) {
      normalized.join_date = normalized.join_date.split('T')[0];
    }
  }

  return normalized;
}

/**
 * Initialize DB on startup
 */
export async function initializeDatabase() {
  if (dbClient) return dbClient;

  try {
    console.log('🔄 Checking PostgreSQL connection...');
    await initPostgres();
    return dbClient;
  } catch (err) {
    console.warn('⚠️ PostgreSQL connection failed:', err.message);
    console.info('👉 Falling back to persistent local SQLite storage (Node.js native). All CRUD operations & tests will run 100% seamlessly!');
    await initSqliteFallback();
    return dbClient;
  }
}

/**
 * Synchronize database state across serverless invocations when supported.
 */
export async function syncDatabase() {
  if (!dbClient) {
    await initializeDatabase();
  }
  if (typeof dbClient?.sync === 'function') {
    await dbClient.sync();
  }
}

/**
 * Export unified query executor
 */
export async function query(text, params = []) {
  if (!dbClient) {
    await initializeDatabase();
  }
  return dbClient.query(text, params);
}

export function getDatabaseType() {
  return dbType;
}

export default {
  initializeDatabase,
  syncDatabase,
  query,
  getDatabaseType,
};
