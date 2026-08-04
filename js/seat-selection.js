document.addEventListener('DOMContentLoaded', () => {
  const TOTAL_SEATS = 24;
  const SEAT_PRICE = 750; // Per seat fare
  const BOOKED_SEATS = [2, 5, 11, 14, 18]; // Already booked seat numbers

  let selectedSeats = [];

  const busGrid = document.getElementById('busGrid');
  const selectedSeatsText = document.getElementById('selectedSeatsText');
  const seatCountText = document.getElementById('seatCountText');
  const totalPriceText = document.getElementById('totalPriceText');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const routeText = document.getElementById('routeText');

  // URL Parameters se route load karna
  const urlParams = new URLSearchParams(window.location.search);
  const fromLoc = urlParams.get('from') || 'Mumbai';
  const toLoc = urlParams.get('to') || 'Goa';
  if (routeText) {
    routeText.textContent = `${fromLoc} ➔ ${toLoc}`;
  }

  // Render 2x2 Bus Grid
  function renderSeats() {
    busGrid.innerHTML = '';

    for (let i = 1; i <= TOTAL_SEATS; i++) {
      const seat = document.createElement('div');
      seat.classList.add('seat');
      seat.textContent = `S${i}`;
      seat.dataset.seatNumber = `S${i}`;

      // Check status
      if (BOOKED_SEATS.includes(i)) {
        seat.classList.add('booked');
      } else {
        seat.classList.add('available');
        seat.addEventListener('click', () => toggleSeatSelection(seat, `S${i}`));
      }

      busGrid.appendChild(seat);

      // Har 2 seats ke baad middle aisle (rasta) gap insert karna
      if (i % 2 === 0 && i % 4 !== 0) {
        const aisle = document.createElement('div');
        aisle.classList.add('aisle-space');
        busGrid.appendChild(aisle);
      }
    }
  }

  // Seat Select / Deselect Handler
  function toggleSeatSelection(seatElement, seatNum) {
    if (selectedSeats.includes(seatNum)) {
      // Remove seat
      selectedSeats = selectedSeats.filter(s => s !== seatNum);
      seatElement.classList.remove('selected');
      seatElement.classList.add('available');
    } else {
      // Add seat
      selectedSeats.push(seatNum);
      seatElement.classList.remove('available');
      seatElement.classList.add('selected');
    }

    updateSummary();
  }

  // Update Summary Card Data
  function updateSummary() {
    const count = selectedSeats.length;
    const totalFare = count * SEAT_PRICE;

    seatCountText.textContent = count;
    totalPriceText.textContent = `₹${totalFare}`;

    if (count > 0) {
      selectedSeatsText.textContent = selectedSeats.join(', ');
      checkoutBtn.disabled = false;
    } else {
      selectedSeatsText.textContent = 'None';
      checkoutBtn.disabled = true;
    }
  }

  // Proceed to Checkout
checkoutBtn.addEventListener('click', () => {
  try {
    // 1. Check karein ki selectedSeats exists karti hai
    if (typeof selectedSeats !== 'undefined' && selectedSeats.length > 0) {
      localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
    }

    // 2. Safely total price save karein (bina code crash kiye)
    const priceElement = document.getElementById('totalPrice') || document.getElementById('totalFareAmount');
    if (priceElement) {
      localStorage.setItem('totalFare', priceElement.textContent);
    }

    // 3. Passenger page par redirect karein
    window.location.href = 'passenger.html';
  } catch (error) {
    console.error("Redirect Error:", error);
    // Fallback redirect agar koi minor issue aaye tab bhi page open ho jaye
    window.location.href = 'passenger.html';
  }
});
  

  renderSeats();
});