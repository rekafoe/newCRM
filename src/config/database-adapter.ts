import { Database } from 'sqlite';
import { Pool } from 'pg';

// Database adapter that works with both SQLite and PostgreSQL
export interface DatabaseAdapter {
  get<T = any>(sql: string, ...params: any[]): Promise<T | undefined>;
  all<T = any>(sql: string, ...params: any[]): Promise<T[]>;
  run(sql: string, ...params: any[]): Promise<{ lastID?: number; changes: number }>;
  exec(sql: string): Promise<void>;
}

// SQLite adapter
export class SQLiteAdapter implements DatabaseAdapter {
  constructor(private db: Database) {}

  async get<T = any>(sql: string, ...params: any[]): Promise<T | undefined> {
    return this.db.get<T>(sql, ...params);
  }

  async all<T = any>(sql: string, ...params: any[]): Promise<T[]> {
    return this.db.all<T>(sql, ...params) as Promise<T[]>;
  }

  async run(sql: string, ...params: any[]): Promise<{ lastID?: number; changes: number }> {
    const result = await this.db.run(sql, ...params);
    return { lastID: result.lastID, changes: result.changes || 0 };
  }

  async exec(sql: string): Promise<void> {
    await this.db.exec(sql);
  }
}

// PostgreSQL adapter
export class PostgreSQLAdapter implements DatabaseAdapter {
  constructor(private pool: Pool) {}

  async get<T = any>(sql: string, ...params: any[]): Promise<T | undefined> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows[0] as T;
    } finally {
      client.release();
    }
  }

  async all<T = any>(sql: string, ...params: any[]): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows as T[];
    } finally {
      client.release();
    }
  }

  async run(sql: string, ...params: any[]): Promise<{ lastID?: number; changes: number }> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return { 
        lastID: result.rows[0]?.id || result.rows[0]?.lastID,
        changes: result.rowCount || 0 
      };
    } finally {
      client.release();
    }
  }

  async exec(sql: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(sql);
    } finally {
      client.release();
    }
  }
}

// Factory function to create the appropriate adapter
export const createDatabaseAdapter = async (): Promise<DatabaseAdapter> => {
  if (process.env.DATABASE_URL) {
    // PostgreSQL
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    client.release();
    
    return new PostgreSQLAdapter(pool);
  } else {
    // SQLite (fallback)
    const { initDB } = await import('./database');
    const db = await initDB();
    console.log('✅ Connected to SQLite database');
    return new SQLiteAdapter(db);
  }
};
