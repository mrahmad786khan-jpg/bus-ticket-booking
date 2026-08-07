document.addEventListener('DOMContentLoaded', () => {

  // 1. URL Params aur LocalStorage Data Restore
  const urlParams = new URLSearchParams(window.location.search);
  
  const fromParam = urlParams.get('from');
  const toParam = urlParams.get('to');
  const dateParam = urlParams.get('date');
  const busTypeParam = urlParams.get('busType');
  const priceParam = urlParams.get('price'); // Extracted price param from URL

  const savedQuery = JSON.parse(localStorage.getItem('searchQuery')) || {};
  const modInputs = document.querySelectorAll('.modify-search-bar input, .mod-group input');
  const modSelect = document.querySelector('.modify-search-bar select, .mod-group select');

  // Input fields populating logic
  if (modInputs.length >= 3) {
    if (fromParam || savedQuery.from) modInputs[0].value = fromParam || savedQuery.from;
    if (toParam || savedQuery.to) modInputs[1].value = toParam || savedQuery.to;
    if (dateParam || savedQuery.date) modInputs[2].value = dateParam || savedQuery.date;
  }
  
  if (modSelect && (busTypeParam || savedQuery.busType)) {
    modSelect.value = busTypeParam || savedQuery.busType;
  }

  // =========================================================
  // FIX: Route Price Synchronization Logic (Selected Route Price Updates)
  // =========================================================
  const busCards = document.querySelectorAll('.bus-card');
  const targetBasePrice = parseInt(priceParam || savedQuery.routeMinPrice);

  if (targetBasePrice && busCards.length > 0) {
    busCards.forEach((card, index) => {
      // Pehle card par exact minimum route price (e.g., 1800 ya 1000) set karega, baaki par slight variation
      const cardPrice = targetBasePrice + (index * 150);

      // Attribute Update for Seat Selection & Filters
      card.setAttribute('data-price', cardPrice);

      // DOM Text Update for Price Display
      const priceDisplay = card.querySelector('.price-tag, .bus-price, h3');
      if (priceDisplay) {
        priceDisplay.innerText = `₹${cardPrice}`;
      }
    });
  }
  // =========================================================

  // 2. Swap Button Logic
  const swapBtn = document.querySelector('.btn-swap-sm');
  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const inputs = document.querySelectorAll('.modify-search-bar input, .mod-group input');
      if (inputs.length >= 2) {
        const tempValue = inputs[0].value;
        inputs[0].value = inputs[1].value;
        inputs[1].value = tempValue;

        swapBtn.style.transition = 'transform 0.3s ease';
        swapBtn.style.transform = swapBtn.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';
      }
    });
  }

  // 3. Price Filter Slider Logic
  const priceSlider = document.getElementById('priceRange');
  const priceVal = document.getElementById('priceVal');

  if (priceSlider && priceVal) {
    priceSlider.addEventListener('input', (e) => {
      const maxPrice = parseInt(e.target.value);
      priceVal.innerText = `₹${maxPrice}`;

      busCards.forEach(card => {
        const cardPrice = parseInt(card.getAttribute('data-price')) || 0;
        if (cardPrice <= maxPrice) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // 4. Select Seat Button Redirect & Price Sync Fix
  const selectSeatBtns = document.querySelectorAll('.btn-select-seat');
  selectSeatBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const busCard = e.target.closest('.bus-card');
      const busName = busCard ? busCard.querySelector('.bus-name')?.innerText || 'Bus' : 'Bus';
      const busType = busCard ? busCard.querySelector('.bus-type-text')?.innerText || 'AC' : 'AC';
      const busPrice = parseInt(busCard?.getAttribute('data-price') || '750');

      const selectedBus = {
        name: busName,
        type: busType,
        price: busPrice
      };

      // Synchronize with Central Booking State
      const currentBookingData = JSON.parse(localStorage.getItem('travelgo_booking_data')) || {};
      const updatedBookingData = {
        ...currentBookingData,
        busName: busName,
        busType: busType,
        baseSeatPrice: busPrice
      };

      localStorage.setItem('selectedBus', JSON.stringify(selectedBus));
      localStorage.setItem('travelgo_booking_data', JSON.stringify(updatedBookingData));

      window.location.href = 'seat-selection.html';
    });
  });
});