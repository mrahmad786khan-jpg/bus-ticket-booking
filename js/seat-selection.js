document.addEventListener('DOMContentLoaded', () => {
  const TOTAL_SEATS = 24;
  const BOOKED_SEATS = [2, 5, 11, 14, 18];

  // 1. Selected Bus Price Get Function
  function getSelectedBusPrice() {
    // 1st Priority: selectedBus Object
    try {
      const selectedBus = JSON.parse(localStorage.getItem('selectedBus'));
      if (selectedBus && selectedBus.price) {
        return Number(selectedBus.price);
      }
    } catch (e) {
      console.error('Error reading selectedBus from localStorage', e);
    }

    // 2nd Priority: bus_single_price string
    const singlePrice = localStorage.getItem('bus_single_price');
    if (singlePrice && !isNaN(singlePrice)) {
      return Number(singlePrice);
    }

    // Fallback Price
    return 850;
  }

  const SEAT_PRICE = getSelectedBusPrice();
  let selectedSeats = [];

  // DOM Elements
  const busGrid = document.getElementById('busGrid');
  const selectedSeatsText = document.getElementById('selectedSeatsText');
  const seatCountText = document.getElementById('seatCountText');
  const totalPriceText = document.getElementById('totalPriceText');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const routeText = document.getElementById('routeText');
  const busNameText = document.getElementById('busNameText');

  // URL Query Params
  const urlParams = new URLSearchParams(window.location.search);
  const fromLoc = urlParams.get('from') || 'Mumbai';
  const toLoc = urlParams.get('to') || 'Goa';

  if (routeText) routeText.textContent = `${fromLoc} ➔ ${toLoc}`;

  // Read saved bus name for display
  try {
    const busObj = JSON.parse(localStorage.getItem('selectedBus'));
    if (busObj && busObj.name && busNameText) {
      busNameText.textContent = `${busObj.name} (₹${SEAT_PRICE}/seat)`;
    }
  } catch (e) {}

  // 2. Render Bus Layout
  function renderSeats() {
    if (!busGrid) return;
    busGrid.innerHTML = '';

    for (let i = 1; i <= TOTAL_SEATS; i++) {
      const seat = document.createElement('div');
      seat.classList.add('seat');
      seat.textContent = `S${i}`;
      seat.dataset.seatNumber = `S${i}`;

      if (BOOKED_SEATS.includes(i)) {
        seat.classList.add('booked');
      } else {
        seat.classList.add('available');
        seat.addEventListener('click', () => toggleSeatSelection(seat, `S${i}`));
      }

      busGrid.appendChild(seat);

      // Aisle space for 2+2 layout
      if (i % 2 === 0 && i % 4 !== 0) {
        const aisle = document.createElement('div');
        aisle.classList.add('aisle-space');
        busGrid.appendChild(aisle);
      }
    }
  }

  // 3. Toggle Seat Selection
  function toggleSeatSelection(seatElement, seatNum) {
    if (selectedSeats.includes(seatNum)) {
      selectedSeats = selectedSeats.filter(s => s !== seatNum);
      seatElement.classList.remove('selected');
      seatElement.classList.add('available');
    } else {
      selectedSeats.push(seatNum);
      seatElement.classList.remove('available');
      seatElement.classList.add('selected');
    }
    updateSummary();
  }

  // 4. Update Price Summary
  function updateSummary() {
    const count = selectedSeats.length;
    const baseTotal = count * SEAT_PRICE; // Dynamic multiplier (850 or 1200)

    if (seatCountText) seatCountText.textContent = count;
    if (totalPriceText) totalPriceText.textContent = `₹${baseTotal}`;

    if (count > 0) {
      if (selectedSeatsText) selectedSeatsText.textContent = selectedSeats.join(', ');
      if (checkoutBtn) checkoutBtn.disabled = false;
    } else {
      if (selectedSeatsText) selectedSeatsText.textContent = 'None';
      if (checkoutBtn) checkoutBtn.disabled = true;
    }
  }

  // 5. Checkout Click Handler
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      const count = selectedSeats.length;
      if (count === 0) return;

      const pureBaseFare = count * SEAT_PRICE;
      const taxFare = Math.round(pureBaseFare * 0.05); // 5% GST
      const finalTotal = pureBaseFare + taxFare;

      const existingData = JSON.parse(localStorage.getItem('travelgo_booking_data')) || {};

      const updatedData = {
        ...existingData,
        seats: selectedSeats,
        seatCount: count,
        baseSeatPrice: SEAT_PRICE,
        baseFare: pureBaseFare,
        taxFare: taxFare,
        totalAmount: finalTotal,
        from: fromLoc,
        to: toLoc
      };

      localStorage.setItem('travelgo_booking_data', JSON.stringify(updatedData));
      localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));

      // Proceed to Passenger details page
      window.location.href = './passenger.html';
    });
  }

  // Initial Execution
  renderSeats();
  updateSummary();
});