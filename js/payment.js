document.addEventListener('DOMContentLoaded', () => {
  let bookingData = null;
  try {
    const raw = localStorage.getItem('travelgo_booking_data');
    if (raw) bookingData = JSON.parse(raw);
  } catch (e) {}

  // Extract Travel Date from URL query params or bookingData
  const urlParams = new URLSearchParams(window.location.search);
  let travelDate = urlParams.get('date') || urlParams.get('travelDate');
  if (!travelDate && bookingData && bookingData.travelDate) {
    travelDate = bookingData.travelDate;
  }
  if (!travelDate) {
    const today = new Date();
    travelDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  // Extract Bus ID
  const busId = (bookingData && bookingData.busId) ? bookingData.busId : (urlParams.get('busId') || '1');

  let savedSeats = (bookingData && bookingData.seats) ? bookingData.seats : ['S1'];
  let passengerDetails = (bookingData && bookingData.passengers) ? bookingData.passengers : [];

  let baseFare = bookingData ? Number(bookingData.baseFare) : (savedSeats.length * 1200);
  let taxFare = bookingData ? Number(bookingData.taxFare) : Math.round(baseFare * 0.05);
  let totalAmount = baseFare + taxFare;

  const summarySeatsEl = document.getElementById('summarySeats');
  const summaryPassengersEl = document.getElementById('summaryPassengers');
  const summaryAmountEl = document.getElementById('summaryAmount');
  const baseFareEl = document.getElementById('display-base-fare');
  const taxFareEl = document.getElementById('display-tax-fare');
  const btnPayText = document.getElementById('btn-pay-text');

  if (summarySeatsEl) summarySeatsEl.textContent = Array.isArray(savedSeats) ? savedSeats.join(', ') : savedSeats;
  if (summaryPassengersEl) summaryPassengersEl.textContent = passengerDetails.length || (Array.isArray(savedSeats) ? savedSeats.length : 1);
  if (baseFareEl) baseFareEl.textContent = `₹${baseFare}`;
  if (taxFareEl) taxFareEl.textContent = `₹${taxFare}`;
  if (summaryAmountEl) summaryAmountEl.textContent = `₹${totalAmount}`;
  if (btnPayText) btnPayText.textContent = `Pay ₹${totalAmount} Securely`;

  const radios = document.querySelectorAll('input[name="paymentType"]');
  radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('.form-panel').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('active'));

      e.target.closest('.payment-method')?.classList.add('active');
      const targetPanel = document.getElementById(`${e.target.value}Form`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  function generateTicketId() {
    return 'TG-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  const paymentForm = document.getElementById('paymentForm');
  const payBtn = document.getElementById('payNowBtn');
  const successModal = document.getElementById('successModal');
  const ticketIdEl = document.getElementById('ticketId');
  const doneBtn = document.getElementById('doneBtn');

  if (paymentForm) {
    paymentForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Flexible Logged In User Detection (Included 'safarsathi_user')
      let loggedInUser = null;

      if (typeof getLoggedInUser === 'function') {
        loggedInUser = getLoggedInUser();
      }

      if (!loggedInUser) {
        try {
          loggedInUser = JSON.parse(localStorage.getItem('safarsathi_user')) || 
                         JSON.parse(localStorage.getItem('travelgo_user')) || 
                         JSON.parse(localStorage.getItem('user')) || 
                         JSON.parse(localStorage.getItem('loggedInUser'));
        } catch (err) {
          loggedInUser = null;
        }
      }

      // Check if user object exists
      const isUserValid = loggedInUser && (loggedInUser.id || loggedInUser.email || loggedInUser.name);

      if (!isUserValid) {
        alert("Please log in or sign up to complete your ticket booking.");
        window.location.href = `auth.html?redirect=payment.html`;
        return;
      }

      if (payBtn) {
        payBtn.innerHTML = 'Processing...';
        payBtn.disabled = true;
      }

      const randomID = generateTicketId();

      // Formed Object for MySQL Database API Payload
      const dbBookingPayload = {
        pnr: randomID,
        user_id: loggedInUser.id || null,
        bus_id: busId,
        passenger_name: passengerDetails[0]?.name || loggedInUser.name || 'Passenger',
        passenger_email: loggedInUser.email || 'user@example.com',
        source: (bookingData && bookingData.from) ? bookingData.from : 'Source',
        destination: (bookingData && bookingData.to) ? bookingData.to : 'Destination',
        seat_no: Array.isArray(savedSeats) ? savedSeats.join(',') : String(savedSeats),
        travel_date: travelDate,
        total_fare: totalAmount
      };

      try {
        // Save to Database via API First
        const response = await fetch('http://localhost:5000/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dbBookingPayload)
        });

        const resData = await response.json();
        console.log("Database booking save response:", resData);

      } catch (apiError) {
        console.warn("Backend DB Save Error, falling back to LocalStorage:", apiError);
      }

      // Save to LocalStorage Fallback
      const newBooking = {
        pnr: randomID,
        busId: busId,
        travelDate: travelDate,
        userId: loggedInUser.id || '',
        userEmail: loggedInUser.email || '',
        passengerEmail: loggedInUser.email || '',
        passenger_email: loggedInUser.email || '',
        userPhone: loggedInUser.mobile || loggedInUser.phone || '',
        userName: loggedInUser.name || 'Passenger',
        from: dbBookingPayload.source,
        to: dbBookingPayload.destination,
        busName: (bookingData && bookingData.busName) ? bookingData.busName : 'Express Bus',
        status: 'Confirmed',
        seats: Array.isArray(savedSeats) ? savedSeats : [savedSeats],
        passengersCount: passengerDetails.length || (Array.isArray(savedSeats) ? savedSeats.length : 1),
        passengers: passengerDetails,
        bookingDate: new Date().toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric'
        }),
        totalFare: totalAmount
      };

      let existingBookings = JSON.parse(localStorage.getItem('myBookings')) || [];
      existingBookings.unshift(newBooking);
      localStorage.setItem('myBookings', JSON.stringify(existingBookings));

      if (ticketIdEl) ticketIdEl.textContent = randomID;

      if (successModal) {
        successModal.classList.add('show');
      } else {
        window.location.href = "my-bookings.html";
      }
    });
  }

  if (doneBtn) {
    doneBtn.addEventListener('click', () => {
      localStorage.removeItem('travelgo_booking_data');
      localStorage.removeItem('selectedSeats');
      localStorage.removeItem('passengerDetails');

      window.location.href = "my-bookings.html";
    });
  }
});