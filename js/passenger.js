document.addEventListener('DOMContentLoaded', () => {
  const rawBookingData = localStorage.getItem('travelgo_booking_data');
  const bookingData = rawBookingData ? JSON.parse(rawBookingData) : null;

  // Logged-in user session se default contact detail autofill karne ke liye
  const loggedInUser = JSON.parse(
    localStorage.getItem('safarsathi_user') || 
    localStorage.getItem('travelgo_user') || 
    '{}'
  );

  const savedSeats = (bookingData && bookingData.seats && bookingData.seats.length > 0)
    ? bookingData.seats
    : (JSON.parse(localStorage.getItem('selectedSeats')) || ['S1']);

  const baseFare = bookingData ? (bookingData.baseFare || (savedSeats.length * 850)) : (savedSeats.length * 850);
  const taxFare = bookingData ? (bookingData.taxFare || Math.round(baseFare * 0.05)) : Math.round(baseFare * 0.05);
  const totalAmount = baseFare + taxFare;

  const displaySeats = document.getElementById('displaySeats');
  const displayFare = document.getElementById('displayFare');

  if (displaySeats) displaySeats.textContent = savedSeats.join(', ');
  if (displayFare) displayFare.textContent = `₹${totalAmount}`;

  // Contact Inputs Autofill
  const emailElem = document.getElementById('contactEmail');
  const phoneElem = document.getElementById('contactPhone');

  if (emailElem && loggedInUser.email) emailElem.value = loggedInUser.email;
  if (phoneElem && loggedInUser.phone) phoneElem.value = loggedInUser.phone;

  // Passenger Cards Render
  const cardsContainer = document.getElementById('passengerCardsContainer');
  if (cardsContainer && savedSeats.length > 0) {
    cardsContainer.innerHTML = savedSeats.map((seat, index) => `
      <div class="passenger-card" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 15px;">
        <div class="passenger-title" style="color: #38bdf8; font-weight: bold; margin-bottom: 15px;">Passenger ${index + 1} (Seat ${seat})</div>
        <div class="form-grid" style="display: flex; gap: 15px; flex-wrap: wrap;">
          <div class="form-group" style="flex: 2; min-width: 200px;">
            <label style="display: block; color: #94a3b8; font-size: 0.85rem; margin-bottom: 5px;">Full Name</label>
            <input type="text" class="glass-input" name="name_${seat}" placeholder="Enter full name" value="${index === 0 && loggedInUser.name ? loggedInUser.name : ''}" required style="width: 100%; padding: 10px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 6px;">
          </div>
          <div class="form-group sm" style="flex: 1; min-width: 80px;">
            <label style="display: block; color: #94a3b8; font-size: 0.85rem; margin-bottom: 5px;">Age</label>
            <input type="number" class="glass-input" name="age_${seat}" placeholder="Age" min="1" max="100" required style="width: 100%; padding: 10px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 6px;">
          </div>
          <div class="form-group" style="flex: 1; min-width: 150px;">
            <label style="display: block; color: #94a3b8; font-size: 0.85rem; margin-bottom: 5px;">Gender</label>
            <div class="gender-selector" style="display: flex; gap: 10px; margin-top: 5px;">
              <label class="gender-pill" style="color: #fff; cursor: pointer;">
                <input type="radio" name="gender_${seat}" value="Male" checked>
                <span>Male</span>
              </label>
              <label class="gender-pill" style="color: #fff; cursor: pointer;">
                <input type="radio" name="gender_${seat}" value="Female">
                <span>Female</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Form Submit Handler
  const form = document.getElementById('passengerForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const passengerData = savedSeats.map(seat => ({
        seat: seat,
        name: form[`name_${seat}`] ? form[`name_${seat}`].value : `Passenger`,
        age: form[`age_${seat}`] ? form[`age_${seat}`].value : '25',
        gender: form[`gender_${seat}`] ? form[`gender_${seat}`].value : 'Male'
      }));

      const updatedBookingData = {
        ...(bookingData || {}),
        seats: savedSeats,
        seatCount: savedSeats.length,
        baseFare: baseFare,
        taxFare: taxFare,
        totalAmount: totalAmount,
        passengers: passengerData,
        contact: {
          email: emailElem ? emailElem.value : (loggedInUser.email || ''),
          phone: phoneElem ? phoneElem.value : (loggedInUser.phone || '')
        }
      };

      localStorage.setItem('travelgo_booking_data', JSON.stringify(updatedBookingData));
      localStorage.setItem('passengerDetails', JSON.stringify(passengerData));

      // Redirect to Payment page
      window.location.href = 'payment.html';
    });
  }
});