document.addEventListener('DOMContentLoaded', () => {

  // URL se URLSearchParams extract karna
  const urlParams = new URLSearchParams(window.location.search);
  
  const fromParam = urlParams.get('from');
  const toParam = urlParams.get('to');
  const dateParam = urlParams.get('date');
  const busTypeParam = urlParams.get('busType');

  // Page inputs par selected value set karna
  const modInputs = document.querySelectorAll('.modify-search-bar input, .mod-group input');
  const modSelect = document.querySelector('.modify-search-bar select, .mod-group select');

  if (modInputs.length >= 3) {
    if (fromParam) modInputs[0].value = fromParam;
    if (toParam) modInputs[1].value = toParam;
    if (dateParam) modInputs[2].value = dateParam; // Updated date set ho jayegi!
  }
  
  if (modSelect && busTypeParam) {
    modSelect.value = busTypeParam;
  }

});

document.addEventListener('DOMContentLoaded', () => {
  
  // -------------------------------------------------------------
  // 1. Saved Date aur Route ko Page par Dikhana (Reset Issue Fix)
  // -------------------------------------------------------------
  const savedQuery = JSON.parse(localStorage.getItem('searchQuery'));

  if (savedQuery) {
    const modInputs = document.querySelectorAll('.modify-search-bar input, .mod-group input');
    const modSelect = document.querySelector('.modify-search-bar select, .mod-group select');

    if (modInputs.length >= 3) {
      if (savedQuery.from) modInputs[0].value = savedQuery.from;
      if (savedQuery.to) modInputs[1].value = savedQuery.to;
      if (savedQuery.date) modInputs[2].value = savedQuery.date; // Date retained!
    }
    if (modSelect && savedQuery.busType) {
      modSelect.value = savedQuery.busType;
    }
  }

  // -------------------------------------------------------------
  // 2. Modify Bar Swap Button Logic
  // -------------------------------------------------------------
  const swapBtn = document.querySelector('.btn-swap-sm');
  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const modInputs = document.querySelectorAll('.modify-search-bar input, .mod-group input');
      if (modInputs.length >= 2) {
        const tempValue = modInputs[0].value;
        modInputs[0].value = modInputs[1].value;
        modInputs[1].value = tempValue;

        swapBtn.style.transition = 'transform 0.3s ease';
        swapBtn.style.transform = swapBtn.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';
      }
    });
  }

  // -------------------------------------------------------------
  // 3. Price Filter Slider Logic
  // -------------------------------------------------------------
  const priceSlider = document.getElementById('priceRange');
  const priceVal = document.getElementById('priceVal');
  const busCards = document.querySelectorAll('.bus-card');

  if (priceSlider && priceVal) {
    priceSlider.addEventListener('input', (e) => {
      const maxPrice = parseInt(e.target.value);
      priceVal.innerText = `₹${maxPrice}`;

      busCards.forEach(card => {
        const cardPrice = parseInt(card.getAttribute('data-price'));
        if (cardPrice <= maxPrice) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // -------------------------------------------------------------
  // 4. Select Seat Button Redirect
  // -------------------------------------------------------------
  const selectSeatBtns = document.querySelectorAll('.btn-select-seat');
  selectSeatBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const busCard = e.target.closest('.bus-card');
      const busName = busCard.querySelector('.bus-name')?.innerText || 'Bus';
      const busType = busCard.querySelector('.bus-type-text')?.innerText || 'AC';
      const busPrice = busCard.getAttribute('data-price') || '1000';

      const selectedBus = {
        name: busName,
        type: busType,
        price: parseInt(busPrice)
      };
      localStorage.setItem('selectedBus', JSON.stringify(selectedBus));

      window.location.href = 'seat-selection.html';
    });
  });
});