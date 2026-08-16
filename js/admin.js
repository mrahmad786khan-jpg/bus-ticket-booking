document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://127.0.0.1:5000/api';

  // Check Admin Security
  const savedUser = JSON.parse(localStorage.getItem('safarsathi_user') || '{}');
  if (savedUser.role !== 'admin') {
    alert('Access Denied! Admin Login Required.');
    window.location.href = 'auth.html';
    return;
  }

  const adminNameElement = document.getElementById('admin-name');
  if (adminNameElement && savedUser.name) {
    adminNameElement.innerText = `Welcome, ${savedUser.name}`;
  }

  // Fetch Dashboard Analytics & Fleet Data
  loadDashboardData();

  // Add New Bus Form Handler
  const addBusForm = document.getElementById('add-bus-form');
  if (addBusForm) {
    addBusForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const busPayload = {
        bus_name: document.getElementById('bus_name').value.trim(),
        bus_number: document.getElementById('bus_number').value.trim(),
        source: document.getElementById('source').value.trim(),
        destination: document.getElementById('destination').value.trim(),
        departure_time: document.getElementById('departure_time').value.trim(),
        arrival_time: document.getElementById('arrival_time').value.trim(),
        fare: parseFloat(document.getElementById('fare').value)
      };

      try {
        const response = await fetch(`${API_URL}/admin/add-bus`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(busPayload)
        });

        const result = await response.json();

        if (result.success) {
          alert('✅ Bus successfully added to the system!');
          addBusForm.reset();
          loadDashboardData(); // Refresh Tables and Counters
        } else {
          alert('❌ Bus add karne me issue aaya: ' + (result.error || result.message));
        }
      } catch (err) {
        console.error('Add Bus Error:', err);
        alert('Server connection error! Node.js backend check karein.');
      }
    });
  }
});

// Load Dashboard Analytics & Dynamic Tables
async function loadDashboardData() {
  const API_URL = 'http://127.0.0.1:5000/api';

  let bookingsList = [];
  let busesList = [];
  let totalRevenue = 0;
  let totalBookingsCount = 0;

  // 1. Fetch Stats & Bookings
  try {
    const statsRes = await fetch(`${API_URL}/admin/dashboard-stats`);
    if (statsRes.ok) {
      const statsData = await statsRes.json();
      if (statsData.success) {
        bookingsList = statsData.bookings || [];
        if (statsData.stats) {
          totalRevenue = statsData.stats.totalRevenue || 0;
          totalBookingsCount = statsData.stats.totalBookings || 0;
        }
      }
    }
  } catch (err) {
    console.warn('Backend stats API unavailable, falling back to LocalStorage...', err);
  }

  // LocalStorage Fallback for Bookings & Revenue calculation if API failed or returned 0
  if (!bookingsList || bookingsList.length === 0) {
    try {
      const localBookings = JSON.parse(localStorage.getItem('myBookings')) || [];
      bookingsList = localBookings;
    } catch (e) {
      bookingsList = [];
    }
  }

  // Calculate stats manually if empty or not received from backend
  totalBookingsCount = bookingsList.length;
  totalRevenue = bookingsList.reduce((sum, b) => {
    const status = (b.status || '').toUpperCase();
    if (status === 'CANCELLED' || status === 'CANCEL') return sum;
    const fare = Number(b.total_fare || b.totalAmount || b.fare || 0);
    return sum + (isNaN(fare) ? 0 : fare);
  }, 0);

  // Update Stats Cards Elements
  const revEl = document.getElementById('total-revenue');
  const bookEl = document.getElementById('total-bookings');
  const busEl = document.getElementById('total-buses');

  if (revEl) revEl.innerText = `₹${totalRevenue}`;
  if (bookEl) bookEl.innerText = totalBookingsCount;

  // Render Recent Bookings Table
  const bookingsTable = document.getElementById('bookings-table-body');
  if (bookingsTable) {
    bookingsTable.innerHTML = '';
    if (bookingsList && bookingsList.length > 0) {
      bookingsList.forEach(b => {
        const pnr = b.pnr || b.id || 'PNR';
        const passenger = b.passenger_name || b.passengerName || 'Passenger';
        const src = b.source || b.from || '-';
        const dest = b.destination || b.to || '-';
        let seat = b.seat_number || b.seat_no || b.seats || 'A1';
        if (Array.isArray(seat)) seat = seat.join(', ');
        const fare = b.total_fare || b.totalAmount || b.fare || 0;
        const date = b.created_at || b.travel_date || b.travelDate || b.date;

        bookingsTable.innerHTML += `
          <tr>
            <td>#${pnr}</td>
            <td>${passenger}</td>
            <td>${src} to ${dest}</td>
            <td>${seat}</td>
            <td>₹${fare}</td>
            <td>${date ? new Date(date).toLocaleDateString() : 'Today'}</td>
          </tr>
        `;
      });
    } else {
      bookingsTable.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#a9a9b3;">No passenger bookings yet.</td></tr>`;
    }
  }

  // 2. Fetch Active Buses List
  try {
    const busesRes = await fetch(`${API_URL}/buses`);
    if (busesRes.ok) {
      busesList = await busesRes.json();
    }
  } catch (err) {
    console.warn('Backend buses API unavailable, falling back to LocalStorage...', err);
  }

  // Fallback LocalStorage for Buses
  if (!Array.isArray(busesList) || busesList.length === 0) {
    try {
      busesList = JSON.parse(localStorage.getItem('availableBuses')) || [];
    } catch (e) {
      busesList = [];
    }
  }

  // Update Total Buses Count Card
  if (busEl) busEl.innerText = busesList.length;

  const busesTable = document.getElementById('buses-table-body');
  if (busesTable) {
    busesTable.innerHTML = '';
    if (Array.isArray(busesList) && busesList.length > 0) {
      busesList.forEach(bus => {
        busesTable.innerHTML += `
          <tr>
            <td>${bus.id || '-'}</td>
            <td><strong>${bus.bus_name || bus.name || 'Express Bus'}</strong></td>
            <td>${bus.bus_number || bus.number || 'N/A'}</td>
            <td>${bus.source || bus.from} ➔ ${bus.destination || bus.to}</td>
            <td>${bus.departure_time || 'N/A'} - ${bus.arrival_time || 'N/A'}</td>
            <td>₹${bus.fare || bus.price || 0}</td>
            <td>
              <button class="btn-delete" onclick="deleteBus(${bus.id})">
                <i class="fa-solid fa-trash"></i> Delete
              </button>
            </td>
          </tr>
        `;
      });
    } else {
      busesTable.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#a9a9b3;">No active buses in database. Add one above!</td></tr>`;
    }
  }
}

// Delete Bus Function
async function deleteBus(busId) {
  if (!confirm('Kya aap sachme is bus ko delete karna chahte hain?')) return;

  const API_URL = 'http://127.0.0.1:5000/api';
  try {
    const res = await fetch(`${API_URL}/admin/delete-bus/${busId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      alert('🗑️ Bus deleted successfully!');
      loadDashboardData();
    } else {
      alert('Delete error: ' + data.error);
    }
  } catch (err) {
    console.error('Delete error:', err);
  }
}

// Admin Logout Function
function logoutAdmin() {
  localStorage.removeItem('safarsathi_user');
  localStorage.removeItem('travelgo_user');
  window.location.href = 'auth.html';
}