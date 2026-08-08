const mysql = require('mysql2');

// MySQL Pool Connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '10760618608ffmax1', // Agar password set kiya ho toh yahan likhein, varna khali chhod dein
  database: 'safarsathi_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Promises support ke sath export karein taaki async/await use ho sake
module.exports = pool.promise();