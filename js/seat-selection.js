document.addEventListener('DOMContentLoaded', async () => {
  const TOTAL_SEATS = 24;

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
  
  // Safe & Strict Date Normalizer (Extracts YYYY-MM-DD cleanly)
  function parseStandardDate(dateStr) {
    if (!dateStr) return '';
    const str = String(dateStr).trim();
    
    const ymdMatch = str.match(/^(\d{4}-\d{2}-\d{2})/);
    if (ymdMatch) return ymdMatch[1];

    const d = new Date(str);
    if (isNaN(d.getTime())) return str;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Extract travel date from URL
  let rawDate = urlParams.get('date') || urlParams.get('travelDate');
  let travelDate = parseStandardDate(rawDate);

  if (!travelDate) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    travelDate = `${year}-${month}-${day}`;
  }

  // Clear stale selection if user opened a different date/bus
  try {
    const prevData = JSON.parse(localStorage.getItem('travelgo_booking_data') || '{}');
    if (prevData.travelDate && (prevData.travelDate !== travelDate || String(prevData.busId) !== String(busId))) {
      localStorage.removeItem('selectedSeats');
      localStorage.removeItem('travelgo_booking_data');
    }
  } catch (e) {}

  if (routeText) routeText.textContent = `${fromLoc} ➔ ${toLoc} (${travelDate})`;

  let SEAT_PRICE = 850;
  let currentBusName = 'Express Bus';
  let selectedSeats = [];

  // Helper function to extract integer seat numbers (e.g., "S1" -> 1)
  function extractSeatNumber(seatStr) {
    if (seatStr === null || seatStr === undefined) return null;
    const num = parseInt(String(seatStr).replace(/\D/g, ''), 10);
    return isNaN(num) ? null : num;
  }

  // Fetch Occupied Seats Function
  async function fetchOccupiedSeats() {
    const occupiedSeatNumbers = new Set();

    // 1. Try dedicated API endpoint first
    if (busId && travelDate) {
      try {
        const res = await fetch(`http://localhost:5000/api/booked-seats?busId=${busId}&date=${travelDate}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            data.forEach(s => {
              const seatNum = extractSeatNumber(s);
              if (seatNum !== null) occupiedSeatNumbers.add(seatNum);
            });
            // Primary API success - return strictly fetched seats
            return Array.from(occupiedSeatNumbers);
          }
        }
      } catch (apiErr) {
        console.warn("API /api/booked-seats check failed, trying fallback checks...");
      }
    }

    // 2. Fetch all bookings from Backend Database API
    try {
      const res = await fetch(`http://localhost:5000/api/my-bookings`);
      if (res.ok) {
        const allDbBookings = await res.json();
        if (Array.isArray(allDbBookings)) {
          allDbBookings.forEach(item => {
            const itemBusId = item.bus_id || item.busId || item.bus;
            // Strict match for Bus ID and Travel Date
            const matchBus = busId ? String(itemBusId) === String(busId) : true;

            const rawItemDate = item.travel_date || item.travelDate || item.date || item.journey_date;
            const itemDate = parseStandardDate(rawItemDate);
            const matchDate = (itemDate === travelDate);

            if (matchBus && matchDate && item.status !== 'Cancelled') {
              let rawSeats = [];
              if (typeof item.seat_numbers === 'string') {
                rawSeats = item.seat_numbers.split(',');
              } else if (Array.isArray(item.seats)) {
                rawSeats = item.seats;
              } else if (item.seats) {
                rawSeats = String(item.seats).split(',');
              }

              rawSeats.forEach(s => {
                const seatNum = extractSeatNumber(s);
                if (seatNum !== null) occupiedSeatNumbers.add(seatNum);
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn("My-bookings API check failed, falling back to LocalStorage:", e);
    }

    // 3. Fallback: LocalStorage Check (Strictly filter by travelDate & busId)
    try {
      const allBookings = JSON.parse(localStorage.getItem('myBookings')) || [];
      allBookings.forEach(booking => {
        const itemBusId = booking.busId || booking.bus_id;
        const matchBus = busId ? String(itemBusId) === String(busId) : true;

        const rawBookingDate = booking.travelDate || booking.date;
        const bookingDate = parseStandardDate(rawBookingDate);
        const matchDate = (bookingDate === travelDate);

        if (matchBus && matchDate && booking.status !== 'Cancelled') {
          let seatsArr = Array.isArray(booking.seats) ? booking.seats : String(booking.seats || '').split(',');
          seatsArr.forEach(s => {
            const seatNum = extractSeatNumber(s);
            if (seatNum !== null) occupiedSeatNumbers.add(seatNum);
          });
        }
      });
    } catch (e) {
      console.error("LocalStorage read error:", e);
    }

    return Array.from(occupiedSeatNumbers);
  }

  // Fetch Selected Bus Details from Database
  try {
    const response = await fetch('http://localhost:5000/api/buses');
    if (response.ok) {
      const buses = await response.json();
      const selectedBusObj = buses.find(b => String(b.id) === String(busId));

      if (selectedBusObj) {
        SEAT_PRICE = Number(selectedBusObj.fare) || 850;
        currentBusName = selectedBusObj.bus_name || 'Express Bus';
        if (selectedBusObj.bus_number) {
          currentBusName += ` (${selectedBusObj.bus_number})`;
        }
      }
    }

    if (busNameText) {
      busNameText.textContent = `${currentBusName} (₹${SEAT_PRICE}/seat)`;
    }
  } catch (error) {
    console.error("Backend bus details fetch error:", error);
    if (busNameText) busNameText.textContent = `Express Bus (₹${SEAT_PRICE}/seat)`;
  }

  // Render Bus Grid Layout
  function renderSeats(bookedSeats) {
    if (!busGrid) return;
    busGrid.innerHTML = '';

    for (let i = 1; i <= TOTAL_SEATS; i++) {
      const seat = document.createElement('div');
      seat.classList.add('seat');
      seat.textContent = `S${i}`;
      seat.dataset.seatNumber = `S${i}`;

      if (bookedSeats.includes(i)) {
        seat.classList.add('booked');
        seat.style.pointerEvents = 'none'; // Prevent selection on booked seats
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

  // Toggle Seat Selection
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

  // Update Price Summary
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

  // Checkout Handler
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      const count = selectedSeats.length;
      if (count === 0) return;

      const pureBaseFare = count * SEAT_PRICE;
      const taxFare = Math.round(pureBaseFare * 0.05);
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
        to: toLoc,
        travelDate: travelDate
      };

      localStorage.setItem('travelgo_booking_data', JSON.stringify(updatedData));
      localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));

      window.location.href = `./passenger.html?date=${encodeURIComponent(travelDate)}&busId=${encodeURIComponent(busId || '')}`;
    });
  }

  // Load occupied seats THEN render
  const currentlyBookedSeats = await fetchOccupiedSeats();
  renderSeats(currentlyBookedSeats);
  updateSummary();
});