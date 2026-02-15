const Pool = require("pg").Pool;
require("dotenv").config();

/* This config fixes the "Buffering/Timeout" issue by 
   forcing the server to accept Neon's SSL certificate.
*/

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
  ssl: {
    rejectUnauthorized: false, // <--- THIS STOPS THE HANGING
  },
});

module.exports = pool;