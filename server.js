const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '10760618608ffmax1', // Aapka MySQL Password
  database: 'safarsathi_db'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database Connection Failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL Database (safarsathi_db)');
  }
});

// ==========================================
// AUTHENTICATION APIS (LOGIN & REGISTER)
// ==========================================

// 1. Register API
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Sabhi fields bharna zaroori hai!' });
  }

  // Check if user already exists
  const checkSql = 'SELECT * FROM users WHERE email = ?';
  db.query(checkSql, [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    
    if (results.length > 0) {
      return res.status(400).json({ success: false, message: 'Yeh email pehle se registered hai!' });
    }

    // Insert new user
    const insertSql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(insertSql, [name, email, password], (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err.message });

      res.json({
        success: true,
        message: 'Registration successful!',
        user: { id: result.insertId, name, email, role: 'user' }
      });
    });
  });
});

// 2. Login API
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email aur Password zaroori hain!' });
  }

  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });

    if (results.length > 0) {
      const user = results[0];
      res.json({
        success: true,
        message: 'Login successful!',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Galat Email ya Password!' });
    }
  });
});

// ==========================================
// BUSES & BOOKING APIS
// ==========================================

// 3. Get Buses API (Search Results)
app.get('/api/buses', (req, res) => {
  const { source, destination } = req.query;
  let sql = 'SELECT * FROM buses';
  let params = [];

  if (source && destination) {
    sql += ' WHERE source LIKE ? AND destination LIKE ?';
    params = [`%${source}%`, `%${destination}%`];
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 4. Get Booked Seats API (Date Wise Filter)
app.get('/api/booked-seats', (req, res) => {
  const { busId, date } = req.query;

  if (!busId || !date) {
    return res.status(400).json({ error: 'busId and date are required' });
  }

  const sql = `
    SELECT seat_no 
    FROM bookings 
    WHERE bus_id = ? 
      AND DATE(travel_date) = DATE(?)
  `;

  db.query(sql, [busId, date], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    let bookedSeats = [];
    results.forEach(row => {
      if (row.seat_no) {
        const seats = String(row.seat_no).split(',');
        bookedSeats.push(...seats);
      }
    });

    res.json(bookedSeats);
  });
});

// 5. Get My Bookings API (User Specific Filter)
app.get('/api/my-bookings', (req, res) => {
  const { email } = req.query;

  let sql = 'SELECT * FROM bookings';
  let params = [];

  if (email) {
    sql += ' WHERE passenger_email = ?';
    params.push(email);
  }

  sql += ' ORDER BY created_at DESC';

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 6. Create New Booking API
app.post('/api/bookings', (req, res) => {
  const { pnr, user_id, bus_id, passenger_name, passenger_email, source, destination, seat_no, travel_date, total_fare } = req.body;

  const sql = `
    INSERT INTO bookings 
    (pnr, user_id, bus_id, passenger_name, passenger_email, source, destination, seat_no, travel_date, total_fare) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [pnr, user_id, bus_id, passenger_name, passenger_email, source, destination, seat_no, travel_date, total_fare], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Booking successful!', bookingId: result.insertId });
  });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});