document.addEventListener('DOMContentLoaded', () => {
  // 1. Unified booking data LocalStorage se read karein
  const rawBookingData = localStorage.getItem('travelgo_booking_data');
  const bookingData = rawBookingData ? JSON.parse(rawBookingData) : null;

  // Fallback support agar purani key maujood ho
  const savedSeats = (bookingData && bookingData.seats && bookingData.seats.length > 0)
    ? bookingData.seats
    : (JSON.parse(localStorage.getItem('selectedSeats')) || ['S1']);

  const totalAmount = (bookingData && bookingData.totalAmount)
    ? bookingData.totalAmount
    : 750;

  const displayFareText = `₹${totalAmount}`;

  // 2. Summary display updates
  const displaySeats = document.getElementById('displaySeats');
  const displayFare = document.getElementById('displayFare');

  if (displaySeats) displaySeats.textContent = savedSeats.join(', ');
  if (displayFare) displayFare.textContent = displayFareText;

  // 3. Dynamic Passenger Cards Render
  const cardsContainer = document.getElementById('passengerCardsContainer');

  if (cardsContainer && savedSeats.length > 0) {
    cardsContainer.innerHTML = savedSeats.map((seat, index) => `
      <div class="passenger-card">
        <div class="passenger-title">Passenger ${index + 1} (Seat ${seat})</div>
        <div class="form-grid">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" class="glass-input" name="name_${seat}" placeholder="Enter full name" required>
          </div>
          <div class="form-group sm">
            <label>Age</label>
            <input type="number" class="glass-input" name="age_${seat}" placeholder="Age" min="1" max="100" required>
          </div>
          <div class="form-group">
            <label>Gender</label>
            <div class="gender-selector">
              <label class="gender-pill">
                <input type="radio" name="gender_${seat}" value="Male" checked>
                <span>Male</span>
              </label>
              <label class="gender-pill">
                <input type="radio" name="gender_${seat}" value="Female">
                <span>Female</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // 4. Form Submission Handler -> Payment Page Link
  const form = document.getElementById('passengerForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Collect passenger details
      const passengerData = savedSeats.map(seat => ({
        seat: seat,
        name: form[`name_${seat}`] ? form[`name_${seat}`].value : '',
        age: form[`age_${seat}`] ? form[`age_${seat}`].value : '',
        gender: form[`gender_${seat}`] ? form[`gender_${seat}`].value : 'Male'
      }));

      const emailElem = document.getElementById('contactEmail');
      const phoneElem = document.getElementById('contactPhone');

      const contactData = {
        email: emailElem ? emailElem.value : '',
        phone: phoneElem ? phoneElem.value : ''
      };

      // Calculate Fare components dynamically
      const baseFare = Math.round(totalAmount * 0.95);
      const taxFare = totalAmount - baseFare;

      // Single synchronized payload updated for Payment Page
      const updatedBookingData = {
        ...(bookingData || {}),
        seats: savedSeats,
        seatCount: savedSeats.length,
        baseFare: baseFare,
        taxFare: taxFare,
        totalAmount: totalAmount,
        passengers: passengerData,
        contact: contactData
      };

      localStorage.setItem('travelgo_booking_data', JSON.stringify(updatedBookingData));
      localStorage.setItem('passengerDetails', JSON.stringify(passengerData));
      localStorage.setItem('contactDetails', JSON.stringify(contactData));
      localStorage.setItem('booking_total_fare', totalAmount);

      // Clean redirect to Payment Page
      window.location.href = 'payment.html';
    });
  }
});