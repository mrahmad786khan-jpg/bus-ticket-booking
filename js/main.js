document.addEventListener('DOMContentLoaded', () => {

  // 1. Set Default Date to Today
  const dateInput = document.querySelector('input[type="date"]');
  if (dateInput && !dateInput.value) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  // 2. Swap Button Functionality
  const swapBtn = document.querySelector('.btn-swap');
  if (swapBtn) {
    swapBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const fromInput = document.getElementById('fromInput') || document.querySelectorAll('.search-group input, form input')[0];
      const toInput = document.getElementById('toInput') || document.querySelectorAll('.search-group input, form input')[1];

      if (fromInput && toInput) {
        const tempValue = fromInput.value;
        fromInput.value = toInput.value;
        toInput.value = tempValue;

        swapBtn.style.transition = 'transform 0.3s ease';
        swapBtn.style.transform = swapBtn.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';
      }
    });
  }

  // 3. Search Form Submit
  const searchForm = document.querySelector('.search-widget-form') || document.querySelector('form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const inputs = searchForm.querySelectorAll('input');
      const select = searchForm.querySelector('select');

      const fromVal = inputs[0] ? inputs[0].value.trim() : 'Mumbai';
      const toVal = inputs[1] ? inputs[1].value.trim() : 'Goa';
      const dateVal = searchForm.querySelector('input[type="date"]')?.value || new Date().toISOString().split('T')[0];
      const busTypeVal = select ? select.value : 'All Types';

      if (!fromVal || !toVal) {
        alert('Kripya From aur To cities select karein!');
        return;
      }

      const searchQuery = {
        from: fromVal,
        to: toVal,
        date: dateVal,
        busType: busTypeVal
      };

      localStorage.setItem('searchQuery', JSON.stringify(searchQuery));
      window.location.href = `search-results.html?from=${encodeURIComponent(fromVal)}&to=${encodeURIComponent(toVal)}&date=${dateVal}`;
    });
  }

});