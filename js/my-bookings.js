document.addEventListener('DOMContentLoaded', async () => {
  const bookingsContainer = document.getElementById('bookingsContainer') || document.getElementById('bookingsList');

  // Multi-key User Check (Fits auth.js keys)
  const currentUser = JSON.parse(
    localStorage.getItem('safarsathi_user') || 
    localStorage.getItem('travelgo_user') || 
    localStorage.getItem('user') || 
    localStorage.getItem('currentUser') || 
    'null'
  );

  let globalBookings = [];
  let currentFilter = 'ALL';
  let pendingCancelPNR = null;

  // ----------------------------------------------------
  // Inject Custom Modern Cancel Confirmation Modal HTML & CSS
  // ----------------------------------------------------
  const modalHTML = `
    <div id="customCancelModal" style="
      display: none; 
      position: fixed; 
      top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0, 0, 0, 0.5); 
      backdrop-filter: blur(4px);
      z-index: 9999; 
      justify-content: center; 
      align-items: center;
      transition: all 0.3s ease;
    ">
      <div style="
        background: #ffffff; 
        padding: 30px; 
        border-radius: 12px; 
        max-width: 400px; 
        width: 90%; 
        text-align: center; 
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        animation: modalPop 0.3s ease-out;
      ">
        <div style="
          width: 60px; height: 60px; 
          background: #ffebee; color: #dc3545; 
          border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; 
          margin: 0 auto 15px; font-size: 28px; font-weight: bold;
        ">✕</div>
        
        <h3 style="margin: 0 0 10px; color: #333; font-size: 1.25rem;">Cancel Ticket?</h3>
        <p style="color: #666; font-size: 0.95rem; margin-bottom: 25px; line-height: 1.4;">
          Kya aap sach me PNR: <strong id="cancelModalPNR" style="color: #007bff;"></strong> wali ticket cancel karna chahte hain?
        </p>

        <div style="display: flex; gap: 12px; justify-content: center;">
          <button id="cancelModalCloseBtn" style="
            flex: 1; 
            padding: 10px 16px; 
            background: #f1f3f5; 
            color: #495057; 
            border: none; 
            border-radius: 6px; 
            cursor: pointer; 
            font-weight: 600;
          ">Nahi, Rakho</button>
          
          <button id="cancelModalConfirmBtn" style="
            flex: 1; 
            padding: 10px 16px; 
            background: #dc3545; 
            color: #fff; 
            border: none; 
            border-radius: 6px; 
            cursor: pointer; 
            font-weight: 600;
            box-shadow: 0 2px 6px rgba(220, 53, 69, 0.3);
          ">Haan, Cancel Karo</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Modal Animation Style Inject
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    @keyframes modalPop {
      0% { transform: scale(0.8); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(styleTag);

  // Modal Buttons Handle
  const cancelModal = document.getElementById('customCancelModal');
  const cancelModalPNR = document.getElementById('cancelModalPNR');
  const cancelModalCloseBtn = document.getElementById('cancelModalCloseBtn');
  const cancelModalConfirmBtn = document.getElementById('cancelModalConfirmBtn');

  cancelModalCloseBtn.addEventListener('click', () => {
    cancelModal.style.display = 'none';
    pendingCancelPNR = null;
  });

  cancelModalConfirmBtn.addEventListener('click', async () => {
    if (pendingCancelPNR) {
      await executeCancellation(pendingCancelPNR);
      cancelModal.style.display = 'none';
      pendingCancelPNR = null;
    }
  });

  // Date Formatting Helper
  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // Get Calculated Status (UPCOMING, COMPLETED, CANCELLED)
  function getBookingCategory(booking) {
    const rawStatus = (booking.status || '').toUpperCase();
    if (rawStatus === 'CANCELLED' || rawStatus === 'CANCEL') {
      return 'CANCELLED';
    }

    const dateVal = booking.travel_date || booking.travelDate || booking.date;
    if (!dateVal) return 'UPCOMING';

    const travelDate = new Date(dateVal);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!isNaN(travelDate.getTime()) && travelDate < today) {
      return 'COMPLETED';
    }

    return 'UPCOMING';
  }

  // Render Empty State
  function renderEmptyState(message = 'Koi Booked Tickets Nahi Mili!') {
    if (!bookingsContainer) return;
    bookingsContainer.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #666;">
        <h3>${message}</h3>
        ${!currentUser ? 
          '<p>Apni booked tickets dekhne ke liye login karein.</p><a href="auth.html" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background: #007bff; color: white; border-radius: 5px; text-decoration: none;">Login Now</a>' : 
          '<p>Aapne abhi tak koi ticket book nahi ki hai.</p><a href="index.html" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background: #007bff; color: white; border-radius: 5px; text-decoration: none;">Book Ticket Now</a>'
        }
      </div>
    `;
  }

  // Show Custom Cancel Modal
  window.cancelTicket = function(pnr) {
    pendingCancelPNR = pnr;
    cancelModalPNR.textContent = pnr;
    cancelModal.style.display = 'flex';
  };

  // Perform Cancellation Action
  async function executeCancellation(pnr) {
    try {
      // 1. Backend API Update Try Karein
      await fetch(`http://localhost:5000/api/cancel-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pnr: pnr, email: currentUser.email })
      });
    } catch (err) {
      console.warn("Backend API not reachable for cancellation, updating LocalStorage only.");
    }

    // 2. LocalStorage Updates
    let localBookings = JSON.parse(localStorage.getItem('myBookings')) || [];
    localBookings = localBookings.map(b => {
      if ((b.pnr && b.pnr === pnr) || (b.id && String(b.id) === String(pnr))) {
        b.status = 'CANCELLED';
      }
      return b;
    });
    localStorage.setItem('myBookings', JSON.stringify(localBookings));

    // 3. Update Current State & UI Reload
    globalBookings = globalBookings.map(b => {
      if ((b.pnr && b.pnr === pnr) || (b.id && String(b.id) === String(pnr))) {
        b.status = 'CANCELLED';
      }
      return b;
    });

    renderBookings();
  }

  // If user is LOGGED OUT
  if (!currentUser) {
    renderEmptyState('Aap Logged Out Hain!');
    return;
  }

  // Fetch Bookings for LOGGED IN User
  async function fetchUserBookings() {
    let allBookings = [];

    try {
      const userEmail = currentUser.email;
      const res = await fetch(`http://localhost:5000/api/my-bookings?email=${encodeURIComponent(userEmail)}`);
      if (res.ok) {
        allBookings = await res.json();
      }
    } catch (error) {
      console.warn("Backend API unavailable, checking LocalStorage...", error);
    }

    // Fallback LocalStorage (User-Specific Filter)
    if (!Array.isArray(allBookings) || allBookings.length === 0) {
      try {
        const localBookings = JSON.parse(localStorage.getItem('myBookings')) || [];
        allBookings = localBookings.filter(b => 
          (b.passengerEmail && b.passengerEmail === currentUser.email) ||
          (b.passenger_email && b.passenger_email === currentUser.email)
        );
      } catch (e) {
        allBookings = [];
      }
    }

    globalBookings = allBookings;
    renderBookings();
  }

  // Filter Event Listener Binding
  window.filterBookings = function(type, btnElement) {
    currentFilter = type;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');
    renderBookings();
  };

  function renderBookings() {
    if (!bookingsContainer) return;

    if (!globalBookings || globalBookings.length === 0) {
      renderEmptyState();
      return;
    }

    // Filter array based on selected tab
    const filteredBookings = globalBookings.filter(b => {
      const category = getBookingCategory(b);
      if (currentFilter === 'ALL') return true;
      return category === currentFilter;
    });

    if (filteredBookings.length === 0) {
      renderEmptyState(`Koi ${currentFilter.toLowerCase()} booking nahi mili!`);
      return;
    }

    bookingsContainer.innerHTML = '';

    filteredBookings.forEach(booking => {
      const pnr = booking.pnr || booking.id || 'N/A';
      const passengerName = booking.passenger_name || booking.passengerName || 'Passenger';
      const source = booking.source || booking.from || 'Source';
      const destination = booking.destination || booking.to || 'Destination';
      const busName = booking.bus_name || booking.busName || 'Express Bus';
      const travelDate = formatDate(booking.travel_date || booking.travelDate || booking.date);
      
      let seatNo = booking.seat_no || booking.seat_numbers || booking.seats;
      if (Array.isArray(seatNo)) seatNo = seatNo.join(', ');

      const totalFare = booking.total_fare || booking.totalAmount || booking.fare || 0;
      
      // Calculate Display Category & Styling
      const category = getBookingCategory(booking);
      let statusText = booking.status || category;
      let badgeBg = '#e8f5e9';
      let badgeColor = '#2e7d32';

      if (category === 'COMPLETED') {
        badgeBg = '#e0e0e0';
        badgeColor = '#424242';
        statusText = 'Completed';
      } else if (category === 'CANCELLED') {
        badgeBg = '#ffebee';
        badgeColor = '#c62828';
        statusText = 'Cancelled';
      }

      // Cancel Button logic (Only show for UPCOMING tickets)
      const isUpcoming = (category === 'UPCOMING');
      const cancelButtonHTML = isUpcoming ? `
        <button onclick="cancelTicket('${pnr}')" style="
          background: #dc3545; 
          color: white; 
          border: none; 
          padding: 6px 14px; 
          border-radius: 4px; 
          cursor: pointer; 
          font-size: 0.85em;
          font-weight: bold;
          transition: background 0.2s ease;"
          onmouseover="this.style.background='#c82333'"
          onmouseout="this.style.background='#dc3545'"
        >
          Cancel Ticket
        </button>
      ` : '';

      const bookingCard = document.createElement('div');
      bookingCard.className = 'booking-card';
      bookingCard.style.cssText = `
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
        background: #fff;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      `;

      bookingCard.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
          <div>
            <strong style="font-size: 1.1em; color: #333;">PNR: ${pnr}</strong>
            <span style="margin-left: 10px; background: ${badgeBg}; color: ${badgeColor}; padding: 3px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold;">${statusText}</span>
          </div>
          <div style="color: #666; font-size: 0.9em;">
            Travel Date: <strong>${travelDate}</strong>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <div>
            <h4 style="margin: 0; color: #007bff;">${source} ➔ ${destination}</h4>
            <p style="margin: 5px 0 0; color: #555; font-size: 0.9em;">Bus: ${busName}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 0.9em; color: #666;">Total Fare</p>
            <h3 style="margin: 0; color: #28a745;">₹${totalFare}</h3>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; background: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 0.9em; color: #444;">
          <div>
            <strong>Passenger:</strong> ${passengerName} | <strong>Seats:</strong> ${seatNo}
          </div>
          <div>
            ${cancelButtonHTML}
          </div>
        </div>
      `;

      bookingsContainer.appendChild(bookingCard);
    });
  }

  fetchUserBookings();
});