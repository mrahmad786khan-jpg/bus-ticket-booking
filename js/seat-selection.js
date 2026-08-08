document.addEventListener('DOMContentLoaded', async () => {
  const TOTAL_SEATS = 24;
  const BOOKED_SEATS = [2, 5, 11, 14, 18];

  // DOM Elements
  const busGrid = document.getElementById('busGrid');
  const selectedSeatsText = document.getElementById('selectedSeatsText');
  const seatCountText = document.getElementById('seatCountText');
  const totalPriceText = document.getElementById('totalPriceText');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const routeText = document.getElementById('routeText');
  const busNameText = document.getElementById('busNameText');

  // URL Query Params Read
  const urlParams = new URLSearchParams(window.location.search);
  const busId = urlParams.get('busId');
  const fromLoc = urlParams.get('from') || 'Mumbai';
  const toLoc = urlParams.get('to') || 'Goa';

  if (routeText) routeText.textContent = `${fromLoc} ➔ ${toLoc}`;

  let SEAT_PRICE = 850;
  let currentBusName = 'Express Bus';
  let selectedSeats = [];

  // 1. Database API se Selected Bus Fetch Karein
  try {
    const response = await fetch('http://localhost:5000/api/buses');
    const buses = await response.json();
    
    // Exact bus ID se match karein
    const selectedBusObj = buses.find(b => String(b.id) === String(busId));

    if (selectedBusObj) {
      SEAT_PRICE = Number(selectedBusObj.fare) || 850;
      currentBusName = selectedBusObj.bus_name || 'Express Bus';
      if (selectedBusObj.bus_number) {
        currentBusName += ` (${selectedBusObj.bus_number})`;
      }
    }

    if (busNameText) {
      busNameText.textContent = `${currentBusName} (₹${SEAT_PRICE}/seat)`;
    }

  } catch (error) {
    console.error("Backend se bus details lane me error:", error);
    if (busNameText) busNameText.textContent = `Express Bus (₹${SEAT_PRICE}/seat)`;
  }

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
    const baseTotal = count * SEAT_PRICE;

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

      const updatedData = {
        busId: busId,
        busName: currentBusName,
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