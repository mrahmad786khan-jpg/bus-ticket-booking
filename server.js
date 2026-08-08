const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. AUTHENTICATION APIs (Login & Register)
// ==========================================

// Register User (Email & Mobile Support)
app.post('/api/register', async (req, res) => {
  const name = req.body.name ? req.body.name.trim() : '';
  const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
  const mobile = req.body.mobile || req.body.phone ? (req.body.mobile || req.body.phone).toString().trim() : '';
  const password = req.body.password ? req.body.password.trim() : '';

  if ((!email && !mobile) || !password || !name) {
    return res.status(400).json({ success: false, message: 'Name, Password aur Email ya Mobile bharna zaroori hai!' });
  }

  try {
    // Check if user already exists via Email or Mobile
    const [existing] = await db.query(
      `SELECT * FROM users 
       WHERE (email != '' AND LOWER(TRIM(email)) = LOWER(?)) 
       OR (name = ?) 
       OR (LOWER(TRIM(email)) = LOWER(?))`, 
      [email, mobile, mobile]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Yeh Email ya Mobile Number pehle se registered hai!' });
    }
    
    // Fallback: Agar email na ho toh dummy/identifier value save karein
    const finalEmail = email || `${mobile}@mobileuser.com`;

    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "user")',
      [name, finalEmail, password]
    );

    console.log(`[REGISTER SUCCESS] New user registered: ${name} (${finalEmail})`);
    res.json({ success: true, message: 'Registration successful!' });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login User (Mobile / Name / Email Se Login Allowed)
app.post('/api/login', async (req, res) => {
  const rawIdentifier = req.body.email || req.body.mobile || req.body.identifier || req.body.phone || '';
  const cleanIdentifier = rawIdentifier.toString().trim();
  const password = req.body.password ? req.body.password.trim() : '';

  console.log(`[LOGIN TRY] Input Identifier: "${cleanIdentifier}" | Password: "${password}"`);

  if (!cleanIdentifier || !password) {
    return res.status(400).json({ success: false, message: 'Mobile/Email aur Password zaroori hai!' });
  }

  try {
    const [users] = await db.query(
      `SELECT id, name, email, role FROM users 
       WHERE (LOWER(TRIM(email)) = LOWER(?) OR TRIM(name) = ? OR LOWER(TRIM(email)) LIKE LOWER(?)) 
       AND BINARY TRIM(password) = ?`, 
      [cleanIdentifier, cleanIdentifier, `%${cleanIdentifier}%`, password]
    );

    if (users.length === 0) {
      console.log(`[LOGIN FAILED] Invalid credentials for: "${cleanIdentifier}"`);
      return res.status(401).json({ success: false, message: 'Invalid Mobile/Email ya Password!' });
    }

    const user = users[0];
    console.log(`[LOGIN SUCCESS] User logged in: ${user.name} (${user.role})`);

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
  } catch (err) {
    console.error("Login DB Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. BUS SEARCH & ADMIN APIs
// ==========================================

// Get All Buses / Search Buses with Source & Destination Filter
app.get('/api/buses', async (req, res) => {
  const from = req.query.from ? req.query.from.trim() : '';
  const to = req.query.to ? req.query.to.trim() : '';

  try {
    let sql = 'SELECT * FROM buses';
    let params = [];

    if (from || to) {
      sql += ' WHERE 1=1';
      if (from) {
        sql += ' AND LOWER(TRIM(source)) LIKE LOWER(?)';
        params.push(`%${from}%`);
      }
      if (to) {
        sql += ' AND LOWER(TRIM(destination)) LIKE LOWER(?)';
        params.push(`%${to}%`);
      }
    }

    sql += ' ORDER BY id DESC';

    const [buses] = await db.query(sql, params);
    res.json(buses);
  } catch (err) {
    console.error("Fetch Buses Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Admin: Add New Bus
app.post('/api/admin/add-bus', async (req, res) => {
  const { bus_name, bus_number, source, destination, departure_time, arrival_time, fare } = req.body;
  try {
    await db.query(
      'INSERT INTO buses (bus_name, bus_number, source, destination, departure_time, arrival_time, fare) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [bus_name, bus_number, source, destination, departure_time, arrival_time, fare]
    );
    res.json({ success: true, message: 'Bus successfully add ho gayi!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Delete Bus
app.delete('/api/admin/delete-bus/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM buses WHERE id = ?', [id]);
    res.json({ success: true, message: 'Bus delete ho gayi!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Dashboard Analytics
app.get('/api/admin/dashboard-stats', async (req, res) => {
  try {
    const [bookings] = await db.query('SELECT * FROM bookings ORDER BY id DESC');
    const [totalBuses] = await db.query('SELECT COUNT(*) as count FROM buses');
    const [revenue] = await db.query('SELECT SUM(total_fare) as total FROM bookings');

    res.json({
      success: true,
      stats: {
        totalBookings: bookings.length,
        totalBuses: totalBuses[0]?.count || 0,
        totalRevenue: revenue[0]?.total || 0
      },
      bookings: bookings
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Safar Sathi Backend Server running on http://localhost:${PORT}`);
});