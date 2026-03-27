const Pool = require("pg").Pool;
require("dotenv").config();

/* PostgreSQL Database Connection Pool */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
  ssl: {
    rejectUnauthorized: false, 
  },
});

module.exports = pool;