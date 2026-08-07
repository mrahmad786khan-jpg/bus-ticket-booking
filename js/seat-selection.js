document.addEventListener('DOMContentLoaded', () => {
  const TOTAL_SEATS = 24;
  const BOOKED_SEATS = [2, 5, 11, 14, 18]; // Already booked seat numbers

  // 1. DYNAMIC PRICE FIX: Search result page se selected bus ki exact price fetch karein
  const selectedBus = JSON.parse(localStorage.getItem('selectedBus'));
  const bookingData = JSON.parse(localStorage.getItem('travelgo_booking_data'));
  
  // Default to bus price, otherwise fallback to 1200
  const SEAT_PRICE = (selectedBus && selectedBus.price) 
    ? selectedBus.price 
    : ((bookingData && bookingData.baseSeatPrice) ? bookingData.baseSeatPrice : 1200);

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
    if (!busGrid) return;
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

      // Har 2 seats ke baad middle aisle gap insert karna
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

  // Update Summary Card Data using dynamic SEAT_PRICE
  function updateSummary() {
    const count = selectedSeats.length;
    const totalFare = count * SEAT_PRICE;

    if (seatCountText) seatCountText.textContent = count;
    if (totalPriceText) totalPriceText.textContent = `₹${totalFare}`;

    if (count > 0) {
      if (selectedSeatsText) selectedSeatsText.textContent = selectedSeats.join(', ');
      if (checkoutBtn) checkoutBtn.disabled = false;
    } else {
      if (selectedSeatsText) selectedSeatsText.textContent = 'None';
      if (checkoutBtn) checkoutBtn.disabled = true;
    }
  }

  // Proceed to Checkout
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      try {
        const count = selectedSeats.length;
        const totalFare = count > 0 ? count * SEAT_PRICE : SEAT_PRICE;

        const baseFare = Math.round(totalFare * 0.95);
        const taxFare = totalFare - baseFare;

        const updatedBookingData = {
          ...(bookingData || {}),
          seats: selectedSeats,
          seatCount: count,
          baseSeatPrice: SEAT_PRICE,
          baseFare: baseFare,
          taxFare: taxFare,
          totalAmount: totalFare,
          from: fromLoc,
          to: toLoc
        };

        localStorage.setItem('travelgo_booking_data', JSON.stringify(updatedBookingData));
        localStorage.setItem('booking_total_fare', totalFare);
        
        window.location.href = 'passenger.html';
      } catch (err) {
        console.error("Error saving booking data:", err);
        window.location.href = 'passenger.html';
      }
    });
  }

  renderSeats();
});