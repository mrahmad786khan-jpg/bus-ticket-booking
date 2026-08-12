/* ==========================================
   TravelGo - Search & Filter Logic
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Get query params from URL (from, to, date)
  const urlParams = new URLSearchParams(window.location.search);
  const from = urlParams.get("from") || "Mumbai";
  const to = urlParams.get("to") || "Goa";
  const date = urlParams.get("date") || "2026-08-15";

  // Update Header text
  const routeTitle = document.getElementById("routeTitle");
  const travelDate = document.getElementById("travelDate");
  if (routeTitle) routeTitle.textContent = `${from} ➔ ${to}`;
  if (travelDate) travelDate.textContent = date;

  // 2. Fetch Buses from Mock Database
  const allBuses = typeof getStoredBuses === 'function' ? getStoredBuses() : [];
  const container = document.getElementById("busResultsList");

  function renderBuses(busList) {
    if (!container) return;
    container.innerHTML = "";

    if (busList.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:40px;"><h3>No buses found for this route.</h3></div>`;
      return;
    }

    busList.forEach(bus => {
      const card = document.createElement("div");
      card.className = "bus-card";

      // FIXED HERE: Bus ID ke sath-sath date, from, aur to parameters URL me attach kiye gaye hain
      const seatSelectionUrl = `seat-selection.html?busId=${encodeURIComponent(bus.id)}&date=${encodeURIComponent(date)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

      card.innerHTML = `
        <div class="bus-info">
          <h3>${bus.name}</h3>
          <div class="bus-type">${bus.type} • ⭐ ${bus.rating}</div>
          <div class="bus-timing">
            <span>${bus.departureTime}</span>
            <span class="duration-badge">${bus.duration}</span>
            <span>${bus.arrivalTime}</span>
          </div>
        </div>
        <div class="bus-pricing">
          <div class="bus-price">₹${bus.price}</div>
          <a href="${seatSelectionUrl}" class="btn-select-seats">Select Seats</a>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // Filter matching route buses
  const filtered = allBuses.filter(
    b => b.from && b.to && b.from.toLowerCase() === from.toLowerCase() && b.to.toLowerCase() === to.toLowerCase()
  );

  // Initial Render (Fallback to all buses if route exact match not found)
  renderBuses(filtered.length > 0 ? filtered : allBuses);

  // Price Slider Event
  const priceRange = document.getElementById("priceRange");
  const priceValue = document.getElementById("priceValue");
  if (priceRange) {
    priceRange.addEventListener("input", (e) => {
      if (priceValue) priceValue.textContent = e.target.value;
      const filteredByPrice = allBuses.filter(b => b.price <= e.target.value);
      renderBuses(filteredByPrice);
    });
  }
});