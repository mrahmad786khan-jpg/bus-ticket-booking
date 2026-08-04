document.addEventListener('DOMContentLoaded', () => {
  const savedSeats = JSON.parse(localStorage.getItem('selectedSeats')) || [];
  let savedFare = localStorage.getItem('totalFare');
  const passengerDetails = JSON.parse(localStorage.getItem('passengerDetails')) || [];

  // Price fallback
  const pricePerSeat = 850;
  if (!savedFare || savedFare === '₹0' || savedFare === '0') {
    const calculatedAmount = savedSeats.length * pricePerSeat;
    savedFare = `₹${calculatedAmount > 0 ? calculatedAmount : 1700}`;
  }

  document.getElementById('summarySeats').textContent = savedSeats.length > 0 ? savedSeats.join(', ') : 'N/A';
  document.getElementById('summaryPassengers').textContent = passengerDetails.length || savedSeats.length || 0;
  document.getElementById('summaryAmount').textContent = savedFare;

  // Toggle Forms
  const radios = document.querySelectorAll('input[name="paymentType"]');
  const upiForm = document.getElementById('upiForm');
  const cardForm = document.getElementById('cardForm');
  const netbankingForm = document.getElementById('netbankingForm');

  radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      upiForm.classList.remove('active');
      cardForm.classList.remove('active');
      netbankingForm.classList.remove('active');

      document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('active'));
      e.target.closest('.payment-method').classList.add('active');

      if (e.target.value === 'upi') upiForm.classList.add('active');
      else if (e.target.value === 'card') cardForm.classList.add('active');
      else if (e.target.value === 'netbanking') netbankingForm.classList.add('active');
    });
  });

  // Random Ticket ID Generator Function
  function generateTicketId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'TGO-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Pay Action
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
        ticketIdEl.textContent = randomID;
        successModal.classList.add('show');
      }, 1500);
    });
  }

  if (doneBtn) {
    doneBtn.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = "index.html";
    });
  }
});