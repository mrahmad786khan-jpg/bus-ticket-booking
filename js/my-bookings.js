document.addEventListener('DOMContentLoaded', async () => {
  const bookingsContainer = document.getElementById('bookingsContainer') || document.getElementById('bookingsList');

  // Multi-key User Check (Fits auth.js keys)
  const currentUser = JSON.parse(
    localStorage.getItem('safarsathi_user') || 
    localStorage.getItem('travelgo_user') || 
    localStorage.getItem('user') || 
    localStorage.getItem('currentUser') || 
    'null'
  );

  // Date Formatting Helper
  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // Render Empty State
  function renderEmptyState(message = 'Koi Booked Tickets Nahi Mili!') {
    if (!bookingsContainer) return;
    bookingsContainer.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #666;">
        <h3>${message}</h3>
        ${!currentUser ? 
          '<p>Apni booked tickets dekhne ke liye login karein.</p><a href="auth.html" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background: #007bff; color: white; border-radius: 5px; text-decoration: none;">Login Now</a>' : 
          '<p>Aapne abhi tak koi ticket book nahi ki hai.</p><a href="index.html" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background: #007bff; color: white; border-radius: 5px; text-decoration: none;">Book Ticket Now</a>'
        }
      </div>
    `;
  }

  // If user is LOGGED OUT
  if (!currentUser) {
    renderEmptyState('Aap Logged Out Hain!');
    return;
  }

  // Fetch Bookings for LOGGED IN User
  async function fetchUserBookings() {
    let allBookings = [];

    try {
      const userEmail = currentUser.email;
      const res = await fetch(`http://localhost:5000/api/my-bookings?email=${encodeURIComponent(userEmail)}`);
      if (res.ok) {
        allBookings = await res.json();
      }
    } catch (error) {
      console.warn("Backend API unavailable, checking LocalStorage...", error);
    }

    // Fallback LocalStorage (User-Specific Filter)
    if (!Array.isArray(allBookings) || allBookings.length === 0) {
      try {
        const localBookings = JSON.parse(localStorage.getItem('myBookings')) || [];
        allBookings = localBookings.filter(b => 
          (b.passengerEmail && b.passengerEmail === currentUser.email) ||
          (b.passenger_email && b.passenger_email === currentUser.email)
        );
      } catch (e) {
        allBookings = [];
      }
    }

    renderBookings(allBookings);
  }

  function renderBookings(bookings) {
    if (!bookingsContainer) return;

    if (!bookings || bookings.length === 0) {
      renderEmptyState();
      return;
    }

    bookingsContainer.innerHTML = '';

    bookings.forEach(booking => {
      const pnr = booking.pnr || booking.id || 'N/A';
      const passengerName = booking.passenger_name || booking.passengerName || 'Passenger';
      const source = booking.source || booking.from || 'Source';
      const destination = booking.destination || booking.to || 'Destination';
      const busName = booking.bus_name || booking.busName || 'Express Bus';
      const travelDate = formatDate(booking.travel_date || booking.travelDate || booking.date);
      
      let seatNo = booking.seat_no || booking.seat_numbers || booking.seats;
      if (Array.isArray(seatNo)) seatNo = seatNo.join(', ');

      const totalFare = booking.total_fare || booking.totalAmount || booking.fare || 0;
      const status = booking.status || 'Confirmed';

      const bookingCard = document.createElement('div');
      bookingCard.className = 'booking-card';
      bookingCard.style.cssText = `
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
        background: #fff;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      `;

      bookingCard.innerHTML = `
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
          <div>
            <strong style="font-size: 1.1em; color: #333;">PNR: ${pnr}</strong>
            <span style="margin-left: 10px; background: #e8f5e9; color: #2e7d32; padding: 3px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold;">${status}</span>
          </div>
          <div style="color: #666; font-size: 0.9em;">
            Travel Date: <strong>${travelDate}</strong>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <div>
            <h4 style="margin: 0; color: #007bff;">${source} ➔ ${destination}</h4>
            <p style="margin: 5px 0 0; color: #555; font-size: 0.9em;">Bus: ${busName}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 0.9em; color: #666;">Total Fare</p>
            <h3 style="margin: 0; color: #28a745;">₹${totalFare}</h3>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 0.9em; color: #444;">
          <strong>Passenger:</strong> ${passengerName} | <strong>Seats:</strong> ${seatNo}
        </div>
      `;

      bookingsContainer.appendChild(bookingCard);
    });
  }

  fetchUserBookings();
});