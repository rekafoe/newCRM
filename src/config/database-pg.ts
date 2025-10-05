import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;

export const initPostgresDB = async (): Promise<Pool> => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    try {
      const client = await pool.connect();
      console.log('✅ Connected to PostgreSQL database');
      client.release();
    } catch (error) {
      console.error('❌ Failed to connect to PostgreSQL:', error);
      throw error;
    }
  }

  return pool;
};

export const getPostgresDB = async (): Promise<Pool> => {
  if (!pool) {
    return await initPostgresDB();
  }
  return pool;
};

export const pgDb = {
  get: async <T = any>(sql: string, params: any[] = []): Promise<T | undefined> => {
    const pool = await getPostgresDB();
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows[0] as T;
    } finally {
      client.release();
    }
  },
  
  all: async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
    const pool = await getPostgresDB();
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows as T[];
    } finally {
      client.release();
    }
  },
  
  run: async (sql: string, params: any[] = []): Promise<{ lastID?: number; changes: number }> => {
    const pool = await getPostgresDB();
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return { 
        lastID: result.rows[0]?.id || result.rows[0]?.lastID,
        changes: result.rowCount || 0 
      };
    } finally {
      client.release();
    }
  },

  exec: async (sql: string): Promise<void> => {
    const pool = await getPostgresDB();
    const client = await pool.connect();
    try {
      await client.query(sql);
    } finally {
      client.release();
    }
  }
};
