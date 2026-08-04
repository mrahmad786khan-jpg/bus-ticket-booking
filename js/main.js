document.addEventListener('DOMContentLoaded', () => {

  // -----------------------------------------------------------------
  // 1. Set Default Date to Today (Agar pehle se set na ho)
  // -----------------------------------------------------------------
  const dateInput = document.querySelector('input[type="date"]');
  if (dateInput && !dateInput.value) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  // -----------------------------------------------------------------
  // 2. Swap Button Functionality (FROM <-> TO Interchange)
  // -----------------------------------------------------------------
  const swapBtn = document.querySelector('.btn-swap');
  
  if (swapBtn) {
    swapBtn.addEventListener('click', (e) => {
      e.preventDefault(); // Form reload hone se rokne ke liye
      
      const fromInput = document.getElementById('fromInput') || document.querySelectorAll('.search-group input, form input')[0];
      const toInput = document.getElementById('toInput') || document.querySelectorAll('.search-group input, form input')[1];

      if (fromInput && toInput) {
        const tempValue = fromInput.value;
        fromInput.value = toInput.value;
        toInput.value = tempValue;

        // Smooth rotation animation on click
        swapBtn.style.transition = 'transform 0.3s ease';
        swapBtn.style.transform = swapBtn.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';
      }
    });
  }

  // -----------------------------------------------------------------
  // 3. Search Form Submit (Save Values & Prevent Reset)
  // -----------------------------------------------------------------
  const searchForm = document.querySelector('.search-widget-form') || document.querySelector('form');

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Page refresh hone se rokne ke liye

      // Inputs se data fetch karna
      const inputs = searchForm.querySelectorAll('input');
      const select = searchForm.querySelector('select');

      const fromVal = inputs[0] ? inputs[0].value.trim() : 'Mumbai';
      const toVal = inputs[1] ? inputs[1].value.trim() : 'Goa';
      const dateVal = searchForm.querySelector('input[type="date"]')?.value || new Date().toISOString().split('T')[0];
      const busTypeVal = select ? select.value : 'All Types';

      // Validation: Agar fields empty hain
      if (!fromVal || !toVal) {
        alert('Kripya From aur To cities select karein!');
        return;
      }

      // Search Data ko LocalStorage mein save karna
      const searchQuery = {
        from: fromVal,
        to: toVal,
        date: dateVal,
        busType: busTypeVal
      };

      localStorage.setItem('searchQuery', JSON.stringify(searchQuery));

      // Results page par redirect karna
      window.location.href = 'search-results.html';
    });
  }

});
document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.getElementById('customSelectWrapper');
  const trigger = wrapper?.querySelector('.custom-select-trigger');
  const options = wrapper?.querySelectorAll('.custom-option');
  const selectedText = document.getElementById('selectedOptionText');
  const hiddenInput = document.getElementById('busTypeInput');

  if (wrapper && trigger) {
    // Open/Close Dropdown Toggle
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      wrapper.classList.toggle('open');
    });

    // Option Selection
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Remove previous selected class
        options.forEach(opt => opt.classList.remove('selected'));
        
        // Apply selected state
        option.classList.add('selected');
        selectedText.textContent = option.textContent;
        hiddenInput.value = option.dataset.value;

        wrapper.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', () => {
      wrapper.classList.remove('open');
    });
  }
});
// Modal test open handler
const modal = document.getElementById('passengerModal');
const closeModalBtn = document.getElementById('closeModal');

// Call this function when user clicks "Book Seats" button
function openPassengerModal() {
  if (modal) modal.classList.add('active');
}

// Close modal event
if (closeModalBtn) {
  closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });
}