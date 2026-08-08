document.addEventListener('DOMContentLoaded', async () => {
  const bookingsListContainer = document.getElementById('bookingsList');

  // 1. Check if User is Logged In via LocalStorage Session
  const loggedInUser = JSON.parse(
    localStorage.getItem('safarsathi_user') || 
    localStorage.getItem('travelgo_user')
  );

  if (!loggedInUser || (!loggedInUser.id && !loggedInUser.email)) {
    if (bookingsListContainer) {
      bookingsListContainer.innerHTML = `
        <div class="no-bookings" style="text-align: center; padding: 40px; color: #94a3b8;">
          <p style="font-size: 1.1rem; margin-bottom: 15px;">Please log in to view your bookings.</p>
          <a href="auth.html?redirect=my-bookings.html" class="btn-book-now" style="background: #38bdf8; color: #0f172a; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Log In / Sign Up</a>
        </div>
      `;
    }
    return;
  }

  let userBookings = [];

  // 2. Fetch User Specific Bookings directly from Backend Database API
  try {
    const userId = loggedInUser.id || '';
    const userEmail = loggedInUser.email || '';
    
    // API endpoint call (User ID ya Email parameters pass karke)
    const response = await fetch(`http://localhost:5000/api/my-bookings?userId=${userId}&email=${encodeURIComponent(userEmail)}`);
    
    if (response.ok) {
      const dbBookings = await response.json();
      
      // Database response mapping
      userBookings = dbBookings.map(item => ({
        pnr: item.pnr || `TG-${item.id || '1001'}`,
        status: item.status || 'Confirmed',
        from: item.source || item.from_location || 'N/A',
        to: item.destination || item.to_location || 'N/A',
        seats: item.seat_numbers ? item.seat_numbers.split(',') : (item.seats || []),
        passengersCount: item.passenger_count || 1,
        bookingDate: item.booking_date || item.created_at || 'Upcoming',
        totalFare: item.total_fare || item.fare || 0
      }));
    } else {
      throw new Error("Failed to load from DB API");
    }
  } catch (error) {
    console.warn("Backend API not reachable for my-bookings, reading fallback LocalStorage:", error);
    
    // Fallback: LocalStorage compatibility
    const allBookings = JSON.parse(localStorage.getItem('myBookings')) || [];
    userBookings = allBookings.filter(item => {
      const uEmail = loggedInUser.email ? loggedInUser.email.toLowerCase() : '';
      const itemEmail = item.userEmail ? item.userEmail.toLowerCase() : '';
      return uEmail && itemEmail && (itemEmail === uEmail);
    });
  }

  // 3. Render Empty State if No Bookings Found
  if (!userBookings || userBookings.length === 0) {
    if (bookingsListContainer) {
      bookingsListContainer.innerHTML = `
        <div class="no-bookings" style="text-align: center; padding: 40px; color: #94a3b8;">
          <p style="font-size: 1.1rem; margin-bottom: 15px;">Hello ${loggedInUser.name || 'User'}, you have no active bookings yet.</p>
          <a href="index.html" class="btn-book-now" style="background: #38bdf8; color: #0f172a; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Search & Book Now</a>
        </div>
      `;
    }
    return;
  }

  // 4. Render User Tickets
  if (bookingsListContainer) {
    bookingsListContainer.innerHTML = userBookings.map(item => `
      <div class="booking-ticket" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 15px;">
        <div class="ticket-header" style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <span class="pnr-tag" style="color: #38bdf8; font-weight: bold;">PNR: ${item.pnr}</span>
          <span class="status-badge" style="background: rgba(52, 211, 153, 0.2); color: #34d399; padding: 4px 8px; border-radius: 6px; font-size: 0.85rem;">${item.status}</span>
        </div>
        <div class="ticket-details" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px;">
          <div class="detail-item">
            <span style="display: block; color: #64748b; font-size: 0.8rem;">Route</span>
            <strong style="color: #fff;">${item.from} ➔ ${item.to}</strong>
          </div>
          <div class="detail-item">
            <span style="display: block; color: #64748b; font-size: 0.8rem;">Seats</span>
            <strong style="color: #fff;">${Array.isArray(item.seats) ? item.seats.join(', ') : (item.seats || 'N/A')}</strong>
          </div>
          <div class="detail-item">
            <span style="display: block; color: #64748b; font-size: 0.8rem;">Passengers</span>
            <strong style="color: #fff;">${item.passengersCount}</strong>
          </div>
          <div class="detail-item">
            <span style="display: block; color: #64748b; font-size: 0.8rem;">Date</span>
            <strong style="color: #fff;">${item.bookingDate}</strong>
          </div>
          <div class="detail-item">
            <span style="display: block; color: #64748b; font-size: 0.8rem;">Total Fare</span>
            <strong style="color: #34D399;">₹${item.totalFare}</strong>
          </div>
        </div>
      </div>
    `).join('');
  }
});