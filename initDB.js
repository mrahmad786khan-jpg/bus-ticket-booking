const mysql = require('mysql2');

// XAMPP / Localhost MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '10760618608ffmax1' // XAMPP ka default password blank (empty) hota hai
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL Connection Failed:', err.message);
    console.log('👉 Make sure XAMPP Control Panel mein MySQL Start ho!');
    return;
  }
  console.log('✅ Connected to MySQL Server!');

  const queries = [
    `CREATE DATABASE IF NOT EXISTS safarsathi_db;`,
    `USE safarsathi_db;`,
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS buses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      bus_name VARCHAR(100) NOT NULL,
      bus_number VARCHAR(50) NOT NULL,
      source VARCHAR(50) NOT NULL,
      destination VARCHAR(50) NOT NULL,
      departure_time VARCHAR(20) NOT NULL,
      arrival_time VARCHAR(20) NOT NULL,
      fare DECIMAL(10, 2) NOT NULL,
      seats_capacity INT DEFAULT 36,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pnr VARCHAR(20) UNIQUE NOT NULL,
      user_id INT,
      bus_id INT,
      passenger_name VARCHAR(100) NOT NULL,
      passenger_email VARCHAR(100) NOT NULL,
      source VARCHAR(50) NOT NULL,
      destination VARCHAR(50) NOT NULL,
      seat_no VARCHAR(100) NOT NULL,
      total_fare DECIMAL(10, 2) NOT NULL,
      booking_date DATE DEFAULT (CURRENT_DATE),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE SET NULL
    );`,
    `INSERT INTO users (name, email, password, role) 
     VALUES ('Admin', 'admin@safarsathi.com', 'admin123', 'admin')
     ON DUPLICATE KEY UPDATE id=id;`
  ];

  let completed = 0;
  queries.forEach((q) => {
    db.query(q, (err) => {
      if (err) {
        console.error('❌ Query Error:', err.message);
      }
      completed++;
      if (completed === queries.length) {
        console.log('🎉 Safar Sathi Database aur All Tables Successfully Ban Gaye Hain!');
        db.end();
      }
    });
  });
});