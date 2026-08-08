document.addEventListener('DOMContentLoaded', () => {
  let bookingData = null;
  try {
    const raw = localStorage.getItem('travelgo_booking_data');
    if (raw) bookingData = JSON.parse(raw);
  } catch (e) {}

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
    paymentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Flexible Logged In User Detection Across Various LocalStorage Keys
      let loggedInUser = null;

      if (typeof getLoggedInUser === 'function') {
        loggedInUser = getLoggedInUser();
      }

      if (!loggedInUser) {
        try {
          loggedInUser = JSON.parse(localStorage.getItem('user')) || 
                         JSON.parse(localStorage.getItem('loggedInUser')) || 
                         JSON.parse(localStorage.getItem('travelgo_user'));
        } catch (err) {
          loggedInUser = null;
        }
      }

      // Check if user object exists and contains ID or Name or Email
      const isUserValid = loggedInUser && (loggedInUser.id || loggedInUser.email || loggedInUser.name || loggedInUser.isLoggedIn);

      if (!isUserValid) {
        alert("Please log in or sign up to complete your ticket booking.");
        window.location.href = `auth.html?redirect=payment.html`;
        return;
      }

      if (payBtn) {
        payBtn.innerHTML = 'Processing...';
        payBtn.disabled = true;
      }

      setTimeout(() => {
        const randomID = generateTicketId();
        if (ticketIdEl) ticketIdEl.textContent = randomID;

        // Create new booking tied to the LOGGED-IN user's identity
        const newBooking = {
          pnr: randomID,
          userId: loggedInUser.id || '',
          userEmail: loggedInUser.email || '',
          userPhone: loggedInUser.mobile || loggedInUser.phone || '',
          userName: loggedInUser.name || 'Passenger',
          from: (bookingData && bookingData.from) ? bookingData.from : 'Source',
          to: (bookingData && bookingData.to) ? bookingData.to : 'Destination',
          status: 'Confirmed',
          seats: Array.isArray(savedSeats) ? savedSeats : [savedSeats],
          passengersCount: passengerDetails.length || (Array.isArray(savedSeats) ? savedSeats.length : 1),
          bookingDate: new Date().toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
          }),
          totalFare: totalAmount
        };

        let existingBookings = JSON.parse(localStorage.getItem('myBookings')) || [];
        existingBookings.unshift(newBooking);
        localStorage.setItem('myBookings', JSON.stringify(existingBookings));

        if (successModal) {
          successModal.classList.add('show');
        } else {
          window.location.href = "my-bookings.html";
        }
      }, 1000);
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