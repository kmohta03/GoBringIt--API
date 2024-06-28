const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use environment variable for connection string
  ssl: {
    rejectUnauthorized: false, // For development purposes only; remove for production
  },
});

module.exports = pool;
