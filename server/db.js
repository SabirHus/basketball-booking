const Pool = require("pg").Pool;
require("dotenv").config();

/* This configuration handles the SSL handshake correctly 
   so the connection doesn't hang or buffer.
*/

const pool = new Pool({
  // If you use a URL in .env, use that. Otherwise use individual vars.
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  
  ssl: {
    rejectUnauthorized: false, // <--- THIS IS THE MAGIC LINE
  },
});

module.exports = pool;