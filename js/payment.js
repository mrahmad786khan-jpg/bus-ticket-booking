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

  if (summarySeatsEl) summarySeatsEl.textContent = savedSeats.join(', ');
  if (summaryPassengersEl) summaryPassengersEl.textContent = passengerDetails.length || savedSeats.length;
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
    return 'SS-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  const paymentForm = document.getElementById('paymentForm');
  const payBtn = document.getElementById('payNowBtn');
  const successModal = document.getElementById('successModal');
  const ticketIdEl = document.getElementById('ticketId');
  const doneBtn = document.getElementById('doneBtn');

  if (paymentForm) {
    paymentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (payBtn) {
        payBtn.innerHTML = 'Processing...';
        payBtn.disabled = true;
      }

      setTimeout(() => {
        const randomID = generateTicketId();
        if (ticketIdEl) ticketIdEl.textContent = randomID;

        const newBooking = {
          pnr: randomID,
          status: 'Confirmed',
          seats: savedSeats.join(', '),
          passengersCount: passengerDetails.length || savedSeats.length,
          bookingDate: new Date().toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
          }),
          totalFare: `₹${totalAmount}`
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