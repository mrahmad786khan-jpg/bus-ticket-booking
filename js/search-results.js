document.addEventListener('DOMContentLoaded', () => {
  // 1. URL Query Parameters Read Karein
  const urlParams = new URLSearchParams(window.location.search);
  const fromLocation = urlParams.get('from') ? urlParams.get('from').trim() : '';
  const toLocation = urlParams.get('to') ? urlParams.get('to').trim() : '';
  const travelDate = urlParams.get('date') || 'Today';

  // Input Fields Sync
  const fromInput = document.querySelector('input[name="from"]') || document.getElementById('fromInput');
  const toInput = document.querySelector('input[name="to"]') || document.getElementById('toInput');
  const dateInput = document.querySelector('input[name="date"]') || document.getElementById('dateInput');

  if (fromInput && fromLocation) fromInput.value = fromLocation;
  if (toInput && toLocation) toInput.value = toLocation;
  if (dateInput && travelDate !== 'Today') dateInput.value = travelDate;

  // Header Title Update
  const routeHeaderEl = document.getElementById('searchRouteHeader');
  if (routeHeaderEl && fromLocation && toLocation) {
    routeHeaderEl.textContent = `${fromLocation} ➔ ${toLocation} (${travelDate})`;
  }

  // 2. Fetch Data from Central Mock Database (mockData.js)
  const allBuses = typeof getStoredBuses === 'function' 
    ? getStoredBuses() 
    : (typeof TRAVELGO_DB !== 'undefined' ? TRAVELGO_DB.buses : []);

  // Filter Buses strictly based on Route Match
  let routeMatchedBuses = [];
  if (fromLocation && toLocation) {
    routeMatchedBuses = allBuses.filter(bus => 
      bus.from.toLowerCase() === fromLocation.toLowerCase() && 
      bus.to.toLowerCase() === toLocation.toLowerCase()
    );
  } else {
    routeMatchedBuses = allBuses; // Show all if no route selected
  }

  // DOM Elements
  const busListContainer = document.querySelector('.bus-list') || document.getElementById('busListContainer') || document.getElementById('busResults');
  const checkboxes = document.querySelectorAll('.filter-group input[type="checkbox"]');
  const priceRange = document.getElementById('priceRange');
  const priceVal = document.getElementById('priceVal');

  // 3. Bus Cards Render Function
  function renderBuses(buses) {
    if (!busListContainer) return;

    if (!buses || buses.length === 0) {
      busListContainer.innerHTML = `
        <div class="no-buses" style="color: #94a3b8; text-align: center; padding: 40px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; margin-top: 20px;">
          <h3 style="color: #fff; margin-bottom: 8px;">No Buses Available</h3>
          <p style="margin: 0;">No buses found matching ${fromLocation ? `"${fromLocation} ➔ ${toLocation}"` : 'your search criteria'}.</p>
          <p style="font-size: 0.85rem; color: #64748b; margin-top: 5px;">Try searching popular routes like "Mumbai to Goa", "Delhi to Manali", or "Bangalore to Chennai".</p>
        </div>
      `;
      return;
    }

    busListContainer.innerHTML = buses.map((bus) => {
      const busPrice = bus.price || 1200;
      const availableSeats = bus.seats 
        ? bus.seats.filter(s => s.status === 'available').length 
        : (bus.totalSeats || 20);

      return `
        <div class="bus-card" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
          
          <div class="bus-info">
            <h3 style="color: #fff; margin: 0 0 5px 0;">${bus.name}</h3>
            <p style="color: #94a3b8; margin: 0; font-size: 0.9rem;">${bus.type}</p>
            <div style="margin-top: 8px; color: #38bdf8; font-size: 0.85rem;">
              <span>⭐ ${bus.rating || '4.5'}</span> | <span>${availableSeats} Seats Left</span>
            </div>
          </div>

          <div class="bus-timing" style="text-align: center;">
            <div style="font-weight: bold; color: #fff;">${bus.departureTime} ➔ ${bus.arrivalTime}</div>
            <div style="color: #64748b; font-size: 0.85rem;">${bus.duration}</div>
          </div>

          <div class="bus-action" style="text-align: right;">
            <div style="font-size: 1.4rem; font-weight: bold; color: #34d399; margin-bottom: 8px;">₹${busPrice}</div>
            <button type="button" class="btn-select-bus" data-bus-id="${bus.id}" style="padding: 10px 20px; background: #38bdf8; border: none; color: #0f172a; font-weight: bold; border-radius: 6px; cursor: pointer; display: inline-block;">
              Select Seats
            </button>
          </div>

        </div>
      `;
    }).join('');

    // Reliable Click Handler
    document.querySelectorAll('.btn-select-bus').forEach((button) => {
      button.addEventListener('click', (e) => {
        const busId = e.currentTarget.getAttribute('data-bus-id');
        const selectedBusObj = buses.find(b => b.id === busId);
        if (selectedBusObj) {
          handleBusSelect(selectedBusObj);
        }
      });
    });
  }

  // 4. Apply Filters Logic
  function applyFilters() {
    const maxPrice = priceRange ? Number(priceRange.value) : 3000;
    if (priceVal) priceVal.textContent = `₹${maxPrice}`;

    let acChecked = true;
    let nonAcChecked = true;

    checkboxes.forEach(cb => {
      const labelText = cb.parentElement ? cb.parentElement.textContent.toLowerCase() : '';
      if (labelText.includes('ac sleeper') || labelText.includes('ac')) {
        acChecked = cb.checked;
      }
      if (labelText.includes('non-ac') || labelText.includes('seater')) {
        nonAcChecked = cb.checked;
      }
    });

    const filteredBuses = routeMatchedBuses.filter(bus => {
      const matchesPrice = bus.price <= maxPrice;

      const busCategory = bus.category || bus.type.toLowerCase();
      const isAcBus = busCategory.includes('ac') && !busCategory.includes('non-ac');
      const isNonAcBus = busCategory.includes('non-ac') || busCategory.includes('seater');

      let matchesType = false;
      if (isAcBus && acChecked) matchesType = true;
      if (isNonAcBus && nonAcChecked) matchesType = true;
      if (!isAcBus && !isNonAcBus) matchesType = true; // Fallback for general types

      return matchesPrice && matchesType;
    });

    renderBuses(filteredBuses);
  }

  // Attach Event Listeners
  if (priceRange) {
    priceRange.addEventListener('input', applyFilters);
  }
  checkboxes.forEach(cb => {
    cb.addEventListener('change', applyFilters);
  });

  // 5. Select Bus & Data Save Handling
  function handleBusSelect(bus) {
    const busPrice = bus.price || 1200;

    const selectedBusObject = {
      id: bus.id,
      name: bus.name,
      type: bus.type,
      price: busPrice,
      from: bus.from || fromLocation,
      to: bus.to || toLocation
    };

    const bookingData = {
      busName: bus.name,
      busType: bus.type,
      baseSeatPrice: busPrice,
      totalAmount: busPrice,
      from: bus.from || fromLocation,
      to: bus.to || toLocation
    };

    localStorage.setItem('selectedBus', JSON.stringify(selectedBusObject));
    localStorage.setItem('travelgo_booking_data', JSON.stringify(bookingData));
    localStorage.setItem('bus_single_price', busPrice.toString());

    const fromParam = encodeURIComponent(fromLocation || bus.from);
    const toParam = encodeURIComponent(toLocation || bus.to);
    window.location.href = `seat-selection.html?from=${fromParam}&to=${toParam}&busId=${bus.id}`;
  }

  // Initial Filter Execution
  applyFilters();
});