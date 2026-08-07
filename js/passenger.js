document.addEventListener('DOMContentLoaded', () => {
  // 1. Seats page se saved data read karein (LocalStorage)
  const savedSeats = JSON.parse(localStorage.getItem('selectedSeats')) || ['A1', 'A2'];
  const savedFare = localStorage.getItem('totalFare') || '₹1,800';

  // 2. Summary display updates
  const displaySeats = document.getElementById('displaySeats');
  const displayFare = document.getElementById('displayFare');

  if (displaySeats) displaySeats.textContent = savedSeats.join(', ');
  if (displayFare) displayFare.textContent = savedFare;

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
        name: form[`name_${seat}`].value,
        age: form[`age_${seat}`].value,
        gender: form[`gender_${seat}`].value
      }));

      const contactData = {
        email: document.getElementById('contactEmail').value,
        phone: document.getElementById('contactPhone').value
      };

      // Store data for payment/ticket generation
      localStorage.setItem('passengerDetails', JSON.stringify(passengerData));
      localStorage.setItem('contactDetails', JSON.stringify(contactData));
      // Example: Aapka final selected total fare variable
const totalFare = 1250; // Yahan aapka dynamic total price variable aayega

// Payment page par bhejne se pehle price localStorage me save karein
localStorage.setItem('booking_total_fare', totalFare);

// Phir payment page par redirect karein
window.location.href = 'payment.html';

      // Redirect to Payment Page (e.g., payment.html)
      window.location.href = 'payment.html';
    });
  }
});