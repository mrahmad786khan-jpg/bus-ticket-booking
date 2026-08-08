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

  try {
    // 1. Fetch Stats & Bookings
    const statsRes = await fetch(`${API_URL}/admin/dashboard-stats`);
    const statsData = await statsRes.json();

    if (statsData.success) {
      document.getElementById('total-revenue').innerText = `₹${statsData.stats.totalRevenue || 0}`;
      document.getElementById('total-bookings').innerText = statsData.stats.totalBookings || 0;
      document.getElementById('total-buses').innerText = statsData.stats.totalBuses || 0;

      // Render Recent Bookings Table
      const bookingsTable = document.getElementById('bookings-table-body');
      if (bookingsTable) {
        bookingsTable.innerHTML = '';
        if (statsData.bookings && statsData.bookings.length > 0) {
          statsData.bookings.forEach(b => {
            bookingsTable.innerHTML += `
              <tr>
                <td>#${b.id || 'PNR'}</td>
                <td>${b.passenger_name || 'Passenger'}</td>
                <td>${b.source || '-'} to ${b.destination || '-'}</td>
                <td>${b.seat_number || 'A1'}</td>
                <td>₹${b.total_fare || 0}</td>
                <td>${b.created_at ? new Date(b.created_at).toLocaleDateString() : 'Today'}</td>
              </tr>
            `;
          });
        } else {
          bookingsTable.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#a9a9b3;">No passenger bookings yet.</td></tr>`;
        }
      }
    }

    // 2. Fetch Active Buses List
    const busesRes = await fetch(`${API_URL}/buses`);
    const busesList = await busesRes.json();

    const busesTable = document.getElementById('buses-table-body');
    if (busesTable) {
      busesTable.innerHTML = '';
      if (Array.isArray(busesList) && busesList.length > 0) {
        busesList.forEach(bus => {
          busesTable.innerHTML += `
            <tr>
              <td>${bus.id}</td>
              <td><strong>${bus.bus_name}</strong></td>
              <td>${bus.bus_number}</td>
              <td>${bus.source} ➔ ${bus.destination}</td>
              <td>${bus.departure_time} - ${bus.arrival_time}</td>
              <td>₹${bus.fare}</td>
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

  } catch (err) {
    console.error('Error fetching dashboard data:', err);
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