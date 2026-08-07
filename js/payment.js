document.addEventListener('DOMContentLoaded', () => {
  // 1. Storage se Centralized Booking Data Read Karein
  const rawBookingData = localStorage.getItem('travelgo_booking_data');
  const bookingData = rawBookingData ? JSON.parse(rawBookingData) : null;

  // Fallbacks setup for backward compatibility
  const savedSeats = (bookingData && bookingData.seats && bookingData.seats.length > 0)
    ? bookingData.seats
    : (JSON.parse(localStorage.getItem('selectedSeats')) || []);

  const passengerDetails = (bookingData && bookingData.passengers && bookingData.passengers.length > 0)
    ? bookingData.passengers
    : (JSON.parse(localStorage.getItem('passengerDetails')) || []);

  // Price synchronization directly from booking data or fallback key
  let totalAmount = (bookingData && bookingData.totalAmount)
    ? bookingData.totalAmount
    : (localStorage.getItem('booking_total_fare') || localStorage.getItem('totalFare'));

  // Clear numeric parsing with absolute fallback handling
  if (typeof totalAmount === 'string') {
    totalAmount = parseFloat(totalAmount.replace(/[^0-9.]/g, ''));
  }

  if (!totalAmount || isNaN(totalAmount) || totalAmount === 0) {
    totalAmount = savedSeats.length > 0 ? savedSeats.length * 750 : 750;
  }

  const formattedFare = `₹${totalAmount}`;

  // 2. Dynamic DOM Summary Updates
  const summarySeatsEl = document.getElementById('summarySeats');
  const summaryPassengersEl = document.getElementById('summaryPassengers');
  const summaryAmountEl = document.getElementById('summaryAmount');

  if (summarySeatsEl) {
    summarySeatsEl.textContent = savedSeats.length > 0 ? savedSeats.join(', ') : 'N/A';
  }
  if (summaryPassengersEl) {
    summaryPassengersEl.textContent = passengerDetails.length || savedSeats.length || 0;
  }
  if (summaryAmountEl) {
    summaryAmountEl.textContent = formattedFare;
  }

  // 3. Toggle Payment Forms
  const radios = document.querySelectorAll('input[name="paymentType"]');
  const upiForm = document.getElementById('upiForm');
  const cardForm = document.getElementById('cardForm');
  const netbankingForm = document.getElementById('netbankingForm');

  radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      upiForm?.classList.remove('active');
      cardForm?.classList.remove('active');
      netbankingForm?.classList.remove('active');

      document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('active'));
      e.target.closest('.payment-method')?.classList.add('active');

      if (e.target.value === 'upi') upiForm?.classList.add('active');
      else if (e.target.value === 'card') cardForm?.classList.add('active');
      else if (e.target.value === 'netbanking') netbankingForm?.classList.add('active');
    });
  });

  // Ticket / PNR Generator
  function generateTicketId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'SS-'; // SafarSathi Standard Prefix
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 4. Pay Now Action Handler
  const payBtn = document.getElementById('payNowBtn');
  const successModal = document.getElementById('successModal');
  const ticketIdEl = document.getElementById('ticketId');
  const doneBtn = document.getElementById('doneBtn');

  if (payBtn) {
    payBtn.addEventListener('click', () => {
      payBtn.textContent = "Processing Payment...";
      payBtn.style.opacity = "0.7";
      payBtn.disabled = true;

      setTimeout(() => {
        const randomID = generateTicketId();
        if (ticketIdEl) ticketIdEl.textContent = randomID;

        // Save to My Bookings History
        const newBooking = {
          pnr: randomID,
          seats: savedSeats.join(', '),
          passengersCount: passengerDetails.length || savedSeats.length || 1,
          totalFare: formattedFare,
          bookingDate: new Date().toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
          }),
          status: 'Confirmed'
        };

        const existingBookings = JSON.parse(localStorage.getItem('myBookings')) || [];
        existingBookings.unshift(newBooking); // Add new booking to top
        localStorage.setItem('myBookings', JSON.stringify(existingBookings));

        if (successModal) successModal.classList.add('show');
      }, 1500);
    });
  }

  if (doneBtn) {
    doneBtn.addEventListener('click', () => {
      // Clear active transaction storage keys while preserving myBookings
      localStorage.removeItem('travelgo_booking_data');
      localStorage.removeItem('selectedSeats');
      localStorage.removeItem('totalFare');
      localStorage.removeItem('passengerDetails');
      localStorage.removeItem('contactDetails');
      localStorage.removeItem('booking_total_fare');

      window.location.href = "my-bookings.html";
    });
  }
});