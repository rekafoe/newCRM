// backend/knexfile.js
require('dotenv').config();

module.exports = {
  development: {
    client: 'cockroachdb',
    connection: process.env.DATABASE_URL || {
      host:     process.env.DB_HOST,
      port:     process.env.DB_PORT,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl:      false
    },
    migrations: {
      directory: './migrations'
    },
    pool: { min: 2, max: 10 }
  }
};
