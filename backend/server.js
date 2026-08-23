const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Frontend folder ko static serve karne ke liye (Agar frontend sath me hai)
app.use(express.static(path.join(__dirname, '../frontend')));

// MySQL Cloud Database Connection
// Render par environment variables (process.env) ke zariye details di jayengi
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '10760618608ffmax1',
  database: process.env.DB_NAME || 'safarsathi_db',
  port: process.env.DB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database Connection Failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL Database');
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

  const checkSql = 'SELECT * FROM users WHERE email = ?';
  db.query(checkSql, [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    
    if (results.length > 0) {
      return res.status(400).json({ success: false, message: 'Yeh email pehle se registered hai!' });
    }

    const insertSql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(insertSql, [name, email, password], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: err.message });

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
    if (err) return res.status(500).json({ success: false, message: err.message });

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

// 3. Get Buses API
app.get('/api/buses', (req, res) => {
  const { source, destination } = req.query;
  let sql = 'SELECT * FROM buses';
  let params = [];

  if (source && destination) {
    sql += ' WHERE source LIKE ? AND destination LIKE ?';
    params = [`%${source}%`, `%${destination}%`];
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json(results);
  });
});

// 4. Get Booked Seats API
app.get('/api/booked-seats', (req, res) => {
  const { busId, date } = req.query;

  if (!busId || !date) {
    return res.status(400).json({ success: false, message: 'busId and date are required' });
  }

  const sql = `
    SELECT seat_no 
    FROM bookings 
    WHERE bus_id = ? 
      AND DATE(travel_date) = DATE(?)
  `;

  db.query(sql, [busId, date], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });

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

// 5. Get My Bookings API
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
    if (err) return res.status(500).json({ success: false, message: err.message });
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
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Booking successful!', bookingId: result.insertId });
  });
});

// ==========================================
// AGENTS & OPERATORS APIS
// ==========================================

// 7. Agent Application Submit
app.post('/api/agents', (req, res) => {
  const { name, shop, phone, city } = req.body;

  if (!name || !shop || !phone || !city) {
    return res.status(400).json({ success: false, message: 'Kripya sabhi fields bharein!' });
  }

  const sql = 'INSERT INTO agents (full_name, agency_shop, phone, city) VALUES (?, ?, ?, ?)';
  
  db.query(sql, [name, shop, phone, city], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Agent Registered Successfully!' });
  });
});

// 8. Fetch All Agents
app.get('/api/agents', (req, res) => {
  db.query('SELECT * FROM agents ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json(results);
  });
});

// 9. Delete Agent
app.delete('/api/agents/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM agents WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Agent deleted successfully' });
  });
});

// 10. Operator Application Submit
app.post('/api/operators', (req, res) => {
  const { agency_name, owner_name, phone, fleet_size } = req.body;

  if (!agency_name || !owner_name || !phone) {
    return res.status(400).json({ success: false, message: 'Kripya zaroori details bharein!' });
  }

  const sql = 'INSERT INTO operators (agency_name, owner_name, phone, fleet_size) VALUES (?, ?, ?, ?)';

  db.query(sql, [agency_name, owner_name, phone, fleet_size || 1], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Operator Registered Successfully!' });
  });
});

// 11. Fetch All Operators
app.get('/api/operators', (req, res) => {
  db.query('SELECT * FROM operators ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json(results);
  });
});

// 12. Delete Operator
app.delete('/api/operators/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM operators WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Operator deleted successfully' });
  });
});

// ==========================================
// ADMIN DASHBOARD & MANAGEMENT APIS
// ==========================================

// 13. Admin Add New Bus
app.post('/api/admin/add-bus', (req, res) => {
  const { bus_name, bus_number, source, destination, departure_time, arrival_time, fare } = req.body;
  const sql = 'INSERT INTO buses (bus_name, bus_number, source, destination, departure_time, arrival_time, fare) VALUES (?, ?, ?, ?, ?, ?, ?)';
  
  db.query(sql, [bus_name, bus_number, source, destination, departure_time, arrival_time, fare], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Bus Added Successfully' });
  });
});

// 14. Admin Delete Bus Route
app.delete('/api/admin/delete-bus/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM buses WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: 'Bus deleted successfully' });
  });
});

// 15. Admin Dashboard Analytics
app.get('/api/admin/dashboard-stats', (req, res) => {
  const sqlBookings = 'SELECT * FROM bookings ORDER BY created_at DESC';
  const sqlStats = 'SELECT COUNT(*) AS totalBookings, SUM(total_fare) AS totalRevenue FROM bookings';

  db.query(sqlBookings, (err, bookings) => {
    if (err) return res.status(500).json({ success: false, message: err.message });

    db.query(sqlStats, (err, stats) => {
      if (err) return res.status(500).json({ success: false, message: err.message });

      res.json({
        success: true,
        bookings: bookings,
        stats: stats[0] || { totalBookings: 0, totalRevenue: 0 }
      });
    });
  });
});

// Start Server (Dynamic Port for Render)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});