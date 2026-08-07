document.addEventListener('DOMContentLoaded', () => {
  const bookingsListContainer = document.getElementById('bookingsList');
  const bookings = JSON.parse(localStorage.getItem('myBookings')) || [];

  if (bookings.length === 0) {
    bookingsListContainer.innerHTML = `
      <div class="no-bookings">
        <p>You have no active bookings yet.</p>
        <a href="index.html" class="btn-book-now">Search & Book Now</a>
      </div>
    `;
    return;
  }

  bookingsListContainer.innerHTML = bookings.map(item => `
    <div class="booking-ticket">
      <div class="ticket-header">
        <span class="pnr-tag">${item.pnr}</span>
        <span class="status-badge">${item.status}</span>
      </div>
      <div class="ticket-details">
        <div class="detail-item">
          <span>Seats</span>
          <strong>${item.seats}</strong>
        </div>
        <div class="detail-item">
          <span>Passengers</span>
          <strong>${item.passengersCount}</strong>
        </div>
        <div class="detail-item">
          <span>Date</span>
          <strong>${item.bookingDate}</strong>
        </div>
        <div class="detail-item">
          <span>Total Fare</span>
          <strong style="color: #34D399;">${item.totalFare}</strong>
        </div>
      </div>
    </div>
  `).join('');
});